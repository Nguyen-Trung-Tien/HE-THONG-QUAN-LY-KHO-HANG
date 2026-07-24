import React, { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SignInUser } from "../API/user/userApi";
import { login } from "../redux/slice/userSlice";
import { toast } from "react-toastify";
import axiosInstance from "../API/utils/axiosInstance";

// Common Components
import Button from "./common/Button";
import Input from "./common/Input";
import Modal from "./common/Modal";
import Badge from "./common/Badge";
import { FiShield, FiLock, FiMail, FiBox, FiArrowRight } from "react-icons/fi";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [needsPIN, setNeedsPIN] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const access_token = useSelector((state) => state.user.access_token);
  if (access_token) return <Navigate to="/" replace />;

  const handleSignin = async (e) => {
    if (e) e.preventDefault();
    if (email.trim() === "" || password.trim() === "") {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await SignInUser(email, password);

      if (data?.errCode === 0) {
        if (data.requires2FA) {
          setNeeds2FA(true);
          toast.info("Yêu cầu xác thực 2 lớp");
          return;
        }

        if (data.requiresPIN) {
          setNeedsPIN(true);
          toast.info("Yêu cầu mã PIN bảo mật");
          return;
        }

        if (data.user.status === "Bị khóa") {
          const lockMsg = "Tài khoản bị khóa. Vui lòng liên hệ quản lý!";
          toast.error(lockMsg);
          setError(lockMsg);
          setIsLoading(false);
          return;
        }

        dispatch(
          login({
            ...data.user,
            access_token: data.access_token,
          }),
        );

        toast.success("Đăng nhập thành công!");
        navigate("/");
      } else {
        const failMsg = data.message || "Email hoặc mật khẩu không đúng";
        toast.error(failMsg);
        setError(failMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Lỗi kết nối đến máy chủ";
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Mã OTP phải có 6 chữ số");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/2fa/verify-login", {
        email,
        token: otp,
      });

      if (res.data.errCode === 0) {
        const userData = {
          ...res.data.user,
          access_token: res.data.access_token,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        dispatch(login(userData));
        toast.success("Xác thực 2FA thành công!");
        navigate("/");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Mã xác thực không hợp lệ";
      toast.error(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPIN = async (e) => {
    if (e) e.preventDefault();
    if (pin.length !== 6) {
      toast.error("Mã PIN phải có 6 chữ số");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/user/verify-pin", {
        email,
        pin,
      });

      if (res.data.errCode === 0) {
        const userData = {
          ...res.data.user,
          access_token: res.data.access_token,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        dispatch(login(userData));
        toast.success("Xác thực mã PIN thành công!");
        navigate("/");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Mã PIN không chính xác";
      toast.error(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center p-4 relative overflow-hidden text-white font-inter">
      {/* Ambient Animated Glow Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-600/15 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Main Glass Card Container */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl shadow-2xl rounded-3xl p-7 sm:p-9 border border-slate-800 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="size-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-500 p-0.5 shadow-xl shadow-indigo-500/25 mb-4 group hover:scale-105 transition-transform duration-300">
            <div className="size-full bg-slate-900 rounded-[0.9rem] flex items-center justify-center">
              <FiBox className="size-8 text-sky-400" />
            </div>
          </div>
          <Badge variant="primary" className="mb-2 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            SMART WMS V3.6 PRO
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Chào Mừng Quay Trở Lại
          </h1>
          <p className="text-slate-400 mt-1 text-xs font-medium">
            Đăng nhập tài khoản quản trị kho hàng thời gian thực
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSignin}>
          <Input
            label="Địa chỉ Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@smartwms.com"
            required
            disabled={isLoading}
            leftIcon={<FiMail className="size-4" />}
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu…"
            required
            disabled={isLoading}
            leftIcon={<FiLock className="size-4" />}
          />

          {error && !needs2FA && !needsPIN && (
            <div className="text-rose-400 text-xs font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 animate-shake text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-3.5 text-sm font-extrabold tracking-tight mt-2"
            size="lg"
            variant="gradient"
            isLoading={isLoading}
            rightIcon={<FiArrowRight className="size-4" />}
          >
            Đăng Nhập Ngay
          </Button>
        </form>

        <div className="mt-7 pt-5 border-t border-slate-800 flex flex-col items-center">
          <p className="text-xs text-slate-400 font-medium">
            Chưa có tài khoản?{" "}
            <Link
              to="/sign-up"
              className="text-sky-400 font-black hover:text-sky-300 transition-colors ml-1"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>

      {/* 2FA Modal */}
      <Modal
        isOpen={needs2FA}
        onClose={() => {
          setNeeds2FA(false);
          setOtp("");
          setError("");
        }}
        title="Xác thực bảo mật 2FA"
        size="sm"
      >
        <form className="space-y-5 p-1" onSubmit={handleVerify2FA}>
          <div className="flex flex-col items-center text-center">
            <div className="size-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <FiShield size={28} />
            </div>
            <p className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-4">
              Nhập mã OTP 6 chữ số từ ứng dụng Authenticator của bạn
            </p>
            <Input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em] font-black py-4"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-error text-xs font-bold bg-error/10 p-2.5 rounded-xl border border-error/20 text-center">
              {error}
            </div>
          )}

          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setNeeds2FA(false);
                setError("");
                setOtp("");
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-[2]"
              variant="gradient"
              isLoading={isLoading}
            >
              Xác nhận OTP
            </Button>
          </div>
        </form>
      </Modal>

      {/* PIN Modal */}
      <Modal
        isOpen={needsPIN}
        onClose={() => {
          setNeedsPIN(false);
          setPin("");
          setError("");
        }}
        title="Xác thực Mã PIN Bảo mật"
        size="sm"
      >
        <form className="space-y-5 p-1" onSubmit={handleVerifyPIN}>
          <div className="flex flex-col items-center text-center">
            <div className="size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <FiLock size={28} />
            </div>
            <p className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-4">
              Nhập mã PIN 6 chữ số để xác nhận quyền truy cập
            </p>
            <Input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="••••••"
              className="text-center text-2xl tracking-[0.5em] font-black py-4"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-error text-xs font-bold bg-error/10 p-2.5 rounded-xl border border-error/20 text-center">
              {error}
            </div>
          )}

          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setNeedsPIN(false);
                setError("");
                setPin("");
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-[2]"
              variant="gradient"
              isLoading={isLoading}
            >
              Xác nhận PIN
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SignIn;
