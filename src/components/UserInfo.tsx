import { useCurrentUser } from "@/hooks";
import { Link } from "react-router";

export function UserInfo() {
    const currentUser = useCurrentUser();

    return <>
        {currentUser && <div className="justify-center-down">
            <div>Hello {currentUser.name}!</div>
            <div>{currentUser.username}</div>
            <Link to="/auth/logout">Log out</Link>
        </div>}
    </>
}