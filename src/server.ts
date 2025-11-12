import { serve, SQL } from "bun";
import { CompactSign, compactVerify, generateSecret } from "jose";
import index from "./index.html";
import { ZodType, flattenError, prettifyError, type output } from "zod";
import { BadRequest, Created, Unauthorized, NoContent, NotFound, Ok, BadValidation } from "@/utils/api";
import type { OurJWT } from "@/types";
import { zAccount, zId, zLogin, zNote } from "@/validations/zod";

// Connect to MySQL server using DATABASE_URL env (see Bun docs for more information if desired https://bun.com/docs/runtime/sql)
const mysql = new SQL();

// New signing secret, will be regenerated on each launch, production app should store this (in a secure location)
const jwtSecret = await generateSecret("HS256");

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function encodeOurJWT(userToken: OurJWT): Promise<string> {
	const encoded = encoder.encode(JSON.stringify(userToken));
	return await new CompactSign(encoded).setProtectedHeader({ alg: "HS256" }).sign(jwtSecret);
}

async function decodeOurJWT(token: string): Promise<OurJWT> {
	const result = await compactVerify(token, jwtSecret);
	return JSON.parse(decoder.decode(result.payload)) as OurJWT;
}

export async function ensureAuthorized<T extends Bun.BunRequest>(req: T, authFunction: (token: OurJWT) => Promise<boolean>, next: (token: OurJWT) => Promise<Response>): Promise<Response> {
	const tokenWithBearer = req.headers.get("Authorization");

	if (!tokenWithBearer) {
		return Unauthorized();
	}

	const bearerRemoved = tokenWithBearer.replace("Bearer ", "");

	try {
		const jwt = await decodeOurJWT(bearerRemoved);
		if (await authFunction(jwt)) {
			return next(jwt);
		}

		return NotFound();
	} catch (error) {
		return Unauthorized();
	}
}

export async function zParseOrBadRequest<TSchema extends ZodType>(schema: TSchema, data: unknown, overrideResponse?: Response): Promise<{ isValid: true, result: output<TSchema> } | { isValid: false, response: Response }> {
	const parseResult = await schema.safeParseAsync(data);
	if (parseResult.success) {
		return { isValid: true, result: parseResult.data };
	}

	return { isValid: false, response: BadValidation(parseResult.error)};
}

export const server = serve({
	routes: {
		"/api/users/:userId": {
			// Get user
			async GET(req) {
				const result = await zParseOrBadRequest(zId, req.params.userId, BadValidation("Invalid userId"));
				if (!result.isValid) {
					return result.response;
				}
				const userId = result.result;

				return ensureAuthorized(req,
					async (token) => token.userId === userId,
					async () => {
						const user = (await mysql`SELECT id, name, username FROM user WHERE id = ${userId} LIMIT ${1}`);
						// Should always have 1 response
						return Response.json(user.length > 0 ? user[0] : null);
					}
				)
			}
		},

		"/api/users/:userId/notes": {
			// List user notes
			async GET(req) {
				const result = await zParseOrBadRequest(zId, req.params.userId, BadValidation("Invalid userId"));
				if (!result.isValid) {
					return result.response;
				}
				const userId = result.result;

				return ensureAuthorized(req,
					async (token) => token.userId === userId,
					async () => {
						const notes = (await mysql`SELECT id, name, body FROM note WHERE user_id = ${userId} LIMIT ${100}`);
						return Response.json(notes);
					}
				)
			},

			// Create new note
			async POST(req) {
				const result = await zParseOrBadRequest(zId, req.params.userId, BadValidation("Invalid userId"));
				if (!result.isValid) {
					return result.response;
				}
				const userId = result.result;

				return ensureAuthorized(req,
					async (token) => token.userId === userId,
					async () => {
						const zNoteResult = await zParseOrBadRequest(zNote, await req.json());

						if (!zNoteResult.isValid) {
							return zNoteResult.response;
						}

						const { name, body } = zNoteResult.result;

						const [newNote] = await mysql.begin(async tx => {
							await tx`INSERT INTO note (user_id, name, body) VALUES (${userId}, ${name}, ${body});`;
							const [{ id: newNoteId }] = await tx`SELECT LAST_INSERT_ID() AS id;`;

							return await tx`SELECT * FROM note WHERE user_id = ${userId} AND id = ${newNoteId}`;
						});


						return Created(newNote);
					}
				);
			}
		},

		"/api/users/:userId/notes/:noteId": {
			// Get user note
			async GET(req) {
				const userIdResult = await zParseOrBadRequest(zId, req.params.userId, BadValidation("Invalid userId"));
				if (!userIdResult.isValid) {
					return userIdResult.response;
				}
				const userId = userIdResult.result;

				const noteIdResult = await zParseOrBadRequest(zId, req.params.noteId, BadValidation("Invalid noteId"));
				if (!noteIdResult.isValid) {
					return noteIdResult.response;
				}
				const noteId = noteIdResult.result;

				return ensureAuthorized(req,
					async (token) => token.userId === userId,
					async () => {
						const results = await mysql`SELECT * FROM note WHERE user_id = ${userId} AND id = ${noteId}`;

						if (results.length === 0) {
							return NotFound();
						}

						return Ok(results[0])
					}
				);
			},

			// Update note
			async PUT(req) {
				const userIdResult = await zParseOrBadRequest(zId, req.params.userId, BadValidation("Invalid userId"));
				if (!userIdResult.isValid) {
					return userIdResult.response;
				}
				const userId = userIdResult.result;

				const noteIdResult = await zParseOrBadRequest(zId, req.params.noteId, BadValidation("Invalid noteId"));
				if (!noteIdResult.isValid) {
					return noteIdResult.response;
				}
				const noteId = noteIdResult.result;

				return ensureAuthorized(req,
					async (token) => token.userId === userId,
					async () => {
						const zNoteResult = await zParseOrBadRequest(zNote, await req.json());

						if (!zNoteResult.isValid) {
							return zNoteResult.response;
						}

						const { name, body } = zNoteResult.result;
						await mysql`UPDATE note SET name = ${name}, body = ${body} WHERE id = ${noteId} AND user_id = ${userId}`;
						const [newNote] = await mysql`SELECT * FROM note WHERE id = ${noteId} AND user_id = ${userId}`;

						return Ok(newNote);
					}
				);
			},

			// Delete note
			async DELETE(req) {
				const userIdResult = await zParseOrBadRequest(zId, req.params.userId, BadValidation("Invalid userId"));
				if (!userIdResult.isValid) {
					return userIdResult.response;
				}
				const userId = userIdResult.result;

				const noteIdResult = await zParseOrBadRequest(zId, req.params.noteId, BadValidation("Invalid noteId"));
				if (!noteIdResult.isValid) {
					return noteIdResult.response;
				}
				const noteId = noteIdResult.result;

				return ensureAuthorized(req,
					async (token) => token.userId === userId,
					async () => {
						await mysql`DELETE FROM note WHERE id = ${noteId} AND user_id = ${userId};`;
						return NoContent();
					}
				);
			}
		},

		"/api/auth/createAccount": {
			async POST(req) {
				const zAccountResult = await zParseOrBadRequest(zAccount, await req.json());

				if (!zAccountResult.isValid) {
					return zAccountResult.response;
				}

				const { username, name, password } = zAccountResult.result;
				try {
					const [userInfo] = await mysql.begin(async tx => {
						const userNameExists = (await tx`SELECT 1 FROM user WHERE username = ${username} LIMIT ${1}`).length > 0;
						if (userNameExists) {
							throw new Error("username is taken");
						}

						const hashedPassword = await Bun.password.hash(password, { algorithm: "argon2id" });

						await tx`INSERT INTO user (username, name, password) VALUES (${username}, ${name}, ${hashedPassword});`;
						const [{ id: newUserId }] = await tx`SELECT LAST_INSERT_ID() AS id;`;

						return await tx`SELECT id as userId, username, name FROM user WHERE id = ${newUserId}`;
					});

					return Created({ token: await encodeOurJWT(userInfo) });
				} catch (error: any) {
					return BadRequest({ error: error?.message });
				}
			}
		},

		"/api/auth/login": {
			async POST(req) {
				const zLoginResult = await zParseOrBadRequest(zLogin, await req.json());

				if (!zLoginResult.isValid) {
					return zLoginResult.response;
				}

				const { username, password } = zLoginResult.result;
				const userResult = await mysql`SELECT * FROM user WHERE username = ${username} LIMIT ${1}`;

				if (userResult.length === 0 || !(await Bun.password.verify(password, userResult[0].password, "argon2id"))) {
					return Response.json({ error: "username or password is invalid" }, { status: 403 });
				}

				const token = await encodeOurJWT({
					userId: userResult[0].id,
					username: userResult[0].username,
					name: userResult[0].name
				});
				return Ok({ token });
			}
		},

		// Invalid api call
		"/api/*": async () => {
			return NotFound();
		},

		// Serve index.html for all unmatched routes.
		"/*": index,
	},

	development: process.env.NODE_ENV !== "production" && {
		// Enable browser hot reloading in development
		hmr: true,

		// Echo console logs from the browser to the server
		console: true,
	},
});

console.log(`🚀 Server running at ${server.url}`);
