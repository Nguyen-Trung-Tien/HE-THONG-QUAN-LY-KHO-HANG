const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const db = require("../models");

const verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ status: "ERR", message: "Truy cập bị từ chối: Thiếu token xác thực" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    
    if (decoded?.id) {
      const user = await db.User.findByPk(decoded.id, {
        attributes: ["id", "status", "role", "email"],
        raw: true,
      });

      if (!user) {
        return res.status(401).json({ status: "ERR", message: "Tài khoản không tồn tại" });
      }

      if (user.status === "Bị khóa") {
        return res.status(403).json({ status: "ERR", message: "Tài khoản của bạn đã bị khóa" });
      }

      req.user = { ...decoded, role: user.role };
    } else {
      req.user = decoded;
    }

    next();
  } catch (err) {
    return res.status(403).json({ status: "ERR", message: "Token xác thực không hợp lệ hoặc đã hết hạn" });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: "ERR", message: "Chưa đăng nhập" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: "ERR", message: "Bạn không có quyền thực hiện thao tác này" });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };
