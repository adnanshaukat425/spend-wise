import { isApiConfigured } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function useApiEnabled() {
  const { isAuthenticated } = useAuth();
  return isApiConfigured() && isAuthenticated;
}
