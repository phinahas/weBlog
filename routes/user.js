var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

//Page to create a new user
router.get('/signup',(req,res)=>{
  res.render('user-signup')
})

//loginPage
router.get('/login',(req,res)=>{
  res.render('user-login')
})
module.exports = router;
