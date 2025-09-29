import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertTradeSchema, 
  insertPositionSchema, 
  insertRiskRulesSchema, 
  insertAuditLogSchema,
  type SpreadConfig 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for live data
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to websocket');
    
    // Send initial data
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to Orca Options live data feed'
    }));

    // Simulate live data updates
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'price_update',
          data: {
            SPY: 450.23 + (Math.random() - 0.5) * 2,
            TSLA: 242.15 + (Math.random() - 0.5) * 5,
            AAPL: 187.50 + (Math.random() - 0.5) * 3,
            timestamp: new Date().toISOString()
          }
        }));
      }
    }, 5000);

    ws.on('close', () => {
      clearInterval(interval);
      console.log('Client disconnected from websocket');
    });
  });

  // Account info
  app.get('/api/account', async (req, res) => {
    try {
      const account = await storage.getAccountInfo();
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch account info' });
    }
  });

  // Positions
  app.get('/api/positions', async (req, res) => {
    try {
      const positions = await storage.getPositions();
      res.json(positions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch positions' });
    }
  });

  app.post('/api/positions', async (req, res) => {
    try {
      const position = insertPositionSchema.parse(req.body);
      const created = await storage.createPosition(position);
      
      await storage.createAuditLog({
        eventType: 'POSITION_OPENED',
        details: `${created.symbol} ${created.strategy} ${created.sellStrike}/${created.buyStrike}`,
        userId: 'system',
        status: 'SUCCESS'
      });
      
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: 'Invalid position data' });
    }
  });

  app.post('/api/positions/:id/close', async (req, res) => {
    try {
      const { id } = req.params;
      const position = await storage.getPosition(id);
      if (!position) {
        return res.status(404).json({ error: 'Position not found' });
      }

      await storage.closePosition(id);
      
      await storage.createAuditLog({
        eventType: 'POSITION_CLOSED',
        details: `${position.symbol} ${position.strategy} closed`,
        userId: 'system',
        status: 'SUCCESS'
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to close position' });
    }
  });

  // Option chains
  app.get('/api/options/chain/:symbol/:expiration?', async (req, res) => {
    try {
      const { symbol, expiration } = req.params;
      const chain = await storage.getOptionChain(symbol, expiration);
      res.json(chain);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch option chain' });
    }
  });

  // Trade validation and submission
  app.post('/api/trades/validate', async (req, res) => {
    try {
      const spreadConfigSchema = z.object({
        symbol: z.string(),
        strategy: z.enum(['put_credit', 'call_credit']),
        sellLeg: z.object({
          strike: z.number(),
          type: z.enum(['call', 'put']),
          action: z.literal('sell'),
          premium: z.number(),
          delta: z.number(),
          openInterest: z.number()
        }),
        buyLeg: z.object({
          strike: z.number(),
          type: z.enum(['call', 'put']),
          action: z.literal('buy'),
          premium: z.number(),
          delta: z.number(),
          openInterest: z.number()
        }),
        quantity: z.number().positive(),
        expiration: z.string()
      });

      const spreadConfig = spreadConfigSchema.parse(req.body);
      const validation = await storage.validateTrade(spreadConfig);
      
      await storage.createAuditLog({
        eventType: 'TRADE_VALIDATE',
        details: `${spreadConfig.symbol} validation: ${validation.results.every(r => r.passed) ? 'PASSED' : 'FAILED'}`,
        userId: 'system',
        status: validation.results.every(r => r.passed) ? 'PASSED' : 'FAILED'
      });
      
      res.json(validation);
    } catch (error) {
      res.status(400).json({ error: 'Invalid trade configuration' });
    }
  });

  app.post('/api/trades/submit', async (req, res) => {
    try {
      console.log('Received trade data:', JSON.stringify(req.body, null, 2));
      
      // Transform the data to ensure correct types
      const transformedData = {
        ...req.body,
        expiration: new Date(req.body.expiration),
        sellStrike: req.body.sellStrike.toString(),
        buyStrike: req.body.buyStrike.toString(), 
        credit: req.body.credit.toString(),
        quantity: parseInt(req.body.quantity.toString())
      };
      
      console.log('Transformed data:', JSON.stringify(transformedData, null, 2));
      const trade = insertTradeSchema.parse(transformedData);
      const created = await storage.createTrade(trade);
      
      // Simulate trade execution
      setTimeout(async () => {
        await storage.updateTradeStatus(created.id, 'filled');
        
        // Create corresponding position
        await storage.createPosition({
          symbol: trade.symbol,
          strategy: trade.strategy,
          sellStrike: trade.sellStrike,
          buyStrike: trade.buyStrike,
          expiration: trade.expiration,
          quantity: trade.quantity,
          openCredit: trade.credit,
          currentValue: trade.credit, // Will be updated with market data
          delta: ((trade.sellStrike > trade.buyStrike ? -0.20 : 0.20) * trade.quantity).toString(), // Simplified
          marginRequired: (Math.abs(parseFloat(trade.sellStrike.toString()) - parseFloat(trade.buyStrike.toString())) * 100 * trade.quantity).toString()
        });
        
        await storage.createAuditLog({
          eventType: 'TRADE_FILLED',
          details: `${trade.symbol} ${trade.strategy} ${trade.sellStrike}/${trade.buyStrike} x${trade.quantity}`,
          userId: 'system',
          status: 'SUCCESS'
        });
      }, 1000);
      
      await storage.createAuditLog({
        eventType: 'TRADE_SUBMIT',
        details: `${trade.symbol} ${trade.strategy} ${trade.sellStrike}/${trade.buyStrike} x${trade.quantity}`,
        userId: 'system',
        status: 'PENDING'
      });
      
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: 'Invalid trade data' });
    }
  });

  // Risk rules
  app.get('/api/rules', async (req, res) => {
    try {
      const rules = await storage.getRiskRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch rules' });
    }
  });

  app.post('/api/rules', async (req, res) => {
    try {
      const rules = insertRiskRulesSchema.parse(req.body);
      const created = await storage.createOrUpdateRiskRules(rules);
      
      await storage.createAuditLog({
        eventType: 'RULES_UPDATE',
        details: `Risk rules updated: ${rules.name}`,
        userId: 'admin',
        status: 'APPLIED'
      });
      
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: 'Invalid rules configuration' });
    }
  });

  // Audit logs
  app.get('/api/logs', async (req, res) => {
    try {
      const logs = await storage.getAuditLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  return httpServer;
}
