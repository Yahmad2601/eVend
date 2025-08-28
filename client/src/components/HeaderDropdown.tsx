import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Settings,
  User,
  LogOut,
  History,
  Wallet,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface ProfileDropdownProps {
  user: UserType;
  onLogout: () => void;
}

export function ProfileDropdown({ user, onLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="text-white hover:bg-white/20 p-2"
        data-testid="button-profile-dropdown"
      >
        <div className="flex items-center space-x-2">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="text-white w-5 h-5" />
            </div>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <p
              className="font-medium text-gray-900"
              data-testid="text-profile-name"
            >
              {user.firstName} {user.lastName}
            </p>
            <p
              className="text-sm text-gray-600"
              data-testid="text-profile-email"
            >
              {user.email}
            </p>
            <p
              className="text-sm text-primary font-semibold mt-1"
              data-testid="text-profile-balance"
            >
              Balance: ₦ {user.walletBalance}
            </p>
          </div>

          <div className="py-2">
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-500"
              data-testid="button-profile-view"
            >
              <User className="w-4 h-4 " />
              <span>View Profile</span>
            </button>

            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-500"
              data-testid="button-wallet-manage"
            >
              <Wallet className="w-4 h-4 " />
              <span>Manage Wallet</span>
            </button>

            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-500"
              data-testid="button-order-history"
            >
              <History className="w-4 h-4 " />
              <span>Order History</span>
            </button>

            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-500"
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4 " />
              <span>Settings</span>
            </button>

            <hr className="my-2" />

            <button
              onClick={onLogout}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-red-600"
              data-testid="button-logout-dropdown"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface MenuDropdownProps {
  onClose?: () => void;
}

export function MenuDropdown({ onClose }: MenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onClose?.();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="text-white hover:bg-white/20 p-2"
        data-testid="button-menu-dropdown"
      >
        <Menu className="text-white w-6 h-6" />
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
          <div className="py-2">
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-500"
              data-testid="button-menu-home"
            >
              <span>🏠</span>
              <span>Home</span>
            </button>

            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-500"
              data-testid="button-menu-drinks"
            >
              <span>🥤</span>
              <span>All Drinks</span>
            </button>

            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-500"
              data-testid="button-menu-orders"
            >
              <History className="w-4 h-4 text-gray-500" />
              <span>My Orders</span>
            </button>

            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-500"
              data-testid="button-menu-wallet"
            >
              <Wallet className="w-4 h-4 text-gray-500" />
              <span>Wallet</span>
            </button>

            <hr className="my-2" />

            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-red-500"
              data-testid="button-menu-help"
            >
              <HelpCircle className="w-4 h-4 text-red-500" />
              <span>Help & Support</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
