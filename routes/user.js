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

//bloger profile page
router.get('/profile',(req,res)=>{
  res.render('users/user-profile')
})

//bloger search
router.get('/search',(req,res)=>{
  res.render('users/user-search')
})

//add new post
router.get('/add-post',(req,res)=>{
  res.render('users/add-post')
})

//see another bloggers profile
router.get('/view-profile',(req,res)=>{
  res.render('users/view-another-user-profile')
})
module.exports = router;
