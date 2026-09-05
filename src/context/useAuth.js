import { useContext } from "react";
import { AuthContext } from "./auth-state";

export function useAuth() {
  return useContext(AuthContext);
}
