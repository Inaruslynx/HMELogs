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
const options = {dbName: "Logs"}
mongoose.connect(uri, options)

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
  console.log("Database connected")
})

const app = express()

// Settings for Express
const port = 3000
const path = require('path')

// This doesn't work
// app.use(session({
//   saveUninitialized: true,
//   resave: false,
//   store: new MongoStore({
//     url: `mongodb://${process.env.SESSION_USERNAME}:${process.env.SESSION_PASSWORD}@localhost:27017/?authMechanism=DEFAULT`,
//     dbName: "Logs",
//     secret: process.env.SESSION_SECRET,
//     touchAfter: 24 * 60 * 60
//   })
// }))

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