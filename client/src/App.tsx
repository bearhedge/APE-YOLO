import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Trade from "@/pages/trade";
import Portfolio from "@/pages/portfolio";
import Rules from "@/pages/rules";
import Logs from "@/pages/logs";
import NotFound from "@/pages/not-found";
import AppHeader from "@/components/layout/app-header";
import MainNavigation from "@/components/layout/main-navigation";

function Router() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <MainNavigation />
      <main className="flex-1 overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/trade" component={Trade} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/rules" component={Rules} />
          <Route path="/logs" component={Logs} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
