// Import required modules
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const multer = require("multer");
const MongoDBStore = require("connect-mongodb-session")(session);

// Import local modules
const rootDir = require("./utils/path");
const authRouter = require("./routes/authRouter");
const hostRouter = require("./routes/hostRouter");
const storeRouter = require("./routes/storeRouter");
const errorController = require("./controllers/error");

// MongoDB connection string
const MONGO_URL =
  "mongodb+srv://krishan:krishan@cluster0.el5sbun.mongodb.net/airbnb?retryWrites=true&w=majority&appName=Cluster0";

// Initialize Express app
const app = express();
// Set up session store in MongoDB
const store = new MongoDBStore({
  uri: MONGO_URL,
  collection: "sessions",
});

// Set EJS as the view engine and specify views directory
app.set("view engine", "ejs");
app.set("views", "views");

// Serve static files from the 'public' directory
app.use(express.static(path.join(rootDir, "public")));

const randomString = (length) => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + "-" + file.originalname); // Use a unique filename
  },
});
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true); // Accept the file
  } else {
    cb(null, false); // Reject the file
  }
};
const multerOptions = {
  storage,
  fileFilter,
};
app.use(multer(multerOptions).single("photo"));

app.use("/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/host/uploads", express.static(path.join(rootDir, "uploads")));
app.use(
  "/host/edit-home/uploads",
  express.static(path.join(rootDir, "uploads"))
);
app.use(
  "/homes/:homeId/uploads",
  express.static(path.join(rootDir, "uploads"))
);
app.use("/favourites/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/homes/uploads", express.static(path.join(rootDir, "uploads")));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Configure session middleware
app.use(
  session({
    secret: "your_secret_key", // Replace with a secure secret in production
    resave: false,
    saveUninitialized: true,
    store,
  })
);

// Middleware to expose login status to all requests
app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});

// Register routers for different parts of the app
app.use(storeRouter);
app.use(hostRouter);
app.use(authRouter);

// Protect /host routes: redirect to login if not authenticated
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});

// Handle 404 errors
app.use(errorController.get404);

// Connect to MongoDB and start the server
mongoose
  .connect(MONGO_URL)
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
  });
