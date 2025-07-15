const dotenv = require("dotenv");
dotenv.config();
const app = require("./app");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
    console.log(err.name, err.message);
  console.log("Unhandled Rejection! Shutting down server");
  process.exit(1);
});
console.log(process.env.NODE_ENV);
mongoose
  .connect(process.env.CONN_STR, {})
  .then((conn) => {
    console.log("DB has been connected successfully");
  })
  .catch((error) => {
    console.log(error);
  });

  const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server has been started on http://localhost:${port}`);
});
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled Rejection! Shutting down server");
  server.close(() => {
    process.exit(1);
  });
});