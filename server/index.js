import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/users.js";
import videoRoutes from "./routes/videos.js";
import commentRoutes from "./routes/comments.js";
import authRoutes from "./routes/auth.js";
import cookieParser from "cookie-parser";


const app = express();
dotenv.config();

const port = process.env.PORT || 5000;

app.use(cors({
  origin: true, //included origin as true
  credentials: true, //included credentials as true
}
));

app.use(express.json());
app.use(cookieParser());



app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/comments", commentRoutes);

//error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

// Create a middleware function to check for cookie errors
function checkCookieError(req, res, next) {
  // Store a reference to the original res.cookie method
  const originalCookie = res.cookie;

  // Override the res.cookie method with a custom implementation
  res.cookie = function(name, value, options) {
    try {
      // Call the original res.cookie method
      originalCookie.call(this, name, value, options);
    } catch (error) {
      // Log an error message to the console
      console.error(`Failed to set cookie '${name}': ${error.message}`);
    }
  };

  // Call the next middleware function
  next();
}

// Use the checkCookieError middleware
app.use(checkCookieError);

app.listen(port, () => {
  connect();
  console.log("Connected to Server");
});

const connect = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      throw err;
    });
};