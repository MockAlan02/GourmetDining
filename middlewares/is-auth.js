function redirectBasedOnRole(req, res) {
  const roleRoutes = {
    admin: "/admin",
    customer: "/customer",
    delivery: "/delivery",
  };

  const role = req.session.user.role;
  console.log(role);
  if (roleRoutes[role]) {
    return res.redirect(roleRoutes[role]);
  } else {
    req.flash("error", "Rol no reconocido");
    return res.redirect("/login");
  }
}

function isAuth(req, res, next) {
  console.log(req.path);
  if (req.session.user) {
    return next();
  }
  
  req.flash("error", "Debes iniciar sesión para acceder a esta página");
  return res.redirect("/login");
}

function isNotAuth(req, res, next) {
  if (!req.session.user) {
    return next();
  }
  req.flash("error", "Por favor, cierra sesión para acceder a esta página");
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (req.session.user.role === role) {
      return next();
    } else {
      req.flash("error", "No tienes permiso para acceder a esta página");
      return redirectBasedOnRole(req, res);
    }
  };
}

module.exports = {
  isAuth,
  isNotAuth,
  authorizeRole,
  redirectBasedOnRole,
};
