
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const bcrypt = require("bcryptjs");
const pool = require("./db");

async function createAdmin() {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password || password.length < 12) {
        throw new Error(
            "ADMIN_USERNAME harus diisi dan ADMIN_PASSWORD minimal 12 karakter."
        );
    }

    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await pool.query(schema);

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
        `INSERT INTO admins (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username)
     DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [username, passwordHash]
    );

    console.log(`Akun admin "${username}" berhasil disiapkan.`);
    const info = await pool.query(
  "SELECT current_database() AS db, current_schema() AS schema, inet_server_port() AS port, (SELECT COUNT(*) FROM admins) AS total"
);
console.log(info.rows[0]);
}

createAdmin()
    .catch((error) => {
        console.error("Gagal membuat akun admin:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
