const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routers");
const connectDB = require("./config/connectDB");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")
    : [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
      ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.use(cookieParser());

app.use(
  express.json({
    limit: "10mb",
  }),
);
app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
  }),
);

app.use(express.static("public"));

routes(app);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    status: "ERR",
    message: `API Route không tồn tại: ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err);
  res.status(err.status || 500).json({
    status: "ERR",
    message: err.message || "Lỗi hệ thống nội bộ backend",
  });
});

connectDB();

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Connect success!", port);
});
