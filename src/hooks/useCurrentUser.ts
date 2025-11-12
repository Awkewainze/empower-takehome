import type { OurJWT } from "@/types";
import { useAuthToken } from "./useAuthToken";
import { decodeJwt } from "jose";

export function useCurrentUser(): OurJWT | null {
    const [token] = useAuthToken();

    if (!token) {
        return null;
    }
    return decodeJwt(token);
}
