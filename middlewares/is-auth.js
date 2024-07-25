module.exports = (req, res, next) => {
    if (!req.session.user) {
        req.flash("error", "Please login to access this page");
        return res.redirect("/login");
    }
    next();
    };