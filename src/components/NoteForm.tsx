import { useAuthToken, useCallbackAuthenticatedApiRequest, useCurrentUser } from "@/hooks";
import type { API } from "@/types";
import { extractErrorText, HttpMethod } from "@/utils";
import { zNote } from "@/validations";
import { useCallback, useId, useState } from "react";
import { Link, useNavigate } from "react-router";
import { prettifyError } from "zod";
import { Loading } from "./Loading";

export function NoteForm(props: { mode: "Edit", existingNote: API.Note, updateFn: (newNote: API.Note) => void } | { mode: "New" }) {
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
            props.updateFn(response);
            navigate("/notes/" + props.existingNote.id);
        }
    }, async errorResponse => {
        const extractedErrorText = await extractErrorText(errorResponse);
        console.error("error response", errorResponse, extractedErrorText);
        setErrorText(extractedErrorText);
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

    const cancelLocation = props.mode === "New" ? "/notes" : `/notes/${props.existingNote.id}`;


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
                <div className="errorText display-linebreak">{errorText}</div>
                <div>
                    <Link to={cancelLocation}>Cancel</Link>
                    <button type="submit" onClick={e => { e.preventDefault(); submit(); }} disabled={submitting}>{props.mode === "New" ? "Create new note" : "Edit note"}</button>
                </div>
            </form>
        </div>
    </Loading>
}