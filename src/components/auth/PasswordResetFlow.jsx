import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  BsFillEyeSlashFill,
  BsFillEyeFill,
  BsCheckCircleFill,
  BsArrowLeft,
} from "react-icons/bs";
import {
  forgotPassword,
  verifyResetOtp,
  resetUserPassword,
} from "../../apis/thunks/authThunks";

export default function PasswordResetFlow({
  initialStep = "forgot",
  initialEmail = "",
  onBackToLogin,
  onResetComplete,
}) {
  const dispatch = useDispatch();

  // Step state: "forgot" | "otp" | "reset"
  const [step, setStep] = useState(initialStep);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);

  // OTP State: 6 individual digit slots
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const otpInputRefs = useRef([]);

  // New Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync step if prop changes
  useEffect(() => {
    if (initialStep) setStep(initialStep);
  }, [initialStep]);

  // Countdown timer for OTP
  useEffect(() => {
    let interval = null;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // -------------------------------------------------------------
  // STEP 1: Request Password Reset (/api/auth/forgot-password/)
  // -------------------------------------------------------------
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const cleanEmail = (email || "").trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.warning("Please enter a valid registered email address");
      return;
    }

    setLoading(true);

    try {
      const res = await dispatch(forgotPassword(cleanEmail)).unwrap();
      setOtp(["", "", "", "", "", ""]);
      setVerifiedOtp("");
      setResendTimer(60);
      setStep("otp");
      toast.success(
        res?.message || `Verification code sent to ${cleanEmail}`
      );
    } catch (err) {
      const msg =
        (typeof err === "string" ? err : err?.message) ||
        "Unable to send reset code. Please verify your email address.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 2: Verify 6-Digit OTP (/api/auth/verify-reset-token/)
  // -------------------------------------------------------------
  const handleOtpChange = (value, index) => {
    // Only accept numeric characters
    const cleanVal = value.replace(/[^0-9]/g, "").slice(-1);

    const updated = [...otp];
    updated[index] = cleanVal;
    setOtp(updated);

    // Auto-advance to next input if digit entered
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move focus to previous input on backspace if current is empty
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pastedData) return;

    const digits = pastedData.split("");
    const updated = [...otp];
    digits.forEach((digit, idx) => {
      if (idx < 6) updated[idx] = digit;
    });
    setOtp(updated);

    // Focus last filled slot
    const targetIdx = Math.min(digits.length, 5);
    otpInputRefs.current[targetIdx]?.focus();

    if (pastedData.length === 6) {
      toast.info("6-digit OTP pasted!");
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    const cleanEmail = (email || "").trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.warning("Please enter a valid email address");
      setStep("forgot");
      return;
    }

    setLoading(true);
    try {
      const res = await dispatch(forgotPassword(cleanEmail)).unwrap();
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(60);
      toast.success(res?.message || `New OTP sent to ${cleanEmail}`);
    } catch (err) {
      const msg =
        (typeof err === "string" ? err : err?.message) ||
        "Failed to resend verification code.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      toast.warning("Please enter the complete 6-digit OTP code");
      return;
    }

    setLoading(true);

    try {
      const res = await dispatch(
        verifyResetOtp({ email, otp: enteredOtp })
      ).unwrap();
      setVerifiedOtp(enteredOtp);
      toast.success(res?.message || "OTP verified successfully!");
      setStep("reset");
    } catch (err) {
      const msg =
        (typeof err === "string" ? err : err?.message) ||
        "Invalid or expired verification code. Please check and try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 3: Reset Password (/api/auth/reset-password/)
  // -------------------------------------------------------------
  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass) && pass.length >= 10) score += 1;
    return score;
  };

  const strength = calculatePasswordStrength(newPassword);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      toast.warning("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      toast.warning("Password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await dispatch(
        resetUserPassword({
          email,
          otp: verifiedOtp || otp.join(""),
          newPassword,
          confirmPassword,
        })
      ).unwrap();
      toast.success(
        res?.message || "Password reset successfully! Redirecting to sign in..."
      );
      if (onResetComplete) {
        onResetComplete(email);
      } else if (onBackToLogin) {
        onBackToLogin();
      }
    } catch (err) {
      const msg =
        (typeof err === "string" ? err : err?.message) ||
        "Could not reset password. Please check your OTP or password requirements.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-start animate-in fade-in slide-in-from-right-3 duration-200">
      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: Email Input (/api/auth/forgot-password) */}
      {/* ------------------------------------------------------------- */}
      {step === "forgot" && (
        <div className="w-full flex flex-col">
          {/* Header & Badging matching Login */}
          <div className="flex items-center gap-2.5 mt-2.5 w-full">
            <div className="h-[1px] bg-[#E2E8F0] w-12 sm:w-16" />
            <span className="bg-[#FDF4E2] text-[#8A5C14] text-[0.66rem] font-bold tracking-[0.08em] px-2.5 py-0.5 rounded-[5px] uppercase border border-[#F5EAD3] inline-block shrink-0 shadow-2xs">
              ACCOUNT RECOVERY
            </span>
            <div className="h-[1px] bg-[#E2E8F0] flex-1" />
          </div>

          <div className="mt-6 mb-4.5">
            <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[2.05rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
              Reset password
            </h1>
            <p className="mt-1 text-[#5A6777] text-[0.91rem] leading-normal m-0">
              Enter your email to receive a secure 6-digit OTP code.
            </p>
          </div>

          <form onSubmit={handleRequestOtp} className="flex flex-col gap-3.5 w-full">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reset-email"
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
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full h-[45px] pl-10 pr-3.5 border border-[#DCE1E8] rounded-[8px] text-[0.88rem] text-[#15202C] placeholder:text-[#93A1B1] bg-white focus:outline-2 focus:outline-[#9C6B12] focus:border-transparent transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[45px] bg-[#C68A1E] hover:bg-[#B37814] active:scale-[0.99] text-white rounded-[8px] font-semibold text-[0.94rem] flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_14px_rgba(198,138,30,0.3)] cursor-pointer mt-1"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send 6-Digit Code</span>
                  <svg
                    className="w-4 h-4 stroke-current fill-none stroke-[2.2]"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>

            {/* Back to Sign In Link */}
            <div className="flex items-center justify-center mt-2">
              <button
                type="button"
                onClick={onBackToLogin}
                className="inline-flex items-center gap-2 text-[0.85rem] font-medium text-[#5A6777] hover:text-[#15202C] transition-colors cursor-pointer"
              >
                <BsArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: 6-Digit OTP Verification (/api/auth/verify-reset-token) */}
      {/* ------------------------------------------------------------- */}
      {step === "otp" && (
        <div className="w-full flex flex-col">
          {/* Header & Badging */}
          <div className="flex items-center gap-2.5 mt-2.5 w-full">
            <div className="h-[1px] bg-[#E2E8F0] w-12 sm:w-16" />
            <span className="bg-[#FDF4E2] text-[#8A5C14] text-[0.66rem] font-bold tracking-[0.08em] px-2.5 py-0.5 rounded-[5px] uppercase border border-[#F5EAD3] inline-block shrink-0 shadow-2xs">
              VERIFY 6-DIGIT OTP
            </span>
            <div className="h-[1px] bg-[#E2E8F0] flex-1" />
          </div>

          <div className="mt-6 mb-3">
            <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[2.05rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
              Check your email
            </h1>
            <p className="mt-1 text-[#5A6777] text-[0.88rem] leading-normal m-0">
              We sent a 6-digit code to{" "}
              <strong className="text-[#15202C] font-semibold break-all">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3.5 w-full">
            {/* 6-Digit Inputs Grid */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.83rem] font-semibold text-[#15202C] flex items-center justify-between">
                <span>Enter verification code</span>
                <button
                  type="button"
                  onClick={() => setStep("forgot")}
                  className="text-[0.78rem] text-[#C68A1E] hover:underline font-normal cursor-pointer"
                >
                  Change email
                </button>
              </label>

              <div
                className="grid grid-cols-6 gap-2 w-full my-1"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    className={`h-[48px] text-center text-[1.25rem] font-bold rounded-[8px] border transition-all ${
                      digit
                        ? "border-[#C68A1E] bg-[#FDF9F2] text-[#15202C] ring-2 ring-[#C68A1E]/20"
                        : "border-[#DCE1E8] bg-white text-[#15202C] focus:border-[#C68A1E] focus:outline-none focus:ring-2 focus:ring-[#9C6B12]/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Resend OTP Status */}
            <div className="bg-[#FAF7F2] border border-[#EFE8DD] rounded-[7px] px-3 py-2 flex items-center justify-between text-[0.78rem]">
              <span className="text-[#5A6777]">
                Didn&apos;t receive the code?
              </span>

              {resendTimer > 0 ? (
                <span className="text-[#8A5C14] font-medium">
                  Resend in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResendOtp}
                  className="font-bold text-[#C68A1E] hover:text-[#9C6B12] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[45px] bg-[#C68A1E] hover:bg-[#B37814] active:scale-[0.99] text-white rounded-[8px] font-semibold text-[0.94rem] flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_14px_rgba(198,138,30,0.3)] cursor-pointer mt-1"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify Code</span>
                  <BsCheckCircleFill className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Back to Sign In Link */}
            <div className="flex items-center justify-center mt-1">
              <button
                type="button"
                onClick={onBackToLogin}
                className="inline-flex items-center gap-2 text-[0.85rem] font-medium text-[#5A6777] hover:text-[#15202C] transition-colors cursor-pointer"
              >
                <BsArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel & back to sign in</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 3: Password Reset Form (/api/auth/reset-password) */}
      {/* ------------------------------------------------------------- */}
      {step === "reset" && (
        <div className="w-full flex flex-col">
          {/* Header & Badging */}
          <div className="flex items-center gap-2.5 mt-2.5 w-full">
            <div className="h-[1px] bg-[#E2E8F0] w-12 sm:w-16" />
            <span className="bg-[#EBF7EE] text-[#1E7E34] text-[0.66rem] font-bold tracking-[0.08em] px-2.5 py-0.5 rounded-[5px] uppercase border border-[#D4EDDA] inline-block shrink-0 shadow-2xs">
              TOKEN VERIFIED
            </span>
            <div className="h-[1px] bg-[#E2E8F0] flex-1" />
          </div>

          <div className="mt-6 mb-4">
            <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[2.05rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
              Set new password
            </h1>
            <p className="mt-1 text-[#5A6777] text-[0.88rem] leading-normal m-0">
              Identity verified. Choose a strong new password for your account.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="flex flex-col gap-3 w-full">
            {/* New Password Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="new-password"
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
                <span>New password</span>
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
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 8 chars)"
                  className="w-full h-[45px] pl-10 pr-10 border border-[#DCE1E8] rounded-[8px] text-[0.88rem] text-[#15202C] placeholder:text-[#93A1B1] bg-white focus:outline-2 focus:outline-[#9C6B12] focus:border-transparent transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 text-[#5A6777] hover:text-[#15202C] transition-colors cursor-pointer p-0.5 flex items-center justify-center"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <BsFillEyeFill className="w-[18px] h-[18px]" />
                  ) : (
                    <BsFillEyeSlashFill className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="flex flex-col gap-1 mt-0.5">
                  <div className="flex gap-1.5 h-1 w-full">
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        strength >= 1 ? (strength === 1 ? "bg-amber-400" : "bg-emerald-500") : "bg-[#E2E8F0]"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        strength >= 2 ? "bg-emerald-500" : "bg-[#E2E8F0]"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        strength >= 3 ? "bg-emerald-600" : "bg-[#E2E8F0]"
                      }`}
                    />
                  </div>
                  <span className="text-[0.72rem] text-[#5A6777]">
                    {strength === 1 && "Moderate — add numbers or symbols"}
                    {strength >= 2 && "Strong password"}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirm-password"
                className="flex items-center justify-between text-[0.83rem] font-semibold text-[#15202C]"
              >
                <div className="flex items-center gap-1.5">
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>Confirm new password</span>
                </div>
                {confirmPassword && (
                  <span
                    className={`text-[0.75rem] font-normal ${
                      newPassword === confirmPassword ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {newPassword === confirmPassword ? "Passwords match ✓" : "Does not match"}
                  </span>
                )}
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
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full h-[45px] pl-10 pr-10 border border-[#DCE1E8] rounded-[8px] text-[0.88rem] text-[#15202C] placeholder:text-[#93A1B1] bg-white focus:outline-2 focus:outline-[#9C6B12] focus:border-transparent transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 text-[#5A6777] hover:text-[#15202C] transition-colors cursor-pointer p-0.5 flex items-center justify-center"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <BsFillEyeFill className="w-[18px] h-[18px]" />
                  ) : (
                    <BsFillEyeSlashFill className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Reset Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[45px] bg-[#C68A1E] hover:bg-[#B37814] active:scale-[0.99] text-white rounded-[8px] font-semibold text-[0.94rem] flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_14px_rgba(198,138,30,0.3)] cursor-pointer mt-1.5"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Update Password & Sign in</span>
                  <svg
                    className="w-4 h-4 stroke-current fill-none stroke-[2.2]"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>

            {/* Cancel Button */}
            <div className="flex items-center justify-center mt-1">
              <button
                type="button"
                onClick={onBackToLogin}
                className="inline-flex items-center gap-2 text-[0.85rem] font-medium text-[#5A6777] hover:text-[#15202C] transition-colors cursor-pointer"
              >
                <BsArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel & back to sign in</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
