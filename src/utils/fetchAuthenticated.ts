import type { Errors } from "@/validations";
import type { HttpMethod } from "./http";

export async function fetchAuthenticated<TResponse extends object, TError extends Errors.ErrorResponse = Errors.ErrorResponse>(url: string, method: keyof typeof HttpMethod = "GET", token: string, data?: object) {
    return await fetch(url, {
        method,
        headers: {
            "Authorization": "Bearer " + token,
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: (data && JSON.stringify(data)) 
    });
}

