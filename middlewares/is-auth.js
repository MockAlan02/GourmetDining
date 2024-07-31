module.exports = {
  isAuth(req, res, next) {

    if (!req.session.user && req.path !== "/login" || req.path !== "/") {
      req.flash("error", req.path);
      //req.flash("error", "Please login to access this page");
      return res.redirect("/login");
    }
    next();

  },
  redirectBasedOnRole(req, res, next) {
    const roleRoutes = {
      admin: "/admin",
      customer: "/customer",
      delivery: "/delivery",
    };

    const role = req.session.user.role;
    if (roleRoutes[role]) {
      return res.redirect(roleRoutes[role]);
    } else {
      return res.status(400).send("Rol no reconocido");
    }
  },
    authorizeRole(role) {
    return (req, res, next) => {
      if (req.session.user && req.session.user.role === role) {
        next();
      } else {
        res.status(403).send('No tienes permiso para acceder a este recurso');
      }
    };
  }
};
