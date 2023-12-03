// /HME_Walthrough/

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")
const ejsMate = require("ejs-mate");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const mongoSanitize = require("express-mongo-sanitize");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const User = require("./models/users");
const Log = require("./models/logs");

const userRoutes = require("./routes/users");
const walkthroughRoutes = require("./routes/walkthrough");

const uri = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@127.0.0.1:27017/?authMechanism=DEFAULT`;
const session_uri = `mongodb://${process.env.SESSION_USERNAME}:${process.env.SESSION_PASSWORD}@127.0.0.1:27017/?authMechanism=DEFAULT`;
const options = { dbName: "Logs" };
mongoose.connect(uri, options);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// const sessionConnection = mongoose.createConnection(session_uri, options)
// sessionConnection.on("error", console.error.bind(console, "Session connection error:"))
// sessionConnection.once("open", () => {
//   console.log("Session Database connected")
// })
const app = express();

// Settings for Express
const port = 3000;
const path = require("path");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// This doesn't work
app.use(
  session({
    saveUninitialized: true,
    rolling: true,
    resave: false,
    secret: process.env.SESSION_SECRET,
    //                ms    s    m    h    d
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 },
    store: MongoStore.create({
      mongoUrl: session_uri,
      dbName: "Logs",
      //touchAfter: 24 * 60 * 60
    }),
  })
);

app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(mongoSanitize());
app.use(flash());
app.set('trust proxy', 'loopback, linklocal, uniquelocal')
app.use(cookieParser())

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
app.use("/walkthrough", walkthroughRoutes);

// Got to home
app.get("/", (req, res) => {
  // using a cookie named logged in to let the browser know if it should send a theme check or not
  if (!res.locals.currentUser) {
    res.cookie('isLoggedIn', 'false', { httpOnly: true })
  }
  res.render("home");
});

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
  console.log(`Express server listening on port ${port}`);
});
