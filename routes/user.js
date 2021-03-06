const { response } = require('express');
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


const alreadyExist = {}


router.get('/', function (req, res, next) {
  res.render('users/index', { user: false });
});





///////////////////////////Page to create a new user/////////////////////////////////////////////////////
router.get('/signup', (req, res) => {
  res.render('users/user-signup', { user: false, check: alreadyExist })
  alreadyExist.status = false
})
/////////////////////////////End Page to create new user/////////////////////////////////////////////////





//////////////////////////////////////////////////post method for signup///////////////////////////////////////////////////////
router.post('/signup', (req, res) => {

  if (req.files) {
    var img = req.files.Image
    var profileImage = req.body.email
    var userDetailes = req.body;
    userDetailes.profileImage = profileImage
    //console.log(profileImage);

    img.mv('./public/images/profile-images/' + profileImage + ".jpg", (err, done) => {
      if (!err) {
        console.log(err);
        helpers.createUser(userDetailes).then((response) => {
          // console.log(response);

          if (response.status) {
            res.redirect('/login')
          }

          else {
            alreadyExist.status = true
            res.render('users/user-signup', { check: alreadyExist })

          }

        })

      }

    })
  }

  else {
    console.log("no image");
    var profileImage = "default-dp"
    var userDetailes = req.body;
    userDetailes.profileImage = profileImage
    // console.log(userDetailes);
    helpers.createUser(userDetailes).then((response) => {
      //console.log(response);
      if (response.status) {
        res.redirect('/login')
      }

      else {

        alreadyExist.status = true
        res.render('users/user-signup', { check: alreadyExist })

      }
    })
  }
})
/////////////////////////////////////////////////////////END POST METHOD OF SIGNUP/////////////////////////////////////////////








////////////////////////////////////////////////////////loginPage///////////////////////////////////////////////
router.get('/login', (req, res) => {
  if (req.session.loggedIn === true) {
    res.redirect('/home')
  } else {

    //console.log(req.session.loginErr);
    res.render('users/user-login', { user: false, loginErr: req.session.loginErr, errorMessage: req.session.loginErrMessage })
    req.session.loginErr = false
    //console.log(req.session.errorMessage);
  }

})
//////////////////////////////////////////////////////End of login page////////////////////////////////////////










///////////////////////////////////POST METHOD FOR LOGIN////////////////////////////////////////////////////////
router.post('/login', (req, res) => {
  // console.log(req.body);
  helpers.login(req.body).then((data) => {
    if (data.status === true) {
      req.session.user = data
      req.session.loggedIn = true
      // console.log(req.session.user.username);
      res.redirect('/home');
    } else {
      req.session.loggedIn = false;
      req.session.loginErr = true
      req.session.loginErrMessage = data.statusMessage
      //console.log(req.session);
      res.redirect('/login')
    }
  })
})
////////////////////////////END OF POST METHOD FOR LOGIN //////////////////////////////////////////////////////








/////////////////////////////////////////////bloger home page for viewing blogs////////////////////////////////////
router.get('/home', verifyLogin, (req, res) => {

  helpers.getPostsOfFollowing(req.session.user._id).then((posts) => {
    //console.log("In Users");
    // console.log(posts);

    res.render('users/user-home', { user: true, blogger: req.session.user, posts: posts })

  })



})
//////////////////////////////////End blogger home page for viewing blogs/////////////////////////








/////////////////////////////Route for like and dislike//////////////////////////
router.post('/like-dislike', (req, res) => {
  console.log(req.body.postId);
  helpers.likeOrDislike(req.session.user._id, req.body.postId).then((response) => {
    console.log(response);
    res.json(response)
  })
})
//////////////////////////////////////End for likes and dislikes/////////////////







////////////////////////////Route for add comment///////////////////////////

router.post('/add-comment', (req, res) => {
  //console.log("add-comment");
  // console.log(req.body.comment);
  // console.log(req.body.postId);
  // console.log(req.session.user.username);
  helpers.addComment(req.session.user, req.body.postId, req.body.comment).then(() => {
    res.json({ status: true })
  })

})

///////////////////////////////End of route for add comment//////////////////








/////////////////////Route for viewing commented user//////////////////////////

router.post('/view-commenter-profile', (req, res) => {
  //console.log(req.body);
  res.json({ id: req.body.userId })
})
/////////////////////End for route for viewing commented user//////////////////









//////////////Route for viewing followers /////////////////////////////////////

router.get('/view-followers/:id', verifyLogin, (req, res) => {

  helpers.getFollowers(req.params.id).then((response) => {

    res.render('users/view-followers-following', { user: true, blogger: req.session.user, bloggers: response })

  })

})
////////////////////////////End route for viewing followers/////////////////////








/////////////////////Route for viewing following bloggers////////////////////

router.get('/view-following/:id', verifyLogin, (req, res) => {

  helpers.getFollowing(req.params.id).then((response) => {

    res.render('users/view-followers-following', { user: true, blogger: req.session.user, bloggers: response })

  })


})


////////////////////End route for viewwing following blogers////////////////







///////////////////////////////bloger profile page////////////////////////////////////
router.get('/profile', verifyLogin, (req, res) => {

  helpers.profilePageDetailes(req.session.user._id).then(async (bloggerDetailes) => {
    let postCount = bloggerDetailes.postCount;
    let arrayOfPost = []
    if (postCount != 0) {
      arrayOfPost = await helpers.getPosts(req.session.user._id)
    }
    // console.log(arrayOfPost);
    //console.log(bloggerDetailes);
    let counts = {
      post: bloggerDetailes.postCount,
      followers: bloggerDetailes.followersCount,
      following: bloggerDetailes.followingCount
    }
    //console.log(counts);
    res.render('users/user-profile', { user: true, blogger: req.session.user, profile: bloggerDetailes, arrayOfPosts: arrayOfPost, counts: counts })

  })

})
////////////////////////////End Blogger Profile/////////////////////////////////////









///////////////////////////////bloger search////////////////////////////////
router.get('/search', verifyLogin, (req, res) => {
  res.render('users/user-search', { user: true, blogger: req.session.user, notFound: false })
})
///////////////////////////End blogger search///////////////////////////////////








////////////////////////blogger search post method////////////////////////////////

router.post('/search', (req, res) => {
  console.log(req.body.searchName);
  helpers.getBloggers(req.body.searchName).then((result) => {
    let empty = false;
    if (result.length === 0) {
      empty = true;
    }
    res.render('users/user-searched-results', { user: true, blogger: req.session.user, notFound: empty, msg: "Helo", results: result })


  })

})

///////////////////////////////////End Blog search post method/////////////////////////////






////////////////View-Profile Searched Blogger//////////////////////////////////////////
router.get('/view-searched-blogger/:id', (req, res) => {
  console.log(req.params.id);
  let bloggerId = req.params.id;
  if (bloggerId === req.session.user._id)
    res.redirect('/profile')
  else {
    helpers.getBloggerProfile(bloggerId).then(async (result) => {
      let postCount = result.postCount;
      let arrayOfPost = []
      if (postCount != 0) {
        arrayOfPost = await helpers.getPosts(bloggerId)
      }

      let counts = {
        post: result.postCount,
        followers: result.followersCount,
        following: result.followingCount
      }

      let isFollowing = await helpers.isFollowing(req.session.user._id, bloggerId)
      //console.log(isFollowing);

      res.render('users/view-another-user-profile', { user: true, blogger: req.session.user, user: result, profile: result, arrayOfPosts: arrayOfPost, counts: counts, isFollowing: isFollowing })

    })
  }


})

//////////////////////////////////////End View-Profile searched blogger////////////////








////////////////////////////////Route for follow request////////////////////////////////////////////////////////////

router.get('/follow/:id', (req, res) => {

  var bloggerId = req.params.id;

  helpers.followBlogger(req.session.user._id, req.params.id).then(() => {


    res.redirect(`/view-searched-blogger/${bloggerId}`)
  })

})

/////////////////////////////End of router for follow request//////////////////////////////////////////








//////////////////////////////Route for unfoloow request////////////////////////////////////////////////

router.get('/unfollow/:id', (req, res) => {

  var bloggerId = req.params.id;

  helpers.unfollowBlogger(req.session.user._id, req.params.id).then(() => {


    res.redirect(`/view-searched-blogger/${bloggerId}`)
  })

})

//////////////////////////////End of route for unfoloow request//////////////////////////////////////////////////







////////////////////////button for add new post///////////////////////////
router.get('/add-post', verifyLogin, (req, res) => {
  res.render('users/add-post', { user: true, blogger: req.session.user })
})
////////////////////End of Button for add new post/////////////////////////










///////////////////////////POST METHOD FOR ADDING NEW POST////////////////////////////////////

router.post('/add-post', verifyLogin, (req, res) => {
  console.log(req.body);
  helpers.addNewPost(req.session.user._id, req.body).then(() => {
    res.redirect('/profile')
  })
})
/////////////////////////END OF POST METHOD FOR ADDING NEW POST /////////////////////////











/////////////////////////////////////account settings//////////////////////////////

router.get('/account-settings', verifyLogin, (req, res) => {
  res.render('users/account-settings', { user: true, blogger: req.session.user, user: req.session.user })
})

////////////////////////////////////End acoount settings////////////////////////////








///////////////////////////////////////Route for Post Update profile////////////////////////

router.post('/update-profile', (req, res) => {
  req.body.email = req.session.user.email;
  req.body.id=req.session.user._id;
  req.body.profileImage=req.session.user.profileImage
  console.log(req.body);


  if (req.files) {
    console.log("present");
    var img = req.files.Image
    var profileImage = req.body.email
   // var userDetailes = req.body;
    //userDetailes.profileImage = profileImage
    req.body.profileImage=profileImage
    img.mv('./public/images/profile-images/' + profileImage + ".jpg", (err, done) => {

      if (!err) {

        helpers.updateProfile(req.body).then((user)=>{
          req.session.user=user
          res.redirect('/profile')
        })
      }

    })
    
    


  }
  else{
    console.log("not");
    //req.body.profileImage=req.session.user.profileImage
    helpers.updateProfile(req.body).then((user)=>{
      req.session.user=user
      res.redirect('/profile')
    })

  }


  })

////////////////////////////////////End Route for Post method for update profile////////////







////////////////////////////////////////Route for viewing seleced post//////////////////////

router.get('/view-selected-post/:id',verifyLogin,(req,res)=>{

  //console.log(req.params.id);
  helpers.getSelectedPost(req.params.id).then((post)=>{
    //console.log(post);
    res.render('users/view-selected-post', { user: true, blogger: req.session.user, post: post })
  })

})




//logout
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

module.exports = router;
