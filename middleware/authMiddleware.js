
const requireAuth = (req, res, next) => {
    if (!req.session.admin) {
        return res.status(401).json({
            message: "Akses ditolak. Silakan login terlebih dahulu."
        });
    }

    next();
};

module.exports = requireAuth;
