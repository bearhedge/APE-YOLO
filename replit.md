# Overview

Orca Options is a professional options trading platform built for managing credit spread strategies. The application focuses on SPY 0DTE (zero days to expiration) and weekly single option trades, providing real-time market data, portfolio management, risk rules enforcement, and comprehensive trade execution capabilities. The platform emphasizes risk management through configurable rules and provides detailed audit logging for all trading activities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React and TypeScript, using Vite as the build tool. The UI framework is shadcn/ui with Radix UI components and Tailwind CSS for styling. The application uses wouter for client-side routing and TanStack Query for server state management. Real-time data is handled through WebSocket connections for live market updates.

**Key Design Patterns:**
- Component-based architecture with reusable UI components
- Centralized state management through TanStack Query
- Real-time updates via WebSocket integration
- Responsive design with mobile-first approach

## Backend Architecture
The server is an Express.js application with TypeScript, following a REST API pattern. The architecture separates concerns with dedicated modules for database operations, route handling, and WebSocket management. The server provides both HTTP endpoints for standard operations and WebSocket connections for real-time market data.

**Core Components:**
- Express server with middleware for logging and error handling
- RESTful API endpoints for CRUD operations
- WebSocket server for live data streaming
- In-memory storage layer with interface-based design for future database integration

## Data Storage Solutions
The application uses Drizzle ORM with PostgreSQL as the primary database. The schema includes tables for users, positions, trades, risk rules, and audit logs. Currently, the storage layer implements an in-memory mock system that can be easily replaced with the actual database implementation.

**Database Schema:**
- Users table for authentication and user management
- Positions table for tracking open credit spreads
- Trades table for order management and execution history
- Risk rules table for configurable trading parameters
- Audit logs table for compliance and tracking

## Authentication and Authorization
The platform includes user authentication infrastructure with username/password-based login. Session management is implemented through connect-pg-simple for PostgreSQL session storage. The system supports user-specific data isolation and role-based access patterns.

## Trading System Design
The application implements a sophisticated options trading workflow with multiple validation layers. Trade execution follows a multi-step process: option chain analysis, spread building, risk validation, and order submission. The system supports both manual trade entry and automated rule-based validation.

**Trading Features:**
- Real-time option chain data with delta and open interest filtering
- Interactive spread builder for credit spreads
- Multi-layer trade validation against risk rules
- Order management with status tracking
- Position monitoring with real-time P&L updates

# External Dependencies

## Database Integration
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations with migration support
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI Framework and Styling
- **Radix UI**: Accessible, unstyled component primitives for complex UI elements
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

## State Management and Data Fetching
- **TanStack Query**: Server state management with caching, background updates, and optimistic updates
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation for type-safe data handling

## Development and Build Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static type checking for enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds

## Real-time Communication
- **WebSocket (ws)**: Native WebSocket implementation for real-time market data
- **Custom WebSocket hooks**: React integration for WebSocket connections

## Utility Libraries
- **date-fns**: Date manipulation and formatting
- **class-variance-authority**: Type-safe utility for managing CSS class variants
- **clsx**: Utility for constructing className strings conditionally