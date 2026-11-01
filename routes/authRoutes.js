
const express = require("express");
const router = express.Router();

const {
    login,
    getMe,
    logout,
    healthcheck
} = require("../controllers/controllers");

router.post("/login", login);
router.get("/me", getMe);
router.post("/logout", logout);
router.get("/health", healthcheck);

module.exports = router;
