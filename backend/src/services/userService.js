const db = require("../models/index.js");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const dotenv = require("dotenv");
dotenv.config();
const hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPassword = await bcrypt.hashSync(password, salt);
      resolve(hashPassword);
    } catch (e) {
      reject(e);
    }
  });
};

const checkUserEmail = async (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: userEmail },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

const handleLoginUser = async (email, password) => {
  try {
    const user = await db.User.findOne({
      attributes: [
        "id",
        "email",
        "password",
        "role",
        "lastName",
        "firstName",
        "image",
        "address",
        "status",
        "gender",
        "is2FAEnabled",
        "isPinEnabled",
        "notifEmail",
        "notifBrowser",
        "notifStockAlert",
        "preferredTheme",
        "systemName",
      ],
      where: { email },
      raw: true,
    });

    if (!user) {
      return { errCode: 1, errMessage: "Email hoặc mật khẩu không đúng" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { errCode: 1, errMessage: "Email hoặc mật khẩu không đúng" };
    }

    if (user.status === "Bị khóa") {
      return { errCode: -4, errMessage: "Tài khoản đã bị khóa" };
    }

    delete user.password;

    return { errCode: 0, errMessage: "OK", user };
  } catch (e) {
    console.error("handleLoginUser failed:", e);
    throw e;
  }
};

const createNewUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.password) {
        return resolve({
          errCode: 1,
          errMessage: "Vui lòng nhập đầy đủ Email và Mật khẩu!",
        });
      }

      if (data.password.length < 6) {
        return resolve({
          errCode: 1,
          errMessage: "Mật khẩu phải có ít nhất 6 ký tự!",
        });
      }

      let emailExists = await checkUserEmail(data.email);
      if (emailExists) {
        return resolve({
          errCode: 1,
          errMessage: "Email này đã được sử dụng! Vui lòng chọn Email khác.",
        });
      }

      const hashedPassword = await hashUserPassword(data.password);

      await db.User.create({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        role: data.role || "Nhân viên",
        status: data.status || "Hoạt động",
        gender: data.gender || "Nam",
        image: data.image || null,
      });

      resolve({ errCode: 0, errMessage: "OK" });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllUsers = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users;
      if (userId === "All" || !userId) {
        users = await db.User.findAll({
          attributes: { exclude: ["password", "securityPin", "twoFactorSecret"] },
        });
      } else {
        users = await db.User.findAll({
          where: { id: userId },
          attributes: { exclude: ["password", "securityPin", "twoFactorSecret"] },
        });
      }
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

const UpdateUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        return resolve({
          errCode: 2,
          errMessage: "Missing required parameter!",
        });
      }

      let user = await db.User.findOne({
        where: { id: data.id },
        raw: false,
      });

      if (user) {
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.address = data.address;
        user.role = data.role;
        user.gender = data.gender;
        user.status = data.status;
        user.phoneNumber = data.phoneNumber;
        if (data.avatarBase64) {
          user.image = data.avatarBase64;
        } else if (data.image) {
          user.image = data.image;
        }

        await user.save();

        resolve({
          errCode: 0,
          errMessage: "Update the user succeed!",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "User not found!",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const DeleteUserData = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let foundUser = await db.User.findOne({
        where: { id: userId },
      });

      if (!foundUser) {
        resolve({
          errCode: 1,
          errMessage: "The user isn't exits! ",
        });
      }

      await db.User.destroy({
        where: { id: userId },
      });
      resolve({
        errCode: 0,
        errMessage: "Delete user success!",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const changePassword = async (data) => {
  try {
    if (!data.id || !data.oldPassword || !data.newPassword) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc!",
      };
    }

    if (data.newPassword.length < 6) {
      return {
        errCode: 1,
        errMessage: "Mật khẩu mới phải có ít nhất 6 ký tự!",
      };
    }

    const user = await db.User.findOne({
      where: { id: data.id },
      raw: false,
    });

    if (!user) {
      return {
        errCode: 2,
        errMessage: "Người dùng không tồn tại!",
      };
    }

    const isPasswordValid = await bcrypt.compare(data.oldPassword, user.password);
    if (!isPasswordValid) {
      return {
        errCode: 3,
        errMessage: "Mật khẩu cũ không chính xác!",
      };
    }

    user.password = await hashUserPassword(data.newPassword);
    await user.save();

    return {
      errCode: 0,
      errMessage: "Đổi mật khẩu thành công!",
    };
  } catch (e) {
    console.error("changePassword failed:", e);
    throw e;
  }
};

module.exports = {
  createNewUser,
  getAllUsers,
  handleLoginUser,
  UpdateUserData,
  DeleteUserData,
  changePassword,
};
