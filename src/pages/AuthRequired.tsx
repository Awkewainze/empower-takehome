import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { LoadingImage } from "@/components";
import { useIsLoggedIn } from "@/hooks";

export function AuthRequired() {
    const isLoggedIn = useIsLoggedIn()
    const navigate = useNavigate();
    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/auth/login");
        }
    }, [isLoggedIn]);

    return <>
        { isLoggedIn ? <Outlet /> : <LoadingImage /> }
    </>;
}