import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── SVG Icon helpers ──────────────────────────────────────────────
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const CheckIcon = () => (
  <svg {...iconProps} className="w-[10px] h-[10px]">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const CrossIcon = () => (
  <svg {...iconProps} className="w-[10px] h-[10px] text-red-500">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ArrowIcon = () => (
  <svg {...iconProps} className="w-4 h-4" strokeWidth={2.5}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const PlayIcon = () => (
  <svg {...iconProps} className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10,8 16,12 10,16 10,8" fill="currentColor" stroke="none" />
  </svg>
);

// ── Pricing data ──────────────────────────────────────────────────
const prices = {
  monthly: { starter: "0", pro: "2,999", enterprise: "7,999" },
  annual: { starter: "0", pro: "2,399", enterprise: "6,399" },
};

// ── Auth hooks ────────────────────────────────────────────────────
function useCurrentUser() {
  return {
    isLoggedIn: true,
    name: "Admin",
    email: "admin@citycare.com",
    plan: "free" as "free" | "professional" | "enterprise",
    usage: {
      patients: { used: 0, limit: 50 },
      doctors: { used: 0, limit: 1 },
    },
  };
}

function useAuth() {
  return {
    isLoggedIn: true,
    user: {
      name: "Dr. Rahul Sharma",
      email: "rahul@cityclinic.com",
      initials: "RS",
    },
    plan: "free" as "free" | "professional" | "enterprise",
  };
}

// ── Plan configuration ─────────────────────────────────────────────
const PLAN_CONFIG = {
  free: {
    label: "Free plan",
    badgeClass: "bg-[#f3f4f6] text-[#6b7a8d] border border-[#e4eaf0]",
    dot: "bg-[#9ca3af]",
    showUpgrade: true,
  },
  professional: {
    label: "Professional",
    badgeClass: "bg-[#d1fae5] text-[#065f46]",
    dot: "bg-[#059669]",
    showUpgrade: false,
  },
  enterprise: {
    label: "Enterprise",
    badgeClass: "bg-[#dbeafe] text-[#1e3a8a]",
    dot: "bg-[#2563eb]",
    showUpgrade: false,
  },
};

// ── Components ─────────────────────────────────────────────────────

function UsageBar({ used, limit }: { used: number; limit: number | null }) {
  if (!limit)
    return (
      <span className="text-xs font-medium text-[#0f1923]">
        {used.toLocaleString()}{" "}
        <span className="text-[#9ca3af] font-normal">(unlimited)</span>
      </span>
    );
  const pct = Math.min(Math.round((used / limit) * 100), 100);
  const fillColor =
    pct >= 100 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-[#059669]";
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-[#6b7a8d]">
          {used} / {limit}
        </span>
        <span className="text-xs text-[#6b7a8d]">{pct}%</span>
      </div>
      <div className="w-full h-1 bg-[#e4eaf0] rounded-full">
        <div
          className={`h-full rounded-full ${fillColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = useCurrentUser();
  const plan = PLAN_CONFIG[user.plan];

  if (!user.isLoggedIn) return null;

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="relative flex items-center gap-3">
      {/* Plan badge */}
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium ${plan.badgeClass}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${plan.dot}`} />
        {plan.label}
      </span>

      {/* Upgrade button */}
      {plan.showUpgrade && (
        <button
          onClick={() => {
            document
              .getElementById("pricing")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          className="px-3 py-1.5 rounded-lg bg-[#059669] text-white text-[12px] font-medium border-none cursor-pointer hover:bg-[#047857] transition-colors"
        >
          Upgrade
        </button>
      )}

      {/* Avatar button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-[34px] h-[34px] rounded-full bg-[#d1fae5] text-[#065f46] text-[12px] font-medium border border-[#e4eaf0] flex items-center justify-center cursor-pointer hover:border-[#059669] transition-colors"
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[calc(100%+10px)] right-0 w-[280px] bg-white border border-[#e4eaf0] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] z-50 overflow-hidden">
          {/* User info */}
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[#e4eaf0]">
            <div className="w-9 h-9 rounded-full bg-[#d1fae5] text-[#065f46] text-[13px] font-medium flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div>
              <div className="text-[14px] font-semibold text-[#0f1923]">
                {user.name}
              </div>
              <div className="text-[12px] text-[#6b7a8d]">{user.email}</div>
            </div>
          </div>

          {/* Subscription */}
          <div className="px-4 py-3 border-b border-[#e4eaf0]">
            <div className="text-[11px] uppercase tracking-[0.6px] text-[#9ca3af] mb-2">
              Active subscription
            </div>
            <div className="bg-[#f8fafb] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[13px] font-medium text-[#0f1923] flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${plan.dot}`} />
                  {plan.label}
                </span>
                {plan.showUpgrade && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      document
                        .getElementById("pricing")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-[12px] text-[#059669] font-medium bg-none border-none cursor-pointer p-0"
                  >
                    Upgrade →
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2.5">
                <div>
                  <div className="text-[12px] text-[#6b7a8d] mb-1">
                    Patients
                  </div>
                  <UsageBar
                    used={user.usage.patients.used}
                    limit={user.usage.patients.limit}
                  />
                </div>
                <div>
                  <div className="text-[12px] text-[#6b7a8d] mb-1">Doctors</div>
                  <UsageBar
                    used={user.usage.doctors.used}
                    limit={user.usage.doctors.limit}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            {[
              { label: "Profile settings", path: "/profile" },
              { label: "Change password", path: "/change-password" },
              { label: "Setup clinic", path: "/setup-clinic" },
            ].map(({ label, path }) => (
              <button
                key={path}
                onClick={() => {
                  setOpen(false);
                  navigate(path);
                }}
                className="w-full text-left px-4 py-2 text-[13px] text-[#0f1923] hover:bg-[#f8fafb] border-none bg-transparent cursor-pointer transition-colors"
              >
                {label}
              </button>
            ))}
            <div className="h-px bg-[#e4eaf0] my-1" />
            <button
              onClick={() => {
                setOpen(false);
                navigate("/login");
              }}
              className="w-full text-left px-4 py-2 text-[13px] text-blue-600 hover:bg-red-50 border-none bg-transparent cursor-pointer transition-colors"
            >
              Login In System
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  const navigate = useNavigate();
  const user = useCurrentUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-15 py-[18px] bg-white/90 backdrop-blur-xl border-b border-[#e4eaf0]">
      <div className="flex items-center gap-2.5">
        <div className="ml-10 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#059669] to-[#0d9488]">
          <svg {...iconProps} className="w-[22px] h-[22px] text-white">
            <path d="M9 12h6m-3-3v6M3 12c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9-9 4.03-9 9z" />
          </svg>
        </div>
        <div>
          <div
            style={{ fontFamily: "'Fraunces', serif" }}
            className="text-[20px] font-semibold text-[#0f1923]"
          >
            MediCare
          </div>
          <div className="text-[11px] text-[#6b7a8d] tracking-[0.5px]">
            Clinic Management
          </div>
        </div>
      </div>
      <div className="flex items-center gap-8 mr-10">
        <button
          type="button"
          onClick={() => handleScroll("features")}
          className="bg-none border-none p-0 m-0 cursor-pointer text-sm font-medium text-[#3a4a5c] hover:text-[#059669] transition-colors"
        >
          Features
        </button>
        <button
          type="button"
          onClick={() => handleScroll("pricing")}
          className="bg-none border-none p-0 m-0 cursor-pointer text-sm font-medium text-[#3a4a5c] hover:text-[#059669] transition-colors"
        >
          Pricing
        </button>
        <button
          type="button"
          onClick={() => handleScroll("stats")}
          className="bg-none border-none p-0 m-0 cursor-pointer text-sm font-medium text-[#3a4a5c] hover:text-[#059669] transition-colors"
        >
          About
        </button>
        {user.isLoggedIn ? (
          <ProfileMenu />
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-[#059669] text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-[#047857] transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

function HeroFeature({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 bg-white border border-[#e4eaf0] rounded-xl text-sm font-medium text-[#3a4a5c] transition-all hover:border-[#059669] hover:text-[#059669] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(5,150,105,0.08)] cursor-default">
      <div className="w-8 h-8 bg-[#d1fae5] rounded-lg flex items-center justify-center shrink-0 text-[#059669]">
        {icon}
      </div>
      {label}
    </div>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="min-h-screen pt-[140px] pb-20 px-15 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 70% 40%, #d1fae5 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 20% 80%, #e0f2fe 0%, transparent 50%), #f8fafb",
        }}
      />
      <div
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(#e4eaf0 1px, transparent 1px), linear-gradient(90deg, #e4eaf0 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto grid grid-cols-2 gap-[60px] items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-[#d1fae5] rounded-full px-3.5 py-1.5 mb-7 text-[13px] font-medium text-[#059669]">
            <span className="w-2 h-2 bg-[#059669] rounded-full animate-pulse" />
            Trusted by 500+ clinics worldwide
          </div>

          <h1
            style={{ fontFamily: "'Fraunces', serif" }}
            className="text-[clamp(42px,5vw,62px)] font-bold leading-[1.1] text-[#0f1923] mb-6"
          >
            Streamline Your
            <br />
            <em className="text-[#059669]">Healthcare</em>
            <br />
            Practice
          </h1>

          <p className="text-[17px] text-[#3a4a5c] leading-[1.7] mb-9 max-w-[480px]">
            Manage appointments, patients, prescriptions, and billing all in one
            elegant platform built for modern clinics.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-9">
            <HeroFeature
              label="Patient Records"
              icon={
                <svg {...iconProps} className="w-4 h-4">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />
            <HeroFeature
              label="Smart Scheduling"
              icon={
                <svg {...iconProps} className="w-4 h-4">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              }
            />
            <HeroFeature
              label="Billing & Invoices"
              icon={
                <svg {...iconProps} className="w-4 h-4">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
            />
            <HeroFeature
              label="HIPAA Compliant"
              icon={
                <svg {...iconProps} className="w-4 h-4">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              }
            />
          </div>

          <div className="flex gap-3.5 items-center">
            <button
              onClick={() => navigate("/signup")}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl border-none text-white text-[15px] font-semibold cursor-pointer transition-all bg-gradient-to-br from-[#059669] to-[#0d9488] shadow-[0_4px_20px_rgba(5,150,105,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(5,150,105,0.4)]"
            >
              Get Started Free <ArrowIcon />
            </button>
            <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl border-[1.5px] border-[#e4eaf0] bg-white text-[#0f1923] text-[15px] font-medium cursor-pointer transition-all hover:border-[#0f1923] hover:-translate-y-px">
              <PlayIcon /> Watch Demo
            </button>
          </div>
        </div>

        {/* Right — dashboard card */}
        <div className="relative">
          <div
            className="bg-white border border-[#e4eaf0] rounded-3xl p-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
            style={{ animation: "float 6s ease-in-out infinite" }}
          >
            <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}} @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>

            <div className="flex items-center justify-between mb-6">
              <div
                style={{ fontFamily: "'Fraunces', serif" }}
                className="text-base font-semibold"
              >
                Today's Overview
              </div>
              <div className="text-xs text-[#6b7a8d]">April 2, 2026</div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { val: "24", lbl: "Appointments", color: "text-[#059669]" },
                { val: "1,247", lbl: "Patients", color: "text-[#0f1923]" },
                { val: "₹48K", lbl: "Revenue", color: "text-[#0ea5e9]" },
              ].map(({ val, lbl, color }) => (
                <div
                  key={lbl}
                  className="bg-[#f8fafb] rounded-xl p-3.5 text-center"
                >
                  <div
                    style={{ fontFamily: "'Fraunces', serif" }}
                    className={`text-2xl font-bold ${color}`}
                  >
                    {val}
                  </div>
                  <div className="text-[11px] text-[#6b7a8d] mt-0.5">{lbl}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                {
                  initials: "SA",
                  name: "Sneha Agarwal",
                  time: "9:00 AM · General Checkup",
                  badge: "Done",
                  badgeClass: "bg-[#d1fae5] text-[#059669]",
                  avatarStyle: {},
                },
                {
                  initials: "RK",
                  name: "Rahul Kumar",
                  time: "10:30 AM · Cardiology",
                  badge: "Now",
                  badgeClass: "bg-blue-100 text-blue-600",
                  avatarStyle: {
                    background: "linear-gradient(135deg,#2563eb,#0ea5e9)",
                  },
                },
                {
                  initials: "PM",
                  name: "Priya Mehta",
                  time: "11:15 AM · Dermatology",
                  badge: "Soon",
                  badgeClass: "bg-amber-100 text-amber-600",
                  avatarStyle: {
                    background: "linear-gradient(135deg,#d97706,#f59e0b)",
                  },
                },
              ].map(
                ({ initials, name, time, badge, badgeClass, avatarStyle }) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 p-3 bg-[#f8fafb] rounded-xl"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0 bg-gradient-to-br from-[#059669] to-[#0d9488]"
                      style={avatarStyle}
                    >
                      {initials}
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold text-[#0f1923]">
                        {name}
                      </div>
                      <div className="text-[11px] text-[#6b7a8d]">{time}</div>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${badgeClass}`}
                    >
                      {badge}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Floating pills */}
          <div
            className="absolute -top-5 -right-5 bg-white border border-[#e4eaf0] rounded-2xl px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center gap-2 whitespace-nowrap"
            style={{ animation: "float2 5s ease-in-out infinite" }}
          >
            <div className="w-7 h-7 rounded-lg bg-[#d1fae5] flex items-center justify-center text-[#059669]">
              <CheckIcon />
            </div>
            <div>
              <div
                style={{ fontFamily: "'Fraunces', serif" }}
                className="text-[15px] font-bold text-[#0f1923]"
              >
                99.9%
              </div>
              <div className="text-[11px] text-[#6b7a8d]">Uptime</div>
            </div>
          </div>
          <div
            className="absolute -bottom-4 -left-5 bg-white border border-[#e4eaf0] rounded-2xl px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center gap-2 whitespace-nowrap"
            style={{ animation: "float2 7s ease-in-out infinite 1s" }}
          >
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <svg {...iconProps} className="w-3.5 h-3.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <div
                style={{ fontFamily: "'Fraunces', serif" }}
                className="text-[15px] font-bold text-[#0f1923]"
              >
                50K+
              </div>
              <div className="text-[11px] text-[#6b7a8d]">Patients</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const cards = [
    {
      icon: (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </>
      ),
      title: "Patient Management",
      desc: "Complete electronic health records, medical history, and patient profiles in one secure place.",
    },
    {
      icon: (
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </>
      ),
      title: "Appointment System",
      desc: "Intelligent scheduling with automated reminders, conflict detection, and multi-doctor support.",
    },
    {
      icon: (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </>
      ),
      title: "Billing & Reports",
      desc: "Automated invoice generation, payment tracking, and detailed financial analytics.",
    },
    {
      icon: (
        <>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </>
      ),
      title: "Multi-Clinic Support",
      desc: "Manage multiple locations, departments, and staff from a single unified dashboard.",
    },
  ];

  return (
    <section id="features" className="py-[100px] px-15 bg-white">
      <div className="max-w-[1200px] mx-auto mb-[60px] text-center">
        <div className="text-xs font-semibold tracking-[1.5px] uppercase text-[#059669] mb-3">
          Everything You Need
        </div>
        <div
          style={{ fontFamily: "'Fraunces', serif" }}
          className="text-[clamp(32px,4vw,48px)] font-bold text-[#0f1923] mb-4"
        >
          Built for modern healthcare
        </div>
        <div className="text-[17px] text-[#3a4a5c] max-w-[560px] mx-auto leading-[1.6]">
          A comprehensive suite of tools designed to streamline every aspect of
          your clinic's operations.
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5 max-w-[1200px] mx-auto">
        {cards.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="group relative bg-white border border-[#e4eaf0] rounded-[20px] p-7 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:border-[#6ee7b7]"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-br from-[#d1fae5] to-[#e0f2fe]" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-[14px] bg-[#d1fae5] flex items-center justify-center mb-5 text-[#059669]">
                <svg {...iconProps} className="w-[22px] h-[22px]">
                  {icon}
                </svg>
              </div>
              <h3
                style={{ fontFamily: "'Fraunces', serif" }}
                className="text-[18px] font-semibold text-[#0f1923] mb-2"
              >
                {title}
              </h3>
              <p className="text-[14px] text-[#6b7a8d] leading-[1.6]">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section id="stats" className="py-[100px] px-15 bg-[#0f1923]">
      <div className="max-w-[1200px] mx-auto">
        <div
          style={{ fontFamily: "'Fraunces', serif" }}
          className="text-[clamp(28px,3vw,40px)] font-semibold text-white text-center mb-[60px]"
        >
          Trusted by clinics <em className="text-[#6ee7b7]">across India</em>{" "}
          and beyond
        </div>
        <div className="grid grid-cols-3 gap-0.5 bg-white/[0.06] rounded-3xl overflow-hidden">
          {[
            { num: "500", suffix: "+", desc: "Active Clinics" },
            { num: "50", suffix: "K+", desc: "Patients Managed" },
            { num: "99.9", suffix: "%", desc: "Guaranteed Uptime" },
          ].map(({ num, suffix, desc }) => (
            <div key={desc} className="px-10 py-12 text-center bg-white/[0.02]">
              <div
                style={{ fontFamily: "'Fraunces', serif" }}
                className="text-[56px] font-bold text-white leading-none mb-2"
              >
                {num}
                <span className="text-[#6ee7b7]">{suffix}</span>
              </div>
              <div className="text-[15px] text-white/50">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const p = prices[billing];

  const plans = [
    {
      name: "Starter",
      price: p.starter,
      desc: "Perfect for solo practitioners just getting started.",
      features: [
        { text: "Up to 50 patients", included: true },
        { text: "Basic appointment scheduling", included: true },
        { text: "Digital prescriptions", included: true },
        { text: "Email support", included: true },
        { text: "Billing & invoicing", included: false },
        { text: "Multi-doctor support", included: false },
        { text: "Analytics dashboard", included: false },
      ],
      popular: false,
      cta: "Get Started Free",
    },
    {
      name: "Professional",
      price: p.pro,
      desc: "For growing clinics that need the full toolkit.",
      features: [
        { text: "Unlimited patients", included: true },
        { text: "Advanced scheduling + reminders", included: true },
        { text: "Full EMR system", included: true },
        { text: "Billing & invoicing", included: true },
        { text: "Up to 5 doctors", included: true },
        { text: "Analytics dashboard", included: true },
        { text: "Priority support", included: true },
      ],
      popular: true,
      cta: "Start 14-Day Trial",
    },
    {
      name: "Enterprise",
      price: p.enterprise,
      desc: "For hospital groups and multi-location clinic chains.",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Unlimited doctors & staff", included: true },
        { text: "Multi-clinic management", included: true },
        { text: "Custom integrations", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "SLA-backed 99.9% uptime", included: true },
        { text: "HIPAA compliance suite", included: true },
      ],
      popular: false,
      cta: "Contact Sales",
    },
  ];

  return (
    <section id="pricing" className="py-[100px] px-15 bg-[#f8fafb]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-[60px]">
          <div className="text-xs font-semibold tracking-[1.5px] uppercase text-[#059669] mb-3">
            Pricing
          </div>
          <div
            style={{ fontFamily: "'Fraunces', serif" }}
            className="text-[clamp(32px,4vw,48px)] font-bold text-[#0f1923] mb-4"
          >
            Simple, transparent pricing
          </div>
          <div className="text-[17px] text-[#3a4a5c] max-w-[560px] mx-auto leading-[1.6]">
            No hidden fees. Start free, scale as you grow.
          </div>
          <div className="mt-6 inline-flex items-center gap-3 bg-white border border-[#e4eaf0] rounded-full p-1.5">
            {(["monthly", "annual"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setBilling(mode)}
                className={`px-5 py-2 rounded-full text-sm font-medium cursor-pointer transition-all border-none ${billing === mode ? "bg-[#0f1923] text-white" : "text-[#6b7a8d] bg-transparent"}`}
              >
                {mode === "monthly" ? (
                  "Monthly"
                ) : (
                  <>
                    Annual{" "}
                    <span className="bg-[#d1fae5] text-[#059669] text-[11px] font-bold px-2 py-0.5 rounded-full">
                      Save 20%
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {plans.map(({ name, price, desc, features, popular, cta }) => (
            <div
              key={name}
              className={`relative rounded-3xl p-9 transition-all duration-300 ${
                popular
                  ? "border border-[#059669] bg-[#0f1923] shadow-[0_20px_60px_rgba(5,150,105,0.25)] scale-[1.03] hover:scale-[1.03] hover:-translate-y-1"
                  : "border-[1.5px] border-[#e4eaf0] bg-white hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
              }`}
            >
              {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#059669] to-[#0d9488] text-white text-[11px] font-bold tracking-[1px] uppercase px-4 py-1 rounded-full whitespace-nowrap">
                  ⚡ Most Popular
                </div>
              )}
              <div
                className={`text-sm font-normal mb-2 ${popular ? "text-[#6ee7b7]" : "text-[#6b7a8d]"}`}
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {name}
              </div>
              <div
                style={{ fontFamily: "'Fraunces', serif" }}
                className={`text-[52px] font-bold leading-none mb-1 ${popular ? "text-white" : "text-[#0f1923]"}`}
              >
                <sup className="text-[22px] font-normal align-super leading-none">
                  ₹
                </sup>
                {price}
                <sub
                  className={`text-[15px] font-normal ${popular ? "text-white/50" : "text-[#6b7a8d]"}`}
                >
                  /mo
                </sub>
              </div>
              <div
                className={`text-sm mb-7 pb-7 border-b ${popular ? "text-white/50 border-white/10" : "text-[#6b7a8d] border-[#e4eaf0]"}`}
              >
                {desc}
              </div>
              <ul className="flex flex-col gap-3 mb-8 list-none p-0">
                {features.map(({ text, included }) => (
                  <li
                    key={text}
                    className={`flex items-center gap-2.5 text-sm ${included ? (popular ? "text-white/80" : "text-[#3a4a5c]") : "text-[#6b7a8d]"}`}
                  >
                    {included ? (
                      <span
                        className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 ${popular ? "bg-[#6ee7b7]/20 text-[#6ee7b7]" : "bg-[#d1fae5] text-[#059669]"}`}
                      >
                        <CheckIcon />
                      </span>
                    ) : (
                      <span className="w-[18px] h-[18px] rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <CrossIcon />
                      </span>
                    )}
                    {text}
                  </li>
                ))}
              </ul>
              {popular ? (
                <button
                  onClick={() => navigate("/signup")}
                  className="w-full py-3.5 rounded-xl border-none text-white text-[15px] font-semibold cursor-pointer bg-gradient-to-r from-[#059669] to-[#0d9488] shadow-[0_4px_16px_rgba(5,150,105,0.3)] transition-all hover:shadow-[0_8px_24px_rgba(5,150,105,0.5)] hover:-translate-y-px"
                >
                  {cta}
                </button>
              ) : (
                <button
                  onClick={() => navigate("/signup")}
                  className="w-full py-3.5 rounded-xl border-[1.5px] border-[#e4eaf0] bg-white text-[#0f1923] text-[15px] font-semibold cursor-pointer transition-all hover:border-[#0f1923]"
                >
                  {cta}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-10 text-[#6b7a8d] text-sm">
          <svg {...iconProps} className="w-[18px] h-[18px] text-[#059669]">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          30-day money-back guarantee · No credit card required for free plan ·
          Cancel anytime
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-[100px] px-15 bg-white">
      <div className="max-w-[1200px] mx-auto relative rounded-[32px] p-20 text-center overflow-hidden bg-gradient-to-br from-[#0f1923] to-[#1a3a2e]">
        <div className="absolute -top-15 -left-15 w-60 h-60 bg-[#059669] rounded-full opacity-15 blur-[60px]" />
        <div className="absolute -bottom-15 -right-15 w-60 h-60 bg-[#0d9488] rounded-full opacity-15 blur-[60px]" />
        <div className="relative z-10">
          <div
            style={{ fontFamily: "'Fraunces', serif" }}
            className="text-[clamp(32px,4vw,52px)] font-bold text-white mb-4"
          >
            Ready to transform your <em className="text-[#6ee7b7]">clinic?</em>
          </div>
          <div className="text-[17px] text-white/60 mb-9">
            Join 500+ clinics already running on MediCare. Get started in
            minutes.
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0f1923] text-white/40 text-center py-8 px-15 text-sm">
      © 2026 <span className="text-[#6ee7b7]">MediCare</span>. Built with care
      for healthcare professionals.
    </footer>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function MediCarePage() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <div className="font-['DM_Sans',sans-serif] bg-white text-[#0f1923] overflow-x-hidden">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <PricingSection />
        <CtaSection />
        <Footer />
      </div>
    </>
  );
}
