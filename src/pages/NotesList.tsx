import { Loading, LoadingImage, NoteInfo } from "@/components";
import { useAuthenticatedApiRequest, useCurrentUser } from "@/hooks"
import { useNavigate } from "react-router";

export function NotesList() {
    const currentUser = useCurrentUser();
    const { response, errorResponse, loading } = useAuthenticatedApiRequest(`/api/users/${currentUser?.userId}/notes`);

    const navigate = useNavigate();
    function gotoNote(id: number) {
        navigate("/notes/" + id);
    }

    async function createNew() {
        await navigate("/notes/new");
    }

    return (
        <Loading loading={loading}>
            <div className="notes-list">
                <div><button onClick={createNew}>Create new</button></div>
                {(response && Array.isArray(response)) && response.map(x => <div key={x.id} onClick={() => void gotoNote(x.id)}><NoteInfo key={x.id} note={x} displayType="Summary" /></div>)}
            </div>
        </Loading>)
}
