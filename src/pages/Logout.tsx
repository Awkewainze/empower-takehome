import { LoadingImage } from "@/components";
import { useAuthToken } from "@/hooks";
import { useEffect } from "react";


export function Logout() {
    const [_, setAuthToken] = useAuthToken();
    useEffect(() => {
        setAuthToken(null);
    }, []);

    return <LoadingImage />
}