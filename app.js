let express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const markdown = require("marked");
const sanitizeHTML = require("sanitize-html");
let app = express();

app.use(
  session({
    secret: "javascript",
    // store: MongoStore.create({ client: require("./db") }),
    store: MongoStore.create({
      mongoUrl: process.env.CONNECTION_STRING,
      dbName: "MySocialApp",
      collectionName: "sessions",
    }),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 60 * 24, httpOnly: true, sameSite: "strict" },
  })
);

app.use(flash());

let router = require("./router.js");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.static("public"));

// Энэ хэсэг router холбох мөрийн заавал дээр байх ёстой
app.use(function (req, res, next) {
  res.locals.filterUserHTML = function (content) {
    return sanitizeHTML(markdown.parse(content), {
      allowedTags: ["p", "strong", "a", "ul", "li"],
      allowedAttributes: {},
    });
  };
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");

  res.locals.user = req.session.user;
  next();
});

app.use("/", router);

module.exports = app;
