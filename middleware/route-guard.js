// check si el usuario esta logeado
const isLoggedIn = (req, res, next) => {
  if (!req.session.currentUser) {
    return res.redirect("/login");
  }
  next();
};

//Si el usuario esta logeado lo redirige al home
const isLoggedOut = (req, res, next) => {
  if (req.session.currentUser) {
    return res.redirect("/");
  }
  next();
};

//Exporto modulos
module.exports = {
  isLoggedIn,
  isLoggedOut,
};
