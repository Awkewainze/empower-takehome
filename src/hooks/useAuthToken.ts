import { useLocalStorage } from "usehooks-ts";

export function useAuthToken() {
    return useLocalStorage<string | null>("auth-token-jwt", null);
}
