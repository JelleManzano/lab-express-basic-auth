const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const { loggedIn } = require("../middlewares/auth");
const { reset } = require("nodemon");

router.get("/", loggedIn, async (req, res, next) => {
  try {
    const response = await User.findById(req.session.activeUser._id);
    res.render("profile/my-profile.hbs", {
      userDetails: response,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/private", loggedIn, async (req,res,next) => {
    try {
        const response = await User.findById(req.session.activeUser._id)
        res.render("profile/private.hbs")
    } catch (error) {
        next(error)
    }
})

module.exports = router;
