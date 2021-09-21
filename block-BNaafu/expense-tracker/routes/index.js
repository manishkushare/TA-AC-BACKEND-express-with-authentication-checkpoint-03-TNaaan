var express = require('express');
var router = express.Router();
var passport = require('passport');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/auth/github',
  passport.authenticate('github'));

router.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/users/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/users'); 
});

router.get('/success', async (req,res,next)=> {
  try {
    res.redirect('/users');
  } catch (error) {
    next(error);
  }
})

router.get('/failure', async (req,res,next)=> {
  try {
    req.flash('info', 'Flash is back!')
    res.redirect('/users/login');
  } catch (error) {
    next(error);
  }
})

router.get('/auth/google',passport.authenticate('google', { scope: ["email", "profile"] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/failure' }),
  function(req, res) {
    res.redirect('/success');
  }
);

module.exports = router;
