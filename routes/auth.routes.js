const { Router } = require('express');
const router = new Router();
const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const User = require('../models/User.model');
// const mongoose = require('mongoose');

router.get('/signup', (req, res) => res.render('auth/signup'));

router.post('/signup', (req, res, next) => {
    // console.log("The form data: ", req.body);
   
    const { username, password } = req.body;
    if (!username || !password) {
      res.render('auth/signup', { errorMessage: 'All fields are mandatory. Please provide your username, and password.' });
      return;
    }
   
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
    .catch(error => next(error));
});

router.get('/userProfile', (req, res) => res.render('users/user-profile.hbs'));


module.exports = router;