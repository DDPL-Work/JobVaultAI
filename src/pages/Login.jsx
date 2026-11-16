import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsFillEyeSlashFill, BsFillEyeFill } from "react-icons/bs";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@company.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!password) {
      showToast("Please enter your password");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      try {
        localStorage.setItem("jv_token", "admin_session_token");
        localStorage.setItem("jobvault_auth", "true");
      } catch {
        // ignore
      }
      showToast("Signed in successfully! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    }, 500);
  };

  return (
    <div className="h-screen max-h-screen w-full flex bg-white overflow-hidden select-none relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-60 bg-[#15202C] text-white px-4 py-2.5 rounded-[8px] font-semibold text-[0.85rem] shadow-[0_10px_30px_rgba(21,32,44,0.2)] animate-in fade-in slide-in-from-top-2 duration-150 select-none">
          {toastMessage}
        </div>
      )}

      {/* Left Hero Artwork Layer: 4K Ultra-HD Banner balancing 50/50 with right section */}
      <div className="hidden lg:block absolute inset-y-0 left-0 w-[54%] xl:w-[52%] 2xl:w-[50%] pointer-events-none select-none z-0">
        <img
          src="/public/login image.jpg"
          alt="JobVault AI - Smarter Job Data Extraction with AI"
          className="w-full h-full object-cover object-left"
        />
      </div>

      {/* Right Column: Equal 50% Section (braber 50/50 balance) */}
      <div className="relative z-10 ml-auto w-full lg:w-1/2 h-full flex flex-col justify-center items-center px-6 sm:px-10 lg:px-12 py-4 overflow-hidden">
        {/* Top-Right Faint Golden Dot Matrix exactly matching Reference Image */}
        <div className="absolute top-4 right-6 sm:right-8 pointer-events-none select-none z-0">
          <svg width="96" height="84" viewBox="0 0 96 84" fill="none" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, r) =>
              Array.from({ length: 8 }).map((_, c) => (
                <circle
                  key={`tr-${r}-${c}`}
                  cx={c * 12 + 6}
                  cy={r * 12 + 6}
                  r={1.15}
                  fill="#DFBA73"
                  opacity="0.45"
                />
              ))
            )}
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

        {/* Form Content Wrapper */}
        <div className="w-full max-w-[390px] z-10 flex flex-col my-auto">
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

            {/* ADMIN PORTAL Badge with hairline lines extending to left and right */}
            <div className="flex items-center gap-2.5 mt-2.5 w-full">
              <div className="h-[1px] bg-[#E2E8F0] w-12 sm:w-16" />
              <span className="bg-[#FDF4E2] text-[#8A5C14] text-[0.66rem] font-bold tracking-[0.08em] px-2.5 py-0.5 rounded-[5px] uppercase border border-[#F5EAD3] inline-block shrink-0 shadow-2xs">
                ADMIN PORTAL
              </span>
              <div className="h-[1px] bg-[#E2E8F0] flex-1" />
            </div>
          </div>

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
                <span>Email address</span>
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
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
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

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-[0.83rem] mt-0.5">
              <label className="flex items-center gap-2 text-[#5A6777] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#DCE1E8] accent-[#C68A1E] cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => showToast("Password reset link sent to your email.")}
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
  );
}
