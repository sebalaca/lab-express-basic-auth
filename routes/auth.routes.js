const { Router } = require('express');
const router = new Router();

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const saltRounds = 10;

const User = require('../models/User.model');

const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');

router.get('/signup', isLoggedOut, (req, res) => res.render('auth/signup'));

//Creamos Usuario - SingUp
router.post('/signup', isLoggedOut, (req, res, next) => {
    // console.log("The form data: ", req.body);
   
    //Verifica que los campos username y password esten completos o tengan valores
    const { username, password } = req.body;
    if (!username || !password) {
      res.render('auth/signup', { errorMessage: 'All fields are mandatory. Please provide your username and password.' });
      return;
    }
    //Verifica la fortaleza de la contraseña
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!regex.test(password)) {
      res
        .status(500)
        .render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
      return;
    }
   //Encripta contraseña
    bcryptjs
    .genSalt(saltRounds)
    .then(salt => bcryptjs.hash(password, salt))
    .then(hashedPassword => {
      return User.create({
        username,
        passwordHash: hashedPassword
      });
    })
    .then(userFromDB => {
      res.redirect('/userProfile');
    })
    .catch(error => {
      // if (error instanceof mongoose.Error.ValidationError) {
      //   res.status(500).render('auth/signup', { errorMessage: error.message });
      if (error.code === 11000) {
        res.status(500).render('auth/signup', {
           errorMessage: 'Username need to be unique. This username is already used.' //Verifica que no exista el username en BBDD
        });
      } else {
        next(error);
      }
    });
});

// router.get('/userProfile', (req, res) => res.render('users/user-profile.hbs'));

//Inicio de sesion - LogIn
router.get('/login', isLoggedOut, (req, res) => res.render('auth/login'));

router.post('/login', isLoggedOut, (req, res, next) => {
  console.log('SESSION =====> ', req.session);
  const { username, password } = req.body;
 
  if (username === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'Please enter both, username and password to login.'
    });
    return;
  }
 
  User.findOne({ username })
    .then(user => {
      if (!user) {
        res.render('auth/login', { errorMessage: 'Username is not registered. Try with other username.' });
        return;
      } else if (bcryptjs.compareSync(password, user.passwordHash)) {
       //Guarda la sesion del usuario
        req.session.currentUser = user;
        res.redirect('/userProfile');
      } else {
        res.render('auth/login', { errorMessage: 'Incorrect password.' });
      }
    })
    .catch(error => next(error));
});

router.get('/userProfile', isLoggedIn, (req, res) => {
  res.render('users/user-profile', { userInSession: req.session.currentUser });
});

//Cerrar sesion usuario
router.post("/logout", isLoggedIn, (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
module.exports = router;