const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { connectionDB } = require("./config/db");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
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

logger.info("Application starting...");

app.get("/", (req, res) => {
  res.send("<h1>Welcome to ecommerce app</h1>");
});

app.use("/api", messageRoutes);
app.use("/api/auth", userRoutes);

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
