// /HME_Walthrough/
// mysql JoshEdwards jedwards

require('dotenv').config()
const express = require('express')
const ejsMate = require('ejs-mate')
const session = require("express-session")
const mongoose = require("mongoose")
const MongoStore = require("connect-mongo")
const mongoSanitize = require("express-mongo-sanitize")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const flash = require("connect-flash")
const ExpressError = require("./utils/ExpressError")
const User = require("./models/users")
const Log = require("./models/logs")

const userRoutes = require("./routes/users")

const uri = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@localhost:27017/?authMechanism=DEFAULT`
mongoose.connect(uri)

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
  console.log("Database connected")
})
const store = MongoStore.create({
  mongoUrl: uri,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
})
store.on("error", function (err) {
  console.log("Store Session Error", err)
})
const sessionConfig = {
  store,
  name: "Walkthrough user",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    //                    ms     s    m    h    d
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    // secure: true,
  },
};

const app = express()

// Settings for Express
const port = 3000
const path = require('path')
app.use(session(sessionConfig))
app.use(express.static(path.join(__dirname, '/public')))
app.engine("ejs", ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(mongoSanitize())
app.use(flash())

// Setup passport module
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// If there is a success or error message in res, add to req flash message
app.use((req, res, next) => {
  // console.log(req.session)
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Tell Express to use routes
app.use("/", userRoutes);

// Got to home
app.get('/', (req, res) => {
  res.render('home')
})

// If route wasn't found above then return an error
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// If server has a problem (not an invalid route) then return an error
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`)
})