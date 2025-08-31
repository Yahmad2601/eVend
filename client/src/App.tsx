import { useState } from "react";
import { Switch, Route, Redirect } from "wouter";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import { ProfilePage } from "./pages/ProfilePage";
import TransactionHistoryPage from "@/pages/TransactionHistoryPage";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { RefreshCw } from "lucide-react";
import { TopUpPage } from "./pages/TopUpPage";

// This internal component holds the routing logic
function AppRoutes() {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();

  // Show a loading screen while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-12 w-12 animate-spin text-secondary" />
      </div>
    );
  }

  // Define your private routes
  const privateRoutes = (
    <>
      <Route path="/home">
        <Home
          isBalanceVisible={isBalanceVisible}
          setIsBalanceVisible={setIsBalanceVisible}
        />
      </Route>
      <Route path="/profile" component={ProfilePage} />
      <Route path="/history">
        <TransactionHistoryPage
          isBalanceVisible={isBalanceVisible}
          setIsBalanceVisible={setIsBalanceVisible}
        />
      </Route>
      {/* 👇 Add the new TopUpPage route here */}
      <Route path="/top-up" component={TopUpPage} />
    </>
  );

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />

      {/* If authenticated, show private routes. Otherwise, redirect all of them to login. */}
      {isAuthenticated ? privateRoutes : <Redirect to="/login" />}

      <Route component={NotFound} />
    </Switch>
  );
}

// The main App component sets up the providers
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <Toaster />
    </QueryClientProvider>
  );
}
