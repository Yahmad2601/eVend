import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, LogOut, Shield, FileText, LifeBuoy } from "lucide-react";
// No need to import anything for navigation here

export function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Page Header */}
      <header className="flex items-center p-4 bg-white shadow-sm sticky top-0 z-10">
        {/* This is the corrected line. 
          We use the browser's built-in history API to go back.
        */}
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
        <div className="w-10"></div> {/* Spacer to keep title centered */}
      </header>

      {/* Profile Information Section */}
      <div className="flex flex-col items-center p-6 bg-white border-b">
        <Avatar className="w-24 h-24 mb-4 text-3xl">
          <AvatarImage src={user?.profileImageUrl} alt={user?.name} />
          <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold">{user?.name}</h2>
      </div>

      {/* Menu Options */}
      <main className="flex-grow p-4">
        <ul className="space-y-3">
          <MenuItem
            icon={<Shield className="h-5 w-5 text-gray-600" />}
            label="Security"
          />
          <MenuItem
            icon={<FileText className="h-5 w-5 text-gray-600" />}
            label="Statement & Reports"
          />
          <MenuItem
            icon={<LifeBuoy className="h-5 w-5 text-gray-600" />}
            label="Service & Support"
          />
        </ul>
      </main>

      {/* Logout Button at the bottom */}
      <footer className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={logout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Log out
        </Button>
      </footer>
    </div>
  );
}

// Reusable Menu Item Component
function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li>
      <button className="flex items-center w-full p-4 text-left bg-white rounded-lg shadow-sm transition-colors hover:bg-gray-100">
        {icon}
        <span className="ml-4 font-medium text-gray-800">{label}</span>
      </button>
    </li>
  );
}
