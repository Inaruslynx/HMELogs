// /HME_Walthrough/

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
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
const Suggestion = require("./models/suggestions");
const { startTimeJobs } = require("./utils/dailyLogCheck");

// For logging purposes
// Going to send logs to Papertrail
const Axe = require("axe");
const Cabin = require("cabin");
const parseErr = require("parse-err");
const safeStringify = require("fast-safe-stringify");
const superagent = require("superagent");
const { createId } = require("@paralleldrive/cuid2");
const { Signale } = require("signale");
const logger = new Axe({ logger: new Signale(), meta: {omittedFields: ['app']} });
const PAPERTRAIL_TOKEN = process.env.PAPERTRAIL_TOKEN;

// <https://github.com/cabinjs/axe/#send-logs-to-papertrail>
async function hook(err, message, meta) {
  //
  // return early if we wish to ignore this
  // (this prevents recursion; see end of this fn)
  //
  if (meta.ignore_hook) return;
  if (!(err instanceof Error)) return;

  try {
    const request = superagent
      .post("https://logs.collector.solarwinds.com/v1/log")
      // if the meta object already contained a request ID then re-use it
      // otherwise generate one that gets re-used in the API log request
      // (which normalizes server/browser request id formatting)
      .set(
        "X-Request-Id",
        meta && meta.request && meta.request.id ? meta.request.id : createId()
      )
      .set("X-Axe-Version", logger.config.version)
      .timeout(5000);

    request.auth("", PAPERTRAIL_TOKEN);

    const response = await request
      .type("application/json")
      .retry(3)
      .send(safeStringify({ err: parseErr(err), message, meta }));

    logger.info("log sent over HTTP", { response, ignore_hook: true });
  } catch (err) {
    logger.fatal(err, { ignore_hook: true });
  }
}

for (const level of logger.config.levels) {
  logger.post(level, hook);
}

const cabin = new Cabin({ logger });
module.exports = cabin

const userRoutes = require("./routes/users");
const walkthroughRoutes = require("./routes/walkthrough");
const graphRoutes = require("./routes/graph");

const uri = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@127.0.0.1:27017/?authMechanism=DEFAULT`;
const session_uri = `mongodb://${process.env.SESSION_USERNAME}:${process.env.SESSION_PASSWORD}@127.0.0.1:27017/?authMechanism=DEFAULT`;
const options = { dbName: "Logs" };
mongoose.connect(uri, options);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  cabin.info("Database connected");
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

app.use(cookieParser());
app.use(cabin.middleware);
app.use(
  session({
    saveUninitialized: true,
    rolling: true,
    resave: false,
    secret: process.env.SESSION_SECRET,
    //                                 ms    s    m    h    d
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
app.set("trust proxy", "loopback, linklocal, uniquelocal");

// Setup passport module
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());
startTimeJobs();

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
app.use("/graph", graphRoutes);

// Got to home
app.get("/", async (req, res) => {
  // using a cookie named logged in to let the browser know if it should send a theme check or not
  if (!res.locals.currentUser) {
    res.cookie("isLoggedIn", "false", { httpOnly: true });
  }
  const results = await Suggestion.find({}).populate("user");
  res.render("home", { results });
});

app.post("/", async (req, res, next) => {
  try {
    const { suggestionTextBox } = req.body;
    //console.log(suggestionTextBox)
    if (!res.locals.currentUser) throw new Error("No current user.");
    const { _id } = res.locals.currentUser;
    const userData = await User.findById(_id);
    if (!userData) {
      throw new Error("Didn't find user.");
    }
    if (suggestionTextBox) {
      //console.log("data:", suggestionTextBox, "userid:", userData._id)
      const suggestion = new Suggestion({
        user: userData._id,
        suggestion: suggestionTextBox,
      });
      const result = await suggestion.save();
      //console.log(result)
    }
  } catch (error) {
    req.flash("error", error.message);
  }
  res.redirect(`${process.env.DOMAIN}`);
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
  cabin.info(`Express server listening on port ${port}`);
});
