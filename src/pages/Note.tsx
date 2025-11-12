import { Loading, LoadingImage, NoteForm, NoteInfo } from "@/components";
import { useAuthenticatedApiRequest, useCurrentUser } from "@/hooks";
import type { API } from "@/types";
import { useState } from "react";
import { useParams } from "react-router";


export function Note() {
    const currentUser = useCurrentUser();
    const params = useParams();
    const { response: note, errorResponse: error, loading } = useAuthenticatedApiRequest<API.Note>(`/api/users/${currentUser?.userId}/notes/${params.id}`);
    
    const [mode, setMode] = useState<"View" | "Edit">("View");

    return (<div>
        <Loading loading={loading || !note}>
            { mode === "View" ? <><NoteInfo note={note!} displayType="Detailed" /><button onClick={() => void setMode("Edit")}>Edit</button></> : <NoteForm mode="Edit" existingNote={note!} /> }
        </Loading>
    </div>)
}
