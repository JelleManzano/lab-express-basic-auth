const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const { get } = require("mongoose");
//rutas signup y login

//get "/auth/signup"
router.get("/signup", (req, res, next) => {
  res.render("auth/signup.hbs");
});
//post "/auth/signup"
router.post("/signup", async (req, res, next) => {
  const { username, email, password1, password2 } = req.body;
  if (username === "" || email === "" || password1 === "") {
    res.render("auth/signup.hbs", {
      errorMessage: "All fields should be filled",
    });
    return;
  }

  if (password1 !== password2) {
    res.render("auth/signup.hbs", {
      errorMessage: "Please make sure both passwords are the same",
    });
    return;
  }

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
  if (passwordRegex.test(password1) === false) {
    res.render("auth/signup.hbs", {
      errorMessage:
        "The password should contain 8 characters, one upper case letter and a number or special character like !",
    });
    return;
  }
  const emailRegex =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
  if (emailRegex.test(email) === false) {
    res.render("auth/signup.hbs", {
      errorMessage: "The e-mail provided should be a valid e-mail direction",
    });
    return;
  }

  try {
    const foundUser = await User.findOne({ username: username });
    if (foundUser !== null) {
      res.render("auth/signup.hbs", {
        errorMessage: "The username provided is already in use",
      });
    }

    const foundMail = await User.findOne({ email: email });
    if (foundMail !== null) {
      res.render("auth/signup.hbs", {
        errorMessage: "That e-mail is already in use",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashPassword = await bcrypt.hash(password1, salt);

    const newUser = {
      username: username,
      email: email,
      password1: hashPassword,
    };

    await User.create(newUser);
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

//get "/auth/login"
router.get("/login", (req, res, next) => {
  res.render("auth/login.hbs");
});
//post "/auth/login"

router.post("/login", async (req, res, next) => {
  const { email, password1 } = req.body;

  //Validate email and password
  if (email === "" || password1 === "") {
    res.render("auth/login.hbs", {
      errorMessage: "Wrong e-mail or password",
    });
    return;
  }

  //Verify that the user exists, verify the password, implementing the session system for a unique session per account
  try {
    const userExists = await User.findOne({ email: email });
    if (userExists === null) {
      res.render("auth/login.hbs", {
        errorMessage: "Wrong e-mail or password",
      });
      return;
    }
    const correctPassword = await bcrypt.compare(password1,userExists.password1);

    if (correctPassword === false) {
      res.render("auth/login.hbs", {
        errorMessage: "Wrong e-mail or password",
      });
      return;
    }

    req.session.activeUser = userExists;
    req.session.save(() => {
      res.redirect("/main");
    });
  } catch (error) {
    next(error);
  }
});
//delete the session

router.get("/logout", (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});
module.exports = router;
