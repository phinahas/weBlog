var express = require('express');
var helpers = require('../helpers/userHelpers')
var router = express.Router();

const alreadyExist={}
router.get('/', function (req, res, next) {
  res.render('users/index');
});

//Page to create a new user
router.get('/signup', (req, res) => {
  res.render('users/user-signup',{check:alreadyExist})
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
          console.log(response);

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
    console.log(userDetailes);
    helpers.createUser(userDetailes).then((response) => {
      console.log(response);
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
  res.render('users/user-login')
})

//bloger home page for viewing blogs
router.get('/home', (req, res) => {
  res.render('users/user-home')
})

//bloger profile page
router.get('/profile', (req, res) => {
  res.render('users/user-profile')
})

//bloger search
router.get('/search', (req, res) => {
  res.render('users/user-search')
})

//add new post
router.get('/add-post', (req, res) => {
  res.render('users/add-post')
})

//see another bloggers profile
router.get('/view-profile', (req, res) => {
  res.render('users/view-another-user-profile')
})

//account settings
router.get('/account-settings', (req, res) => {
  res.render('users/account-settings')
})

module.exports = router;
