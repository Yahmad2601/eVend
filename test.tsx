// ... (all other imports remain the same)

// ... (mockTransactions and HomeProps interface remain the same)

// 👇 1. Add this helper function inside your Home component
const formatCurrency = (balance: string | null | undefined) => {
  const numericBalance = parseFloat(balance || "0");
  // This uses the browser's built-in number formatter to add commas
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericBalance);
};

export default function Home({
  isBalanceVisible,
  setIsBalanceVisible,
}: HomeProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  // ... (all other hooks, state, and functions remain the same)

  // ... (loading logic, conditional rendering for OTP/Card form remains the same)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white text-gray-800 sticky top-0 z-40 shadow-sm">
        {/* ... (header JSX remains the same) ... */}
      </header>

      <main className="container mx-auto p-4 md:p-6 space-y-8">
        {/* Balance Card */}
        <div className="bg-secondary text-white rounded-xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/20 rounded-full opacity-50"></div>
          <div className="absolute -bottom-8 -left-2 w-40 h-40 bg-primary/20 rounded-full opacity-50"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center text-sm text-white/80">
              <span>Available Balance</span>
              <button
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                className="flex items-center gap-2"
              >
                {isBalanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex justify-between items-end mt-2">
              <p className="text-4xl font-bold tracking-tight">
                {/* 👇 2. Use the new formatting function here */}
                {isBalanceVisible
                  ? `₦${formatCurrency(user?.walletBalance)}`
                  : "∗∗∗∗∗∗"}
              </p>
              <Link href="/top-up">
                <Button
                  as="a"
                  variant="outline"
                  className="bg-white/20 text-white hover:bg-white/30 border-white/30 shrink-0"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Top Up
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ... (rest of the home page JSX remains the same) ... */}
      </main>

      {/* ... (Modals remain the same) ... */}
    </div>
  );
}
