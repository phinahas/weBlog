var express = require('express');
var helpers = require('../helpers/userHelpers')
var router = express.Router();


//middlewear to verify login
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  }
  else {
    res.redirect('/login')
  }
}


const alreadyExist={}


router.get('/', function (req, res, next) {
  res.render('users/index',{user:false});
});

//Page to create a new user
router.get('/signup', (req, res) => {
  res.render('users/user-signup',{user:false,check:alreadyExist})
  alreadyExist.status=false
})

/////////////////////////////////////////post method for signup///////////////////////////////////////////////////////
router.post('/signup', (req, res) => {

  if (req.files) {
    var img = req.files.Image
    var profileImage = req.body.email + req.files.Image.name;
    var userDetailes = req.body;
    userDetailes.profileImage = profileImage

    img.mv('./public/images/profile-images/' + profileImage, (err, done) => {
      if (!err) {

        helpers.createUser(userDetailes).then((response) => {
         // console.log(response);

          if (response.status) {
            res.redirect('/login')
          }

          else {
            alreadyExist.status=true         
            res.render('users/user-signup',{check:alreadyExist})
          
          }

        })

      }

    })
  }

  else {
    console.log("no image");
    var profileImage = "default-dp.png"
    var userDetailes = req.body;
    userDetailes.profileImage = profileImage
   // console.log(userDetailes);
    helpers.createUser(userDetailes).then((response) => {
      //console.log(response);
      if (response.status) {
        res.redirect('/login')
      }

      else {

        alreadyExist.status=true         
        res.render('users/user-signup',{check:alreadyExist}) 

      }
    })
  }
})
/////////////////////////////////////////////////////////END POST METHOD OF SIGNUP/////////////////////////////////////////////


//loginPage
router.get('/login', (req, res) => {
  if(req.session.loggedIn===true)
  {
    res.redirect('/home')
  }else{

    console.log(req.session.loginErr);
    res.render('users/user-login',{user:false,loginErr:req.session.loginErr,errorMessage:req.session.loginErrMessage})
    req.session.loginErr=false
    console.log(req.session.errorMessage);
  }
 
})

///////////////////////////////////POST METHOD FOR LOGIN////////////////////////////////////////////////////////
router.post('/login',(req,res)=>{
 // console.log(req.body);
  helpers.login(req.body).then((data)=>{
    if(data.status===true){
      req.session.user=data
      req.session.loggedIn=true
      console.log(req.session);
      res.redirect('/home');
    }else{
      req.session.loggedIn=false;
      req.session.loginErr=true
      req.session.loginErrMessage=data.statusMessage
      console.log(req.session);
      res.redirect('/login')
    }
  })
})



//bloger home page for viewing blogs
router.get('/home',verifyLogin, (req, res) => {
  res.render('users/user-home',{user:true})
})

//bloger profile page
router.get('/profile', verifyLogin,(req, res) => {
  res.render('users/user-profile',{user:true})
})

//bloger search
router.get('/search',verifyLogin, (req, res) => {
  res.render('users/user-search',{user:true})
})

//add new post
router.get('/add-post',verifyLogin, (req, res) => {
  res.render('users/add-post',{user:true})
})

//see another bloggers profile
router.get('/view-profile',verifyLogin, (req, res) => {
  res.render('users/view-another-user-profile',{user:true})
})

//account settings
router.get('/account-settings',verifyLogin, (req, res) => {
  res.render('users/account-settings',{user:true})
})



//logout
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

module.exports = router;
