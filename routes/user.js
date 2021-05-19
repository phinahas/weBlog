var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  res.render('users/index');
});

//Page to create a new user
router.get('/signup',(req,res)=>{
  res.render('users/user-signup')
})

//loginPage
router.get('/login',(req,res)=>{
  res.render('users/user-login')
})

//bloger home page for viewing blogs
router.get('/home',(req,res)=>{
  res.render('users/user-home')
})

router.get('/profile',(req,res)=>{
  res.render('users/user-profile')
})
module.exports = router;
