
const express = require("express");
const router = express.Router();

const {
    login,
    getMe,
    logout
} = require("../controllers/controllers");

router.post("/login", login);
router.get("/me", getMe);
router.post("/logout", logout);

module.exports = router;
