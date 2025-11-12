import { LoginOrRegisterForm } from "@/components";
import { useAuthToken } from "@/hooks";
import { extractErrorText } from "@/utils/api";
import { useEffect } from "react";
import { useNavigate } from "react-router";


export function Register() {
    const [authToken, setAuthToken] = useAuthToken();
    const navigate = useNavigate();

    useEffect(() => {
        if (authToken != null) {
            navigate("/");
        }
    }, [authToken]);

    async function onSubmit(username: string, password: string, name: string, setErrorText: (newErrorText: string) => void) {
        const response = await fetch("/api/auth/createAccount", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, username, password })
        });

        if (!response.ok) {
            setErrorText(await extractErrorText(response) ?? "")
            return;
        }
        const { token } = await response.json() as { token: string };
        setAuthToken(token);
    }

    return (<LoginOrRegisterForm formType="Register" onSubmit={onSubmit} />)
}
