const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { connectionDB } = require("./config/db");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const pageRoutes = require("./routes/pageRoutes");
const logger = require("./logger");

//configure env
dotenv.config();

//rest object
const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_KEY, // A secret key to sign the session ID cookie (make this a strong, random string)
    resave: false, // Prevent session from being saved back to the session store if unmodified
    saveUninitialized: true, // Save uninitialized session (session that is new, but not modified)
    cookie: {
      secure: false, // Set to true if using HTTPS (if you move to production, set to true)
      maxAge: 1000 * 60 * 60 * 24, // Set cookie expiration (e.g., 1 day)
    },
  })
);

logger.info("Application starting...");

app.get("/", (req, res) => {
  res.send("<h1>Welcome to ecommerce app</h1>");
});

app.use("/api", messageRoutes);
app.use("/api/auth", userRoutes);
app.use("/", pageRoutes);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} ${res.statusCode}`);
  next();
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, function () {
  logger.info(
    `Server is running on ${process.env.DEV_MODE} mode on port ${PORT}`
  );
});

connectionDB();
