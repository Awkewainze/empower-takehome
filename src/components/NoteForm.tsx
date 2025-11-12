import { useAuthToken, useCallbackAuthenticatedApiRequest, useCurrentUser } from "@/hooks";
import type { API } from "@/types";
import { extractErrorText, HttpMethod } from "@/utils";
import { zNote } from "@/validations";
import { useCallback, useId, useState } from "react";
import { useNavigate } from "react-router";
import { prettifyError } from "zod";
import { Loading } from "./Loading";

export function NoteForm(props: { mode: "Edit", existingNote: API.Note } | { mode: "New" }) {
    const [name, setName] = useState<string>(props.mode === "Edit" ? props.existingNote.name : "");
    const [body, setBody] = useState<string>(props.mode === "Edit" ? props.existingNote.body : "");
    const [errorText, setErrorText] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const currentUser = useCurrentUser();

    const nameId = useId();
    const bodyId = useId();


    const noteId = props.mode === "Edit" ? props.existingNote.id : "";

    const endpointMap: Record<typeof props.mode, { url: string, method: keyof typeof HttpMethod }> = {
        "Edit": { url: `/api/users/${currentUser?.userId}/notes/${noteId}`, method: "PUT" },
        "New": { url: `/api/users/${currentUser?.userId}/notes`, method: "POST" }
    };

    const endpointInfo = endpointMap[props.mode];

    const navigate = useNavigate();
    const { triggerFn, loading } = useCallbackAuthenticatedApiRequest<API.Note>(endpointInfo.url, endpointInfo.method, { name, body }, response => {
        if (props.mode === "New") {
            navigate("/notes/" + response.id);
        } else {
            navigate("/notes/" + props.existingNote.id);
        }
    }, async errorResponse => {
        console.error("error response", errorResponse);
        setErrorText(await extractErrorText(errorResponse));
    });

    async function preValidate(): Promise<boolean> {
        const result = await zNote.safeParseAsync({ name, body });
        if (result.success) {
            return true;
        }

        setErrorText(prettifyError(result.error));
        return false;
    }

    const submit = useCallback(async () => {
        setSubmitting(true);
        if (!await preValidate()) {
            setSubmitting(false);
            return;
        }

        triggerFn();

        setSubmitting(false);
    }, [props.mode, name, body]);


    return <Loading loading={loading}>
        <div className="note-form">
            <form>
                <div>
                    <label htmlFor={nameId}>Name</label>
                    <input type="text" name="name" id={nameId} value={name} onChange={e => void setName(e.target.value)} />
                </div>
                <div>
                    <label htmlFor={bodyId}>Notes</label>
                    <textarea name="body" id={bodyId} value={body} onChange={e => void setBody(e.target.value)} />
                </div>

                <div>
                    <button type="button" onClick={e => { e.preventDefault(); navigate(-1); }} disabled={submitting}>Cancel</button>
                    <button type="submit" onClick={e => { e.preventDefault(); submit(); }} disabled={submitting}>Create new note</button>
                </div>
                <div className="errorText display-linebreak">{errorText}</div>
            </form>
        </div>
    </Loading>
}