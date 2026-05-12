const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* Upload folder */
app.use("/uploads", express.static("uploads"));

/* API Routes */
app.use("/api/menu", require("./routes/menu"));
app.use("/api/auth", require("./routes/auth"));

/* FRONTEND FILES */
app.use(express.static(path.join(__dirname, "../client")));

/* HOME ROUTE */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

/* DATABASE */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* SERVER */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
