var express = require('express');
var router = express.Router();

const bcryptjs = require('bcryptjs');
const {body, validationResult} = require('express-validator');
const User = require("../model/User.js")
const passport = require("passport");

/* middleware for authentication*/
const checkAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/users/login");
  }
};
const checkNotAuthenticated = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else{res.redirect("/users/user_info")};
}

/* GET user listing. login required*/
router.get('/user_info',
  checkAuthenticated,
  async (req, res, next) => {
  const user = req.user;
  return res.render('userinfo', {user});
});

/* GET render login and register pages */
router.get('/login', checkNotAuthenticated, (req, res, next) => {
  res.render("login.pug");
});
router.get('/register', checkNotAuthenticated, (req, res, next) => {
  res.render("register.pug");
});
/* POST for register, validate user input, check duplication, register in database */
router.post('/register', 
  body("username").isLength({min: 3}).trim().escape(),
  body("password").isLength({min: 5}).escape(),
  async (req, res, next) => {
    /* validate input */
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(403).json({"errors": errors});
   
    try {
       /* check duplication */
      const found = await User.findOne({username: req.body.username});
      if (found) return res.status(403).json({"errors": "username or password invalid"});
      /* encrypt password */
      const salt = await bcryptjs.genSalt(10);
      const hash = await bcryptjs.hash(req.body.password, salt);
      /* create new user in data base */
      const newUser = new User({
        username: req.body.username,
        password: hash
      });
      await newUser.save();
      return res.redirect("/users/login");
    } catch (error) {
      next(error);
    }
  }
);
/* POST for login, use passport to authenticate */
router.post("/login", passport.authenticate("local", {
  successRedirect: "/users/user_info",
  failureRedirect: "/users/login"
}));

/* POST for logout */
router.post("/logout", checkAuthenticated, (req, res, next) => {
  console.log(`User ${req.user.username} logged out`);
  req.logOut((error)=>{
    if(error) next(error);
    res.redirect("/users/login");
  });
  
;});
module.exports = router;
