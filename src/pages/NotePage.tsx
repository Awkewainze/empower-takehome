import { Loading, NoteForm, NoteInfo } from "@/components";
import { useAuthenticatedApiRequest, useAuthToken, useCurrentUser } from "@/hooks";
import type { API } from "@/types";
import { fetchAuthenticated } from "@/utils";
import { useNavigate, useParams } from "react-router";


export function NotePage({ mode }: { mode: "View" | "Edit" }) {
    const [token] = useAuthToken();
    const currentUser = useCurrentUser();
    const params = useParams();
    const { response: note, loading, manualSets: { setResponse } } = useAuthenticatedApiRequest<API.Note>(`/api/users/${currentUser?.userId}/notes/${params.id}`);

    const navigate = useNavigate();
    async function deleteFn() {
        if (window.confirm("are you sure you want to delete this note?")) {
            const response = await fetchAuthenticated(`/api/users/${currentUser?.userId}/notes/${params.id}`, "DELETE", token!);
            if (response.ok) {
                navigate("/notes");
            }
        }
    }

    return (<div>
        <Loading loading={loading || !note}>
            { mode === "View" ? <><NoteInfo note={note!} displayType="Detailed" /><button onClick={() => void navigate("./edit")}>Edit</button><button onClick={deleteFn}>Delete</button></> : <NoteForm mode="Edit" existingNote={note!} updateFn={setResponse} /> }
        </Loading>
    </div>)
}
