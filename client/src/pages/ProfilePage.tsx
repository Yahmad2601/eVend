import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  LogOut,
  Shield,
  FileText,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

// Reusable component for menu items
function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center w-full p-4 text-left bg-white rounded-lg shadow-sm transition-all duration-200 hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="flex items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full">
        {icon}
      </div>
      <span className="flex-grow font-medium text-gray-800">{label}</span>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}

export function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Page Header */}
      <header className="flex items-center p-4 bg-white shadow-sm sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold text-center flex-grow">
          My Profile
        </h1>
        <div className="w-10"></div>
      </header>

      {/* Profile Information Section */}
      <div className="flex flex-col items-center p-6 bg-white border-b text-center">
        {/* This now uses the secondary color for the border */}
        <Avatar className="w-24 h-24 mb-4 text-3xl border-4 border-secondary">
          <AvatarImage
            src={user?.profileImageUrl ?? undefined}
            alt={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()}
          />
          <AvatarFallback className="bg-gray-200 text-gray-600">
            {user?.firstName?.[0]}
            {/* {user?.lastName?.[0]} */}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold text-gray-900">
          {user?.firstName} {user?.lastName}
        </h2>
        <p className="text-gray-500">{user?.email}</p>
      </div>

      {/* Menu Options */}
      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto space-y-3">
          {/* Icons now use the secondary text color */}
          <MenuItem
            icon={<Shield className="h-5 w-5 text-secondary" />}
            label="Security"
          />
          <MenuItem
            icon={<FileText className="h-5 w-5 text-secondary" />}
            label="Statement & Reports"
          />
          <MenuItem
            icon={<HelpCircle className="h-5 w-5 text-secondary" />}
            label="Service & Support"
          />
        </div>
      </main>

      {/* Logout Button */}
      <footer className="p-4">
        <div className="max-w-md mx-auto">
          <Button
            variant="outline"
            className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-12 text-base font-semibold transition-colors"
            onClick={logout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Log out
          </Button>
        </div>
      </footer>
    </div>
  );
}
