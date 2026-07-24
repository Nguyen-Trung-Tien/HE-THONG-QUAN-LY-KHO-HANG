import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { SignUpUser } from "../API/user/userApi";

// Common Components
import Button from "./common/Button";
import Input from "./common/Input";
import Badge from "./common/Badge";
import { FiUserPlus, FiLock, FiMail, FiArrowRight, FiSun, FiMoon } from "react-icons/fi";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });
  const navigate = useNavigate();
  const access_token = useSelector((state) => state.user.access_token);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (access_token) {
    return <Navigate to="/" replace />;
  }

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      return setError("Vui lòng nhập đầy đủ thông tin!");
    }
    if (password !== confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp!");
    }

    setIsLoading(true);
    setError("");

    try {
      const dataToSend = { email, password, confirmPassword };
      const data = await SignUpUser(dataToSend);
      if (data?.errCode === 0) {
        toast.success("Tạo tài khoản thành công!");
        navigate("/sign-in");
      } else {
        const failMsg = data.message || "Đăng ký thất bại";
        setError(failMsg);
        toast.error(failMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Đăng ký thất bại.";
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen flex items-center justify-center p-4 relative overflow-hidden text-slate-900 dark:text-white font-inter transition-colors duration-300">
      {/* Theme Toggle Button */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2.5 px-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 z-20 flex items-center gap-2 group cursor-pointer"
        title={isDark ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"}
        aria-label="Toggle Theme"
      >
        {isDark ? (
          <>
            <FiSun className="size-4.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            <span className="text-xs font-bold hidden sm:inline">Chế độ sáng</span>
          </>
        ) : (
          <>
            <FiMoon className="size-4.5 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
            <span className="text-xs font-bold hidden sm:inline">Chế độ tối</span>
          </>
        )}
      </button>

      {/* Ambient Animated Glow Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Main Glass Card Container */}
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl rounded-3xl p-7 sm:p-9 border border-slate-200/80 dark:border-slate-800 relative z-10 animate-in fade-in zoom-in-95 duration-500 transition-colors duration-300">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="size-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-500 p-0.5 shadow-xl shadow-indigo-500/25 mb-4 group hover:scale-105 transition-transform duration-300">
            <div className="size-full bg-slate-100 dark:bg-slate-900 rounded-[0.9rem] flex items-center justify-center transition-colors duration-300">
              <FiUserPlus className="size-8 text-sky-500 dark:text-sky-400" />
            </div>
          </div>
          <Badge variant="primary" className="mb-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
            SMART WMS ACCOUNT
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Tạo Tài Khoản Mới
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs font-medium">
            Gia nhập đội ngũ quản lý kho hàng chuyên nghiệp
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSignUp();
          }}
        >
          <Input
            label="Địa chỉ Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
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

          <Input
            label="Xác nhận mật khẩu"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu…"
            required
            disabled={isLoading}
            leftIcon={<FiLock className="size-4" />}
          />

          {error && (
            <div className="text-rose-600 dark:text-rose-400 text-xs font-bold bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-200 dark:border-rose-500/20 animate-shake text-center">
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
            Đăng Ký Ngay
          </Button>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Bạn đã có tài khoản?{" "}
              <span
                onClick={() => navigate("/sign-in")}
                className="text-sky-600 dark:text-sky-400 font-black hover:text-sky-700 dark:hover:text-sky-300 transition-colors cursor-pointer ml-1"
              >
                Đăng nhập ngay
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
