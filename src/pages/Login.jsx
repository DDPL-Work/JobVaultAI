import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { BsFillEyeSlashFill, BsFillEyeFill } from "react-icons/bs";
import RobotBrandLoader from "../components/common/RobotBrandLoader";
import PasswordResetFlow from "../components/auth/PasswordResetFlow";
import { loginUser } from "../apis/thunks/authThunks";
import authService from "../apis/authService";

export default function Login({ initialMode = "login" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: "login" | "forgot" | "otp" | "reset"
  const [authMode, setAuthMode] = useState(() => {
    if (initialMode && initialMode !== "login") return initialMode;
    if (location.pathname === "/forgot-password") return "forgot";
    if (location.pathname === "/verify-otp") return "otp";
    if (location.pathname === "/reset-password") return "reset";
    return "login";
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState("");

  // Sync mode if initialMode prop or pathname changes
  useEffect(() => {
    if (initialMode && initialMode !== "login") {
      setAuthMode(initialMode);
    } else if (location.pathname === "/forgot-password") {
      setAuthMode("forgot");
    } else if (location.pathname === "/verify-otp") {
      setAuthMode("otp");
    } else if (location.pathname === "/reset-password") {
      setAuthMode("reset");
    }
  }, [initialMode, location.pathname]);

  // Unique Loader ONLY runs at one place: strictly on initial landing at http://localhost:5173/
  // Never on sign-in redirect to dashboard, and never on sign out.
  const [showLoader, setShowLoader] = useState(() => {
    // 1. If coming from sign out (sessionStorage flag or router location state):
    try {
      if (sessionStorage.getItem("jv_signed_out") === "true") {
        sessionStorage.removeItem("jv_signed_out");
        return false;
      }
    } catch {
      // ignore
    }

    if (location.state?.fromSignOut) {
      return false;
    }

    // 2. Only show intro loader once per session when hitting http://localhost:5173/
    try {
      if (initialMode && initialMode !== "login") {
        return false;
      }
      if (sessionStorage.getItem("jv_intro_shown") === "true") {
        return false;
      }
      sessionStorage.setItem("jv_intro_shown", "true");
      return true;
    } catch {
      return false;
    }
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanUser = (email || "").trim();
    if (!cleanUser) {
      toast.warning("Please enter your user name or email");
      return;
    }
    if (!password) {
      toast.warning("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      // 100% Dynamic authentication directly against backend DB via Redux Thunk
      const result = await dispatch(
        loginUser({ username: cleanUser, email: cleanUser, password })
      ).unwrap();

      toast.success(result.raw?.message || "Signed in successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login attempt failed:", err);
      const message =
        (typeof err === "string" ? err : err?.message) ||
        "Login failed. Please check your user name and password, or verify server connection.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Unique GSAP Robot & Branding Loader: ONLY runs when hitting http://localhost:5173/ initially */}
      {showLoader && (
        <RobotBrandLoader
          duration={3.5}
          mode="entry"
          onComplete={() => {
            // Once initial intro loader finishes, reveal login page
            setShowLoader(false);
          }}
        />
      )}

      <div className="h-screen max-h-screen w-full flex bg-white overflow-hidden select-none relative">
        {/* Left Hero Artwork Layer: Full-height hero banner with Middle White Fog Blending */}
        <div className="hidden lg:flex relative flex-1 h-full items-center justify-center overflow-hidden bg-white">
          <img
            src="/login3.png"
            onError={(e) => {
              if (!e.currentTarget.src.includes("login image next.png")) {
                e.currentTarget.src = "/login image next.png";
              }
            }}
            alt="JobVault AI - Smarter Job Data Extraction with AI"
            className="w-full h-full object-cover object-center block select-none pointer-events-none"
          />

          {/* Middle Blending Effect – Smooth Soft White Fog Gradient on the right edge */}
          <div
            className="absolute inset-y-0 right-0 w-24 sm:w-32 md:w-40 lg:w-25 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.68) 75%, rgba(255,255,255,0.92) 90%, #FFFFFF 100%)",
            }}
          />
        </div>

        {/* Right Column: Seamless continuous white background for the login form */}
        <div className="relative z-10 ml-auto w-full lg:w-[470px] xl:w-[510px] 2xl:w-[540px] shrink-0 h-full flex flex-col justify-center items-center px-8 sm:px-10 lg:px-5 py-3 overflow-hidden bg-white">
          {/* Top-Right Soft Champagne Ribbon Wave (Matching reference design) */}
          <div className="absolute top-0 right-0 w-72 sm:w-96 h-40 sm:h-52 pointer-events-none select-none z-0 overflow-hidden">
            <svg
              viewBox="0 0 360 180"
              fill="none"
              className="w-full h-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="topGoldWave" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#DF9F2D" stopOpacity="0.18" />
                  <stop offset="50%" stopColor="#F5DFB3" stopOpacity="0.09" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M360 0 C240 15, 160 70, 80 180 L360 180 Z"
                fill="url(#topGoldWave)"
              />
            </svg>
          </div>

          {/* Bottom-Right Golden Wave Swoosh in Pure Scalable Vector SVG */}
          <div className="absolute bottom-0 right-0 w-64 sm:w-76 md:w-84 h-28 sm:h-32 md:h-36 pointer-events-none select-none z-0 overflow-hidden">
            <svg
              viewBox="0 0 340 140"
              fill="none"
              className="w-full h-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="goldBackWave" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#DF9F2D" stopOpacity="0.22" />
                  <stop offset="50%" stopColor="#F5DFB3" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#FBF2DF" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="goldFrontWave" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C68A1E" stopOpacity="0.92" />
                  <stop offset="45%" stopColor="#DF9F2D" stopOpacity="0.88" />
                  <stop offset="85%" stopColor="#F3CB77" stopOpacity="0.78" />
                  <stop offset="100%" stopColor="#FDF5E6" stopOpacity="0.35" />
                </linearGradient>
              </defs>
              {/* Layer 1: Background Soft Champagne Wave */}
              <path
                d="M40 140 C130 132, 210 92, 340 32 L340 140 Z"
                fill="url(#goldBackWave)"
              />
              {/* Layer 2: Foreground Rich Golden Wave */}
              <path
                d="M115 140 C190 136, 255 102, 340 58 L340 140 Z"
                fill="url(#goldFrontWave)"
              />
            </svg>
          </div>

          {/* Form Content Wrapper matching reference layout */}
          <div className="w-full max-w-[400px] sm:max-w-[430px] z-10 flex flex-col my-auto">
          {/* Brand Identity Header matching reference */}
          <div className="flex flex-col items-start w-full">
            <div className="flex items-center gap-3">
              <div className="w-[46px] h-[46px] rounded-[11px] bg-[#C68A1E] text-white flex items-center justify-center font-['Bricolage_Grotesque',sans-serif] font-bold text-[1.28rem] shadow-sm shrink-0">
                JV
              </div>
              <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[1.65rem] text-[#15202C] tracking-tight leading-none">
                JobVault AI
              </span>
            </div>

            {/* ADMIN PORTAL Badge (shown on login mode) */}
            {authMode === "login" && (
              <div className="flex items-center gap-2.5 mt-2.5 w-full">
                <div className="h-[1px] bg-[#E2E8F0] w-12 sm:w-16" />
                <span className="bg-[#FDF4E2] text-[#8A5C14] text-[0.66rem] font-bold tracking-[0.08em] px-2.5 py-0.5 rounded-[5px] uppercase border border-[#F5EAD3] inline-block shrink-0 shadow-2xs">
                  ADMIN PORTAL
                </span>
                <div className="h-[1px] bg-[#E2E8F0] flex-1" />
              </div>
            )}
          </div>

          {/* MAIN FORM AREA: Switch between Sign-in and Password Reset Flow */}
          {authMode === "login" ? (
            <>
              {/* Optional Success Notice when returning from Password Reset */}
              {successNotice && (
                <div className="mt-4 px-3 py-2 bg-[#EBF7EE] border border-[#D4EDDA] rounded-[8px] text-[0.8rem] text-[#1E7E34] flex items-center gap-2 w-full animate-in fade-in duration-200">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{successNotice}</span>
                </div>
              )}

              {/* Welcome Headlines */}
              <div className="mt-6 mb-4.5">
                <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[2.05rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
                  Welcome back
                </h1>
                <p className="mt-1 text-[#5A6777] text-[0.91rem] leading-normal m-0">
                  Sign in to continue to your workspace.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="flex flex-col gap-3">
                {/* Email Address Field */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="login-email"
                    className="flex items-center gap-1.5 text-[0.83rem] font-semibold text-[#15202C]"
                  >
                    <svg
                      className="w-4 h-4 text-[#15202C]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>User Name</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-[#5A6777] pointer-events-none">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="M3 7l9 6 9-6" />
                      </svg>
                    </span>
                    <input
                      id="login-email"
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your user name"
                      className="w-full h-[45px] pl-10 pr-3.5 border border-[#DCE1E8] rounded-[8px] text-[0.88rem] text-[#15202C] placeholder:text-[#93A1B1] bg-white focus:outline-2 focus:outline-[#9C6B12] focus:border-transparent transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Password Field with pristine Eye/Eye-Off toggle */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="login-password"
                    className="flex items-center gap-1.5 text-[0.83rem] font-semibold text-[#15202C]"
                  >
                    <svg
                      className="w-4 h-4 text-[#15202C]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Password</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-[#5A6777] pointer-events-none">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect x="4" y="10" width="16" height="11" rx="2" />
                        <circle cx="12" cy="15" r="1.5" />
                        <path d="M8 10V7a4 4 0 018 0v3" />
                      </svg>
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-[45px] pl-10 pr-10 border border-[#DCE1E8] rounded-[8px] text-[0.88rem] text-[#15202C] placeholder:text-[#93A1B1] bg-white focus:outline-2 focus:outline-[#9C6B12] focus:border-transparent transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-[#5A6777] hover:text-[#15202C] transition-colors cursor-pointer p-0.5 flex items-center justify-center"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <BsFillEyeFill className="w-[18px] h-[18px]" />
                      ) : (
                        <BsFillEyeSlashFill className="w-[18px] h-[18px]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link: Transitions to Password Recovery Flow */}
                <div className="flex items-center justify-end text-[0.83rem] mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessNotice("");
                      setAuthMode("forgot");
                    }}
                    className="font-medium text-[#C68A1E] hover:text-[#9C6B12] transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[45px] bg-[#C68A1E] hover:bg-[#B37814] active:scale-[0.99] text-white rounded-[8px] font-semibold text-[0.94rem] flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_14px_rgba(198,138,30,0.3)] cursor-pointer mt-1.5"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg
                        className="w-4.5 h-4.5 stroke-current fill-none stroke-[2.2]"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                      <span>Sign in</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* 3-Step Password Reset Flow: Email -> 6-Digit OTP -> New Password Form */
            <PasswordResetFlow
              initialStep={authMode}
              initialEmail={email.includes("@") ? email : ""}
              onBackToLogin={() => setAuthMode("login")}
              onResetComplete={(newEmail) => {
                if (newEmail) setEmail(newEmail);
                setPassword("");
                setSuccessNotice("Password updated successfully! Sign in with your new credentials.");
                setAuthMode("login");
              }}
            />
          )}

          {/* Secure Access Footer with left & right divider lines matching reference */}
          <div className="mt-7 flex items-center justify-center gap-3 text-[0.78rem] text-[#5A6777] w-full">
            <div className="h-[1px] bg-[#E2E8F0] flex-1 max-w-[50px]" />
            <div className="flex items-center gap-1.5 shrink-0">
              <svg
                className="w-4 h-4 text-[#9C6B12]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Secure access to your JobVault workspace</span>
            </div>
            <div className="h-[1px] bg-[#E2E8F0] flex-1 max-w-[50px]" />
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
