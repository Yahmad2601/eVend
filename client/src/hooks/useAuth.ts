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

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refresh,
  };
}
