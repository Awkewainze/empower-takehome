import { useState, useEffect, useCallback } from "react";
import { useAuthToken } from "./useAuthToken";
import type { Errors } from "@/validations";
import { HttpMethod, HttpStatus } from "@/utils/http";
import { fetchAuthenticated, NoOp } from "@/utils";
import { useNavigate } from "react-router";

export function useAuthenticatedApiRequest<TResponse extends object, TError extends Errors.ErrorResponse = Errors.ErrorResponse>(url: string, method: keyof typeof HttpMethod = "GET", data?: object, onSuccess?: (response: TResponse) => void, onError?: (error: TError) => void) {
    const { triggerFn, response, errorResponse, loading } = useCallbackAuthenticatedApiRequest<TResponse, TError>(url, method, data, onSuccess, onError);
    const [token] = useAuthToken();

    useEffect(() => {
        triggerFn();
    }, [token, method, url, data]);

    return { response, errorResponse, loading };
}

export function useCallbackAuthenticatedApiRequest<TResponse extends object, TError extends Errors.ErrorResponse = Errors.ErrorResponse>(url: string, method: keyof typeof HttpMethod = "GET", data?: object, onSuccess?: (response: TResponse) => void, onError?: (error: TError) => void) {
    const [response, setResponse] = useState<TResponse | null>(null);
    const [errorResponse, setErrorResponse] = useState<TError | null>(null);
    const [loading, setLoading] = useState(false);
    const [token] = useAuthToken();
    const navigate = useNavigate();

    const successCb = onSuccess ?? NoOp;
    const errorCb = onError ?? NoOp;

    async function fetchWithToken() {
        setResponse(null);
        setErrorResponse(null);
        setLoading(true);

        if (!token) {
            const errorObj = { error: "Token missing" } as TError;
            setErrorResponse(errorObj);
            setLoading(false);
            errorCb(errorObj);
            return;
        }
        
        const fetchResponse = await fetchAuthenticated(url, method, token, data);

        if (fetchResponse.ok) {
            const responseObj = await fetchResponse.json();
            setResponse(responseObj);
            setErrorResponse(null);
            setLoading(false);
            successCb(responseObj);
            return;
        }

        // token was denied by server, redirect to TokenInvalid page
        if (fetchResponse.status === HttpStatus.UNAUTHORIZED) {
            const errorObj = { error: "Token missing" } as TError;
            setErrorResponse(errorObj);
            setResponse(null);
            setLoading(false);
            errorCb(errorObj);
            navigate("/auth/token-invalid");
            return;
        }

        const errorObj = await fetchResponse.json();
        setErrorResponse(errorObj);
        setResponse(null);
        setLoading(false);
        errorCb(errorObj);
    }

    const triggerFn = useCallback(() => {
        fetchWithToken();
    }, [url, method, token, data]);


    return { triggerFn, response, errorResponse, loading };
}