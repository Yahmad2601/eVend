import { useState } from "react";
import { Switch, Route } from "wouter";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import TransactionHistoryPage from "@/pages/TransactionHistoryPage";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function App() {
  // 1. Manage the visibility state here, in the parent component.
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />

        {/* 2. Pass the state and the function to change it down to the pages that need it. */}
        <Route path="/home">
          <Home
            isBalanceVisible={isBalanceVisible}
            setIsBalanceVisible={setIsBalanceVisible}
          />
        </Route>
        <Route path="/history">
          <TransactionHistoryPage
            isBalanceVisible={isBalanceVisible}
            setIsBalanceVisible={setIsBalanceVisible}
          />
        </Route>

        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}
