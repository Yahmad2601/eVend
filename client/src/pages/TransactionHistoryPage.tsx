import { useState } from "react";
import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Transaction } from "@/components/TransactionHistory";

// ... (mock data remains the same)
const allMockTransactions: Transaction[] = [
  {
    id: "1",
    type: "debit",
    description: "Coca-Cola Purchase",
    amount: 150.0,
    date: "29 Aug, 2025",
  },
  {
    id: "2",
    type: "credit",
    description: "Wallet Top-up",
    amount: 1000.0,
    date: "28 Aug, 2025",
  },
  {
    id: "3",
    type: "debit",
    description: "Fanta Purchase",
    amount: 150.0,
    date: "27 Aug, 2025",
  },
  {
    id: "4",
    type: "debit",
    description: "Sprite Purchase",
    amount: 150.0,
    date: "26 Aug, 2025",
  },
  {
    id: "5",
    type: "credit",
    description: "Wallet Top-up",
    amount: 500.0,
    date: "25 Aug, 2025",
  },
  {
    id: "6",
    type: "debit",
    description: "Water Purchase",
    amount: 100.0,
    date: "24 Aug, 2025",
  },
  {
    id: "7",
    type: "debit",
    description: "Pepsi Purchase",
    amount: 150.0,
    date: "23 Aug, 2025",
  },
];

const TransactionItem = ({
  tx,
  isVisible,
}: {
  tx: Transaction;
  isVisible: boolean;
}) => (
  <li className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200/80">
    <div className="mr-4">
      {tx.type === "credit" ? (
        <ArrowUpCircle className="w-8 h-8 text-green-500" />
      ) : (
        <ArrowDownCircle className="w-8 h-8 text-red-500" />
      )}
    </div>
    <div className="flex-1">
      <p className="font-semibold text-gray-800">{tx.description}</p>
      <p className="text-sm text-gray-500">{tx.date}</p>
    </div>
    <p
      className={`font-bold ${
        tx.type === "credit" ? "text-green-500" : "text-gray-800"
      }`}
    >
      {isVisible
        ? `${tx.type === "credit" ? "+" : "-"}₦${tx.amount.toFixed(2)}`
        : "∗∗∗∗∗∗"}
    </p>
  </li>
);

// 1. Define the props this page will now receive.
interface TransactionHistoryPageProps {
  isBalanceVisible: boolean;
  setIsBalanceVisible: (visible: boolean) => void;
}

export default function TransactionHistoryPage({
  isBalanceVisible,
  setIsBalanceVisible,
}: TransactionHistoryPageProps) {
  const [filter, setFilter] = useState("all");

  const filteredTransactions = allMockTransactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-secondary text-white sticky top-0 z-40 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/home">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Transaction History</h1>
          </div>
          <Button
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            {isBalanceVisible ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <Tabs defaultValue="all" onValueChange={setFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="credit">Credit</TabsTrigger>
            <TabsTrigger value="debit">Debit</TabsTrigger>
          </TabsList>
          <TabsContent value={filter}>
            {filteredTransactions.length > 0 ? (
              <ul className="space-y-3">
                {filteredTransactions.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    tx={tx}
                    isVisible={isBalanceVisible}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-16">
                No transactions found for this filter.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
