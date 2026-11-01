
const pool = require("./config/database");
const bcrypt = require("bcryptjs");

async function checkPassword() {
    try {
        const result = await pool.query(
            `SELECT password_hash
             FROM public.admins
             WHERE username = $1`,
            ["admin"]
        );

        if (result.rows.length === 0) {
            console.log("Admin tidak ditemukan");
            return;
        }

        const hash = result.rows[0].password_hash;

        const isMatch = await bcrypt.compare("umkm123", hash);

        console.log("Password cocok:", isMatch);

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await pool.end();
    }
}

checkPassword();
