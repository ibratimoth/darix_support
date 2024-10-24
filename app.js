const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { connectionDB } = require("./config/db");
const cors = require("cors");
const session = require("express-session");
const { escape } = require("validator");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const csrf = require("csurf");
const hpp = require("hpp");
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
app.use(helmet());
app.use(hpp());
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

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      req.body[key] = escape(req.body[key]);
    }
  }
  next();
};

app.use(sanitizeInput);
logger.info("Application starting...");

app.get("/", (req, res) => {
  res.send("<h1>Welcome to ecommerce app</h1>");
});

// Rate limiter for auth routes (5 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 5 requests per windowMs
  message: "Too many attempts, please try again after 15 minutes.",
});

// Rate limiter for other routes (50 requests per 15 minutes)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: "Too many requests, please try again after 15 minutes.",
});

app.use("/api/auth", authLimiter, userRoutes);

// Apply the generalLimiter to all other routes
app.use(generalLimiter);
app.use("/api", messageRoutes);
app.use("/", pageRoutes);

// Function to sanitize sensitive fields from the request body
const sanitizeRequestBody = (body) => {
  if (body && typeof body === "object") {
    const { password, ...sanitizedBody } = body; // Exclude password field
    return sanitizedBody;
  }
  return body; // Return the original body if it's not an object
};

// Application logger middleware
app.use((req, res, next) => {
  // Log sanitized request body
  const sanitizedReqBody = sanitizeRequestBody(req.body);
  logger.info(`${req.method} ${req.url} received`, sanitizedReqBody);

  // Request and Response Logger Middleware
  const originalSend = res.send; // Save original res.send method
  res.send = function (body) {
    // Log the response
    logger.info(
      `${req.method} ${req.url} ${res.statusCode}`,
      body ? JSON.parse(body) : ""
    );
    originalSend.call(this, body); // Call the original res.send method
  };

  next(); // Proceed to the next middleware or route handler
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, function () {
  logger.info(
    `Server is running on ${process.env.DEV_MODE} mode on port ${PORT}`
  );
});

connectionDB();
