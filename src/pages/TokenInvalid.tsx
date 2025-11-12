import { useAuthToken } from "@/hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useTimeout } from "usehooks-ts"

export function TokenInvalid() {
    const navigate = useNavigate();
    const [_, setToken] = useAuthToken();
    useEffect(() => {
        setToken(null);
    }, []);

    useTimeout(() => {
        navigate("/auth/login");
    }, 3000);

    return <div>
        You have been logged out, returning to login page...
    </div>
}