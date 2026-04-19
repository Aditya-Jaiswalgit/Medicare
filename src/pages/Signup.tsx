import { useState } from "react";
import { Link } from "react-router-dom";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// -- Floating animated pill ----------------------------------------
function FloatPill({
  style,
  animDuration,
  delay = "0s",
  iconBg,
  iconColor,
  icon,
  value,
  label,
}: {
  style: React.CSSProperties;
  animDuration: string;
  delay?: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div
      className="absolute bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-lg"
      style={{
        ...style,
        animation: `floatPill ${animDuration} ease-in-out infinite ${delay}`,
      }}
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0`}
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{ fontFamily: "'Fraunces', serif" }}
          className="text-[14px] font-bold text-white leading-none"
        >
          {value}
        </div>
        <div className="text-[11px] text-white/60 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// -- Feature row ---------------------------------------------------
function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#6ee7b7] shrink-0">
        {icon}
      </div>
      <span className="text-[14px] text-white/70">{text}</span>
    </div>
  );
}

// -- Left panel ----------------------------------------------------
function LeftPanel() {
  return (
    <div className="relative flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#0f1923] via-[#0f2d1f] to-[#0d9488]/40 min-h-screen">
      {/* Blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-[#059669] rounded-full opacity-20 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 bg-[#0d9488] rounded-full opacity-20 blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#059669] rounded-full opacity-5 blur-[100px] pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 90% 90% at 50% 50%, black, transparent)",
        }}
      />

      <style>{`
        @keyframes floatPill {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .anim-in { animation: fadeSlideIn 0.5s ease forwards; }
        .anim-in-right { animation: fadeSlideInRight 0.5s ease forwards; }
      `}</style>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#059669] to-[#0d9488] flex items-center justify-center shadow-lg">
          <svg {...iconProps} className="w-5 h-5 text-white">
            <path d="M9 12h6m-3-3v6M3 12c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9-9 4.03-9 9z" />
          </svg>
        </div>
        <div>
          <div
            style={{ fontFamily: "'Fraunces', serif" }}
            className="text-[20px] font-semibold text-white"
          >
            MediCare
          </div>
          <div className="text-[11px] text-white/40 tracking-[0.5px]">
            Clinic Management
          </div>
        </div>
      </div>

      {/* Main copy */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
        <div className="inline-flex items-center gap-2 bg-[#d1fae5]/10 border border-[#059669]/30 rounded-full px-3.5 py-1.5 mb-8 w-fit">
          <span className="w-2 h-2 bg-[#059669] rounded-full animate-pulse" />
          <span className="text-[13px] font-medium text-[#6ee7b7]">
            Trusted by 500+ clinics
          </span>
        </div>

        <h2
          style={{ fontFamily: "'Fraunces', serif" }}
          className="text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] text-white mb-6"
        >
          The smartest way
          <br />
          to run your
          <br />
          <em className="text-[#6ee7b7]">clinic.</em>
        </h2>

        <p className="text-[16px] text-white/60 leading-[1.7] max-w-[360px] mb-10">
          From patient records to billing — everything your practice needs,
          beautifully organised in one place.
        </p>

        <div className="flex flex-col gap-3.5">
          <FeatureRow
            text="Complete patient records & prescriptions"
            icon={
              <svg {...iconProps} className="w-4 h-4">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            }
          />
          <FeatureRow
            text="Smart scheduling with auto-reminders"
            icon={
              <svg {...iconProps} className="w-4 h-4">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
          />
          <FeatureRow
            text="Billing, invoices & financial analytics"
            icon={
              <svg {...iconProps} className="w-4 h-4">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
          <FeatureRow
            text="HIPAA compliant & 99.9% uptime SLA"
            icon={
              <svg {...iconProps} className="w-4 h-4">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
          />
        </div>

        {/* Floating pills — relative to this column */}
        <div className="relative mt-14 h-28">
          <FloatPill
            style={{ bottom: 0, left: 0 }}
            animDuration="5s"
            iconBg="rgba(209,250,229,0.15)"
            iconColor="#6ee7b7"
            icon={
              <svg {...iconProps} className="w-3.5 h-3.5">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            }
            value="99.9%"
            label="Uptime"
          />
          <FloatPill
            style={{ bottom: 0, right: 0 }}
            animDuration="7s"
            delay="1s"
            iconBg="rgba(219,234,254,0.15)"
            iconColor="#93c5fd"
            icon={
              <svg {...iconProps} className="w-3.5 h-3.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            }
            value="50K+"
            label="Patients"
          />
        </div>
      </div>

      {/* Bottom testimonial */}
      <div className="relative z-10 border-t border-white/10 pt-8">
        <p className="text-[14px] text-white/50 italic leading-[1.6] mb-4">
          "MediCare cut our admin time by 60%. Our staff love it, and so do our
          patients."
        </p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#059669] to-[#0d9488] flex items-center justify-center text-white text-[13px] font-bold">
            DR
          </div>
          <div>
            <div className="text-[13px] font-semibold text-white">
              Dr. Rohan Mehta
            </div>
            <div className="text-[11px] text-white/40">
              Apollo Clinics, Mumbai
            </div>
          </div>
          <div className="ml-auto flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 text-[#f59e0b]"
                fill="currentColor"
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// -- Right panel — form --------------------------------------------
function SignupForm() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // handle submission
  };

  return (
    <div className="flex flex-col justify-center px-12 bg-[#f8fafb] min-h-screen overflow-y-auto py-10">
      <div className="max-w-[440px] w-full mx-auto">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-[#d8e3ea] bg-white px-4 py-2 text-[14px] font-medium text-[#0f1923] transition hover:border-[#059669] hover:text-[#059669]"
          >
            Home
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center rounded-full border border-[#059669]/20 bg-[#059669]/5 px-4 py-2 text-[14px] font-medium text-[#059669] transition hover:bg-[#059669] hover:text-white"
          >
            Login
          </Link>
        </div>

        {/* Header */}
        <div className="mb-9">
          <h1
            style={{ fontFamily: "'Fraunces', serif" }}
            className="text-[32px] font-bold text-[#0f1923] mb-2 leading-tight"
          >
            Create your account
          </h1>
          <p className="text-[15px] text-[#6b7a8d]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#059669] font-medium hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Google button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white border-[1.5px] border-[#e4eaf0] rounded-xl text-[15px] font-medium text-[#0f1923] cursor-pointer transition-all hover:border-[#0f1923] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-px mb-6"
        >
          {/* Google SVG logo */}
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-[#e4eaf0]" />
          <span className="text-[13px] text-[#6b7a8d] font-medium">
            or sign up with email
          </span>
          <div className="flex-1 h-px bg-[#e4eaf0]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-[13px] font-medium text-[#3a4a5c] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7a8d]">
                <svg {...iconProps} className="w-4 h-4">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-3 bg-white border-[1.5px] border-[#e4eaf0] rounded-xl text-[15px] text-[#0f1923] placeholder:text-[#b0bcc9] outline-none transition-all focus:border-[#059669] focus:shadow-[0_0_0_3px_rgba(5,150,105,0.1)]"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[13px] font-medium text-[#3a4a5c] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7a8d]">
                <svg {...iconProps} className="w-4 h-4">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                className="w-full pl-10 pr-4 py-3 bg-white border-[1.5px] border-[#e4eaf0] rounded-xl text-[15px] text-[#0f1923] placeholder:text-[#b0bcc9] outline-none transition-all focus:border-[#059669] focus:shadow-[0_0_0_3px_rgba(5,150,105,0.1)]"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[13px] font-medium text-[#3a4a5c] mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7a8d]">
                <svg {...iconProps} className="w-4 h-4">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                className="w-full pl-10 pr-11 py-3 bg-white border-[1.5px] border-[#e4eaf0] rounded-xl text-[15px] text-[#0f1923] placeholder:text-[#b0bcc9] outline-none transition-all focus:border-[#059669] focus:shadow-[0_0_0_3px_rgba(5,150,105,0.1)]"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b7a8d] hover:text-[#3a4a5c] transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                {showPass ? (
                  <svg {...iconProps} className="w-4 h-4">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg {...iconProps} className="w-4 h-4">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password strength */}
            {formData.password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[...Array(4)].map((_, i) => {
                    const strength = Math.min(
                      4,
                      Math.floor(formData.password.length / 2),
                    );
                    return (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background:
                            i < strength
                              ? strength <= 1
                                ? "#ef4444"
                                : strength <= 2
                                  ? "#f59e0b"
                                  : strength <= 3
                                    ? "#3b82f6"
                                    : "#059669"
                              : "#e4eaf0",
                        }}
                      />
                    );
                  })}
                </div>
                <span className="text-[11px] text-[#6b7a8d]">
                  {formData.password.length < 4
                    ? "Weak"
                    : formData.password.length < 6
                      ? "Fair"
                      : formData.password.length < 8
                        ? "Good"
                        : "Strong"}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[13px] font-medium text-[#3a4a5c] mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7a8d]">
                <svg {...iconProps} className="w-4 h-4">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm"
                value={formData.confirm}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={`w-full pl-10 pr-11 py-3 bg-white border-[1.5px] rounded-xl text-[15px] text-[#0f1923] placeholder:text-[#b0bcc9] outline-none transition-all focus:shadow-[0_0_0_3px_rgba(5,150,105,0.1)] ${
                  formData.confirm.length > 0 &&
                  formData.confirm !== formData.password
                    ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                    : "border-[#e4eaf0] focus:border-[#059669]"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b7a8d] hover:text-[#3a4a5c] transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                {showConfirm ? (
                  <svg {...iconProps} className="w-4 h-4">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg {...iconProps} className="w-4 h-4">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {formData.confirm.length > 0 &&
              formData.confirm !== formData.password && (
                <p className="text-[12px] text-red-500 mt-1.5">
                  Passwords do not match
                </p>
              )}
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer group mt-1">
            <input
              type="checkbox"
              required
              className="mt-0.5 w-4 h-4 accent-[#059669] cursor-pointer"
            />
            <span className="text-[13px] text-[#6b7a8d] leading-[1.5]">
              I agree to the{" "}
              <a
                href="#"
                className="text-[#059669] hover:underline font-medium"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-[#059669] hover:underline font-medium"
              >
                Privacy Policy
              </a>
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-none text-white text-[15px] font-semibold cursor-pointer transition-all mt-1 bg-gradient-to-r from-[#059669] to-[#0d9488] shadow-[0_4px_20px_rgba(5,150,105,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(5,150,105,0.4)]"
          >
            Create Account
            <svg {...iconProps} className="w-4 h-4" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

// -- Page ----------------------------------------------------------
export default function SignupPage() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <div className="font-['DM_Sans',sans-serif] grid grid-cols-[1fr_1fr] min-h-screen">
        <LeftPanel />
        <SignupForm />
      </div>
    </>
  );
}
