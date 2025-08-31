import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

  // --- ADD THIS FUNCTION ---
  // This simply redirects to the server's logout endpoint.
  // The server will then clear the session cookie.
  const logout = () => {
    window.location.href = "/api/logout";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refresh,
    logout,
  };
}
