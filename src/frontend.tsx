/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthRequired, Home, Layout, Login, Logout, NewNotePage, NotePage, NotesList, NotFoundPage, Register } from "@/pages";

import "./index.css";
import { TokenInvalid } from "./pages/TokenInvalid";

const elem = document.getElementById("root")!;
const app = (
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route element={<Layout />}>
					<Route path="auth">
						<Route path="register" element={<Register />} />
						<Route path="login" element={<Login />} />
						<Route element={<AuthRequired />}>
							<Route path="logout" element={<Logout />} />
						</Route>
						<Route path="token-invalid" element={<TokenInvalid />} />
					</Route>

					<Route element={<AuthRequired />}>
						<Route index element={<Home />} />
						<Route path="notes">
							<Route index element={<NotesList />} />
							<Route path="new" element={<NewNotePage />} />
							<Route path=":id" element={<NotePage mode="View" />} />
							<Route path=":id/edit" element={<NotePage mode="Edit" />} />
						</Route>
					</Route>
				</Route>
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>
);

if (import.meta.hot) {
	// With hot module reloading, `import.meta.hot.data` is persisted.
	const root = (import.meta.hot.data.root ??= createRoot(elem));
	root.render(app);
} else {
	// The hot module reloading API is not available in production.
	createRoot(elem).render(app);
}
