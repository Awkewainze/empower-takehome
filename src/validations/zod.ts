import z, { flattenError, prettifyError, treeifyError, ZodError, ZodType, type output } from "zod";
import type { Errors } from "./error";

export const zId = z.coerce.number()
    .positive();

export const zName = z.string()
    .min(1)
    .max(100);

export const zUsername = z.string()
    .min(3)
    .max(64)
    .toLowerCase()
    .regex(/^[\w\-]+$/, "Username must only contain alphabetical characters, numbers, underscores (_), or hyphens (-)");

export const zPassword = z.string()
    .min(8)
    .max(128)
    .regex(/[a-z]/, "Password must have at least 1 lowercase alphabetical character")
    .regex(/[A-Z]/, "Password must have at least 1 uppercase alphabetical character")
    .regex(/\d/, "Password must have at least 1 number")
    .regex(/[\W_]/, "Password must have at least 1 special character");

export const zLogin = z.object({
    username: zUsername,
    password: zPassword
});

export const zAccount = zLogin.extend({
    name: zName
});

export const zNote = z.object({
    name: z.string()
        .min(1)
        .max(100),
    body: z.string()
        .max(4000)
});

export function toValidationResponseBody<TSchema extends ZodType, TParseError extends ZodError<output<TSchema>>>(zodParseError: TParseError): Errors.ZodErrorResponse<TSchema> {
    return {
        error: "Validation Error",
        zodError: {
            pretty: prettifyError(zodParseError),
            flatten: flattenError(zodParseError),
            tree: treeifyError(zodParseError)
        }
    }
}
