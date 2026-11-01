
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const pool = require("./config/database");
const productRoutes = require("./routes/productRoutes");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);

const authRoutes = require("./routes/authRoutes");
const requireAuth = require("./middleware/authMiddleware");



const app = express();

app.use(helmet());
app.use(express.json());

app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: "user_sessions",
        createTableIfMissing: true
    }),

    name: "umkmpro.sid",

    secret: process.env.SESSION_SECRET,

    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 8
    }
}));

app.use("/api/auth", authRoutes);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.use("/api/products", requireAuth, productRoutes);

// Menyajikan file frontend
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            success: true,
            message: "Server and database are connected",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`UMKMPro server running on port ${PORT}`);
});
