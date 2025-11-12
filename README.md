# Empower Takehome Interview

## Getting started

### Shortlist to run

* Clone this repo
* Install [Bun runtime](https://bun.com)
* Install [Docker](https://docs.docker.com/compose/install/) (or my preferred [Podman](https://github.com/containers/podman-compose)) Compose
* `docker compose up db` -- This will use existing `.env` file to set up user + pass + database schema
* `bun run install` -- Installs npm dependencies
* `bun run db:init` -- Creates tables in MySQL db
* `bun run dev` -- Runs app, Bun automatically pulls in `.env` file, and uses it's `DATABASE_URL` to determine connection

### Install

* [Bun runtime](https://bun.com)
* MySQL
    * (Optionally) Using Docker Compose
        * `docker compose up db`
            * This will use the variables set in `.env`

### Install bun dependencies

```bash
bun install
```

### Set up database

Set environmental variable (can use .env file or manually set when using below commands)
`DATABASE_URL=mysql://user:password@hostname:port/schema`

Run initial migration

```bash
bun run db:init
```

### Development

To start a development server:

```bash
bun run dev
```

To run for production:

```bash
bun run start
```

If creating new files, recommended to run `bun run barrel` to update `index.ts` files


This project was created using `bun init` in bun v1.3.1. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
