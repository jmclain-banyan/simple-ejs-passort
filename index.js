if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = require("./passport-config");
const methodOverride = require('method-override');
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'))

let users = [];

initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

app
  .route("/")
  .get(checkAuth, (req, res) => res.render("index", { name: req.user.name }));

app
  .route("/login")
  .get(checkIsNotAuth, (req, res) => res.render("login"))
  .post(
    checkIsNotAuth,
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })
  );

app
  .route("/register")
  .get(checkIsNotAuth, (req, res) => res.render("register"))
  .post(checkIsNotAuth, async (req, res) => {
    const { password, email, name } = req.body;
    try {
      const hash = await bcrypt.hash(password, 10);
      users.push({
        id: new Date().getTime().toString(),
        name,
        email,
        password: hash,
      });
      res.redirect("/login");
    } catch {
      res.redirect("/register");
    }
  });

app.route('/logout')
  .delete((req, res) => {

  })

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.redirect("/login");
  }
}

function checkIsNotAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  } else {
    return next();
  }
}

app.listen(3000);
