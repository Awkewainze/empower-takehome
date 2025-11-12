# Empower Takehome Interview

## Getting started

### Install

* [Bun runtime](https://bun.com)
* MySQL
    * (Optionally) Using Docker Compose
        * `docker compose up db`
            * `MYSQL_ROOT_PASSWORD` environmental variable must be set
    * Manually created schema before running the app

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
