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
import { FiShield, FiArrowLeft, FiLock } from "react-icons/fi";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [needsPIN, setNeedsPIN] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      if (res.data.success) {
        const userData = {
          ...res.data.user,
          access_token: res.data.access_token,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        dispatch(login(userData));
        toast.success("Xác thực thành công!");
        navigate("/");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Mã xác thực không đúng";
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
      const res = await axiosInstance.post("/pin/verify-login", {
        email,
        pin,
      });

      if (res.data.success) {
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
    <div className="bg-bg-light/50 dark:bg-dark-bg min-h-screen flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/10 dark:bg-accent/20 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="w-full max-w-sm bg-white/70 dark:bg-dark-card/70 backdrop-blur-2xl shadow-soft-xl rounded-[2rem] p-8 border border-white/40 dark:border-dark-border/40 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="size-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/40 mb-5 transform rotate-6 hover:rotate-0 transition-transform duration-500">
            <svg
              className="size-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-text-primary dark:text-dark-text-primary tracking-tighter text-center leading-tight">
            Chào mừng <br /> quay trở lại!
          </h1>
          <p className="text-text-secondary mt-2 text-xs font-semibold tracking-tight text-center">
            Đăng nhập vào Smart WMS v3.6.0
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSignin}>
          <Input
            label="Địa chỉ Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            disabled={isLoading}
            className="py-3 text-xs"
            leftIcon={
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
          />

          <div className="relative">
            <Input
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu…"
              required
              disabled={isLoading}
              className="py-3 text-xs"
              leftIcon={
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
              rightIcon={
                <button
                  type="button"
                  className="text-text-tertiary hover:text-primary transition-colors focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              }
            />
          </div>

          {error && !needs2FA && !needsPIN && (
            <div className="text-error text-[10px] font-black bg-error/10 p-3 rounded-xl border border-error/20 animate-shake">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-3.5 text-sm font-black tracking-tight"
            size="md"
            variant="primary"
            isLoading={isLoading}
          >
            Đăng nhập ngay
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col items-center">
          <p className="text-xs text-text-secondary font-medium">
            Chưa có tài khoản?{" "}
            <Link
              to="/sign-up"
              className="text-primary font-black hover:text-primary-dark transition-colors"
            >
              Đăng ký
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
        title="Xác thực bảo mật"
        size="sm"
      >
        <form className="space-y-6 p-2" onSubmit={handleVerify2FA}>
          <div className="flex flex-col items-center">
            <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <FiShield size={32} />
            </div>
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest text-center mb-6">
              Vui lòng nhập mã OTP từ ứng dụng Google Authenticator của bạn
            </p>
            <Input
              label="Mã xác thực"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="000000"
              className="text-center text-3xl tracking-[0.5em] font-black h-20 bg-bg-subtle/30"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-error text-[10px] font-black bg-error/5 p-3 rounded-xl border border-error/10 animate-shake text-center">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-2xl"
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
              className="flex-[2] rounded-2xl"
              variant="primary"
              isLoading={isLoading}
            >
              Xác nhận
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
        title="Mã PIN Bảo mật"
        size="sm"
      >
        <form className="space-y-6 p-2" onSubmit={handleVerifyPIN}>
          <div className="flex flex-col items-center">
            <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <FiLock size={32} />
            </div>
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest text-center mb-6">
              Nhập mã PIN 6 chữ số để xác nhận danh tính của bạn
            </p>
            <Input
              label="Mã PIN"
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="••••••"
              className="text-center text-3xl tracking-[0.8em] font-black h-20 bg-bg-subtle/30"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-error text-[10px] font-black bg-error/5 p-3 rounded-xl border border-error/10 animate-shake text-center">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-2xl"
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
              className="flex-[2] rounded-2xl"
              variant="primary"
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
