const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const Campground = require("./models/campground")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const catchAsync = require("./utils/catchAsync")
const ExpressError = require("./utils/ExpressError")
const { campgroundShema, reviewSchema } = require("./schemas")
const Review = require("./models/review")
const session = require("express-session")
const flash = require("connect-flash")

const campgrounds = require("./routes/campground")
const reviews = require("./routes/reviews")

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
  console.log("database connected")
})

const app = express()

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public")))

const sessionConfig = {
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUnitialized: true,
  cookie: {
    httpOnly: true,
    exprires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}
app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next) => {
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  next()
})

//campgrounds
app.use("/campgrounds", campgrounds)

//reviews

app.use("/campgrounds/:id/reviews/", reviews)

app.get("/", (req, res) => {
  res.render("home")
})

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err
  if (!err.message) err.message("Something went wrong")
  res.status(statusCode).render("error", { err })
})

app.listen(3000, () => {
  console.log("Serving on port 3000s")
})
