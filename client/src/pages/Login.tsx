import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiRequest("POST", "/api/login", credentials);
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/home");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden"
      style={{ backgroundColor: "#E5DDD5" }}
    >
      <div
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='gray' fill-opacity='0.07'%3E%3Cpath transform='translate(50 30) scale(1.5)' d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3Cpath transform='translate(150 80) scale(1.8) rotate(15)' d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63-7.19.61 5.46 4.73L5.82 21z'/%3E%3Cpath transform='translate(220 200) scale(2)' d='M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'/%3E%3Cpath transform='translate(40 250) rotate(-20) scale(1.5)' d='M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z'/%3E%3Cg transform='translate(100 180) scale(1.2)'%3E%3Ccircle cx='12' cy='12' r='10' stroke='gray' stroke-width='1.5' fill='none'/%3E%3Ccircle cx='9' cy='10' r='1'/%3E%3Ccircle cx='15' cy='10' r='1'/%3E%3Cpath d='M9 14 C10 16, 14 16, 15 14' stroke='gray' stroke-width='1.5' fill='none'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="relative z-10 w-full max-w-sm bg-white rounded-lg shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary">eVend Login</h1>
          <p className="text-gray-500 mt-2">Welcome back!</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Username"
              className="h-12 text-base bg-gray-50"
            />
          </div>
          <div className="space-y-2 relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Password"
              className="h-12 text-base bg-gray-50 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-secondary"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : "LOG IN"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <a
            href="#/forgot-password"
            className="text-secondary hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-500">New user? </span>
          <a
            href="#/signup"
            className="font-semibold text-secondary hover:underline"
          >
            Sign up now
          </a>
        </div>
      </div>
    </div>
  );
}
