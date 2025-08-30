import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface Transaction {
  id: string;
  type: "debit" | "credit";
  description: string;
  amount: number;
  date: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isBalanceVisible: boolean;
}

export default function TransactionHistory({
  transactions,
  isBalanceVisible,
}: TransactionHistoryProps) {
  const recentTx = transactions.length > 0 ? transactions[0] : null;

  return (
    <Card className="w-full bg-white shadow-sm border-gray-200/80">
      <CardContent className="p-0">
        {recentTx ? (
          <div className="flex items-center p-4">
            <div className="mr-4">
              {recentTx.type === "credit" ? (
                <ArrowUpCircle className="w-8 h-8 text-green-500" />
              ) : (
                <ArrowDownCircle className="w-8 h-8 text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">
                {recentTx.description}
              </p>
              <p className="text-sm text-gray-500">{recentTx.date}</p>
            </div>
            <p
              className={`font-bold ${
                recentTx.type === "credit" ? "text-green-500" : "text-gray-800"
              }`}
            >
              {isBalanceVisible
                ? `${
                    recentTx.type === "credit" ? "+" : "-"
                  }₦${recentTx.amount.toFixed(2)}`
                : "∗∗∗∗∗∗"}
            </p>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            No recent transactions.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
