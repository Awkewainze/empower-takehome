import { useCallback, useState } from "react";
import { Link } from "react-router";
import { zName, zPassword, zUsername } from "@/validations";
import z, { prettifyError } from "zod";
import { Loading } from "./Loading";

export type LoginProps = { formType: "Login", onSubmit: (username: string, password: string, setErrorText: (errorText: string) => void) => Promise<void> };
export type RegisterProps = { formType: "Register", onSubmit: (username: string, password: string, name: string, setErrorText: (errorText: string) => void) => Promise<void> }
export type LoginOrRegisterProps = LoginProps | RegisterProps;

export function LoginOrRegisterForm({ formType, onSubmit }: LoginOrRegisterProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [errorText, setErrorText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function preValidate(): Promise<boolean> {
        let zFormValidation = z.object({
            username: zUsername,
            password: zPassword
        });
        if (formType === "Register") {
            zFormValidation = zFormValidation.extend({
                name: zName
            });
        }

        const result = await zFormValidation.safeParseAsync({ username, password, name });
        if (result.success) {
            return true;
        }

        if (formType === "Login") {
            setErrorText("username or password is invalid");
        } else {
            setErrorText(prettifyError(result.error));
        }

        return false;
    }

    async function submit() {
        setSubmitting(true);
        if (!await preValidate()) {
            setSubmitting(false);
            return;
        }
        if (formType === "Login") {
            await onSubmit(username, password, setErrorText);
        } else {
            await onSubmit(username, password, name, setErrorText);
        }
        setSubmitting(false);
    }

    const useSubmit = useCallback(submit, [username, password, name, formType]);

    return (<>
        <Loading loading={submitting}>
            <div className="login">
                <form>
                    {formType === "Register" &&
                        <div>
                            <label htmlFor="name">Name</label>
                            <input type="text" name="name" id="name" value={name} onChange={e => void setName(e.target.value)} />
                        </div>
                    }
                    <div>
                        <label htmlFor="username">Username</label>
                        <input type="text" name="username" id="username" value={username} onChange={e => void setUsername(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" id="password" value={password} onChange={e => void setPassword(e.target.value)} />
                    </div>
                    {
                        formType === "Login" ?
                            <>
                                <div>
                                    <button type="submit" onClick={useSubmit} disabled={submitting}>Login</button>
                                </div>
                                <div><Link to="/auth/register">Create new user</Link></div>
                            </>
                            : <>
                                <div>
                                    <button type="submit" onClick={useSubmit} disabled={submitting}>Create new user</button>
                                </div>
                                <div><Link to="/auth/login">Login</Link></div>
                            </>
                    }
                    <div className="errorText display-linebreak">{errorText}</div>
                </form>
            </div>
        </Loading>
    </>

    )
}