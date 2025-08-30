import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Transaction } from "@/components/TransactionHistory"; // Re-using the Transaction type

// Expanded mock data for a full history page
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

const TransactionItem = ({ tx }: { tx: Transaction }) => (
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
      {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toFixed(2)}
    </p>
  </li>
);

export default function TransactionHistoryPage() {
  const [filter, setFilter] = useState("all");

  const filteredTransactions = allMockTransactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-secondary text-white sticky top-0 z-40 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
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
                  <TransactionItem key={tx.id} tx={tx} />
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
