import { useDateTimeFormatter } from "@/hooks";
import type { API } from "@/types";
import { Loading } from "./Loading";

export function NoteInfo({ note, displayType }: { note: API.Note, displayType: "Summary" | "Detailed" }) {
    const formatter = useDateTimeFormatter({ dateStyle: "short", timeStyle: "short" });

    return <div className="note-info">
        <div>Name: {note.name}</div>
        <div className={displayType === "Summary" ? "text-overflow-ellipis" : ""} >{note.body}</div>
        {displayType === "Detailed" && <div className="times">
            <div>
                <div>Created: {formatter.format(new Date(note.created_at))}</div>
                <div>Modified: {formatter.format(new Date(note.last_updated_at))}</div>
            </div>

        </div>}
    </div>
}