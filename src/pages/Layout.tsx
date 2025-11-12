import { UserInfo } from "@/components";
import { useIsLoggedIn } from "@/hooks";
import { NavLink, Outlet } from "react-router";

export function Layout() {
	const isLoggedIn = useIsLoggedIn();

	return (
		<>
			{isLoggedIn && <>
				<header>
					<nav>
						<NavLink to="/" end>
							Home
						</NavLink>
						<NavLink to="/notes" end>
							Notes
						</NavLink>
					</nav>
					<UserInfo />
				</header>
			</>}
			<main>
				<Outlet />
			</main>
		</>
	);
}