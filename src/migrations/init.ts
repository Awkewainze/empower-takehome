import { SQL } from "bun";

function checkForDatabaseConnectionString() {
    console.log("DATABASE_URL", process.env.DATABASE_URL);
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL env must be set!");
    }
}

async function createClient() {
    checkForDatabaseConnectionString();
    const client = new SQL();
    client.connect();

    if (client.options.adapter !== "mysql") {
        throw new Error("Database type must be MySQL");
    }

    return client;
}

async function up() {
    const client = await createClient();

    await client.begin(async tx => {
        await tx`CREATE TABLE IF NOT EXISTS user (id INT PRIMARY KEY AUTO_INCREMENT, username TINYTEXT NOT NULL, name TINYTEXT NOT NULL, password TINYTEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, last_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`;
        await tx`CREATE TABLE IF NOT EXISTS note (id INT AUTO_INCREMENT, user_id INT, name TINYTEXT NOT NULL, body TEXT(5000) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, last_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (id, user_id), FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE RESTRICT ON DELETE CASCADE)`;
    });

    await client.close();
}

await up();