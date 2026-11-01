
const pool = require("../config/database");
const bcrypt = require("bcryptjs");

// LOGIN ADMIN
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (
            typeof username !== "string" ||
            typeof password !== "string" ||
            !username.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Username dan password wajib diisi"
            });
        }

        // Cari admin berdasarkan username
        const result = await pool.query(
            `SELECT id::text, username, password_hash
             FROM public.admins
             WHERE username = $1`,
            [username.trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Username atau password salah"
            });
        }

        const admin = result.rows[0];

        // Verifikasi password dengan bcrypt
        const passwordValid = await bcrypt.compare(
            password,
            admin.password_hash
        );

        if (!passwordValid) {
            return res.status(401).json({
                message: "Username atau password salah"
            });
        }

        // Buat session baru setelah login berhasil
        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).json({
                    message: "Gagal membuat session"
                });
            }

            req.session.admin = {
                id: admin.id,
                username: admin.username
            };

            req.session.save((saveError) => {
                if (saveError) {
                    return res.status(500).json({
                        message: "Gagal menyimpan session"
                    });
                }

                return res.status(200).json({
                    message: "Login berhasil",
                    admin: req.session.admin
                });
            });
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};


// CEK STATUS LOGIN
const getMe = (req, res) => {
    if (!req.session.admin) {
        return res.status(401).json({
            message: "Anda belum login"
        });
    }

    return res.status(200).json({
        message: "Session aktif",
        admin: req.session.admin
    });
};


// LOGOUT ADMIN
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal logout"
            });
        }

        res.clearCookie("umkmpro.sid", {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });

        return res.status(200).json({
            message: "Logout berhasil"
        });
    });
};


module.exports = {
    login,
    getMe,
    logout
};
