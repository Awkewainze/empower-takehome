import { Loading, NoteInfo } from "@/components";
import { useAuthenticatedApiRequest, useCurrentUser } from "@/hooks"
import { useNavigate } from "react-router";
import newNoteIcon from "@/assets/new-note-icon.svg";

export function NotesList() {
    const currentUser = useCurrentUser();
    const { response, loading } = useAuthenticatedApiRequest(`/api/users/${currentUser?.userId}/notes`);

    const navigate = useNavigate();
    function gotoNote(id: number) {
        navigate("/notes/" + id);
    }

    async function createNew() {
        await navigate("/notes/new");
    }

    function getListBody() {
        if (!response || !Array.isArray(response)) {
            return null;
        }

        if (response.length === 0) {
            return <div className="align-center">You have no notes, create one from the button above!</div>;
        }
        return response.map(x => <div className="card" key={x.id} onClick={() => void gotoNote(x.id)}><NoteInfo key={x.id} note={x} displayType="Summary" /></div>);
    }

    return (
        <Loading loading={loading}>
            <div className="notes-list">
                <div>
                    <button title="Create new note" className={"icon"} onClick={createNew}>
                        <img src={newNoteIcon} />
                    </button>
                </div>
                {getListBody()}
            </div>
        </Loading>)
}
