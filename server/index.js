const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS
app.use(
  cors({
    origin: ["https://hotzone-cafe.vercel.app", "http://localhost:5500","http://127.0.0.1:5500"],
    credentials: true,
  }),
);

app.use(express.json());

// Upload folder
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/menu", require("./routes/menu"));
app.use("/api/auth", require("./routes/auth"));

// Health check route
app.get("/", (req, res) => {
  res.send("HotZone API is running ✅");
});

// Database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});
