const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const authRouter = require("./Router/authRoute");
const quizRouter = require("./Router/quizRoute");
const postRouter = require("./Router/postRoute");
const chatbotRouter = require("./Router/chatbotRoute");

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://exo-planetarium.vercel.app"
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);
app.use("/quiz", quizRouter);
app.use("/chatbot", chatbotRouter);
app.use("/chatbot", chatbotRouter);
app.use("/api/post", postRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    status: "failed",
    statusCode,
    message,
  });
});
module.exports = app;
