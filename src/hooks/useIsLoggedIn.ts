import { useAuthToken } from "./useAuthToken";

export function useIsLoggedIn() {
    const [authToken] = useAuthToken();
    
    return authToken !== null;
}