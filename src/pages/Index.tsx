import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  Building2,
  CalendarClock,
  CheckCircle2,
  FileText,
  FlaskConical,
  HeartPulse,
  Mail,
  MapPin,
  Menu,
  MessageCircleMore,
  Phone,
  Pill,
  ReceiptText,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCog,
  Users,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Home", target: "home" },
  { label: "Features", target: "features" },
  { label: "Solutions", target: "solutions" },
  { label: "Pricing", target: "pricing" },
  { label: "Integrations", target: "integrations" },
  { label: "Contact", target: "contact" },
] as const;

const trustStats = [
  { value: "24/7", label: "Operational visibility" },
  { value: "99.9%", label: "Platform uptime target" },
  { value: "12+", label: "Core clinic workflows" },
] as const;

const dashboardMetrics = [
  { label: "Appointments Today", value: "186", delta: "+12%" },
  { label: "Bills Pending", value: "24", delta: "-8%" },
  { label: "WhatsApp Delivered", value: "97%", delta: "+4%" },
  { label: "Lab Queue", value: "42", delta: "Live" },
] as const;

const heroHighlights = [
  {
    title: "Role-based control",
    description:
      "Give admins, doctors, receptionists, pharmacists, and lab staff the right access without confusion.",
    icon: ShieldCheck,
  },
  {
    title: "Live notifications",
    description:
      "Send appointment alerts, queue updates, billing reminders, and system notices from one place.",
    icon: BellRing,
  },
  {
    title: "WhatsApp ready",
    description:
      "Keep patients informed with reminder flows and faster communication through WhatsApp integration.",
    icon: MessageCircleMore,
  },
] as const;

const featureCards = [
  {
    title: "Smart Appointment Desk",
    description:
      "Manage booking, rescheduling, queue flow, and check-in from a clean front-desk workspace.",
    icon: CalendarClock,
  },
  {
    title: "Billing & Receipts",
    description:
      "Track invoices, collections, dues, and patient payments with better financial visibility.",
    icon: WalletCards,
  },
  {
    title: "Pharmacy & Dispensing",
    description:
      "Handle prescriptions, medicine movement, and pharmacy operations without juggling tools.",
    icon: Pill,
  },
  {
    title: "Lab Workflow Tracking",
    description:
      "Monitor samples, reports, status updates, and doctor-lab coordination in real time.",
    icon: FlaskConical,
  },
  {
    title: "Notification Management",
    description:
      "Control reminders, follow-ups, announcements, and staff alerts from a unified message center.",
    icon: BellRing,
  },
  {
    title: "Role & Permission Rules",
    description:
      "Set secure role permissions for clinic admins, doctors, accountants, reception, pharmacy, and lab teams.",
    icon: UserCog,
  },
  {
    title: "Reports & Performance",
    description:
      "Review appointments, revenue, patient growth, and operational trends with visual dashboards.",
    icon: BarChart3,
  },
  {
    title: "Patient Communication",
    description:
      "Keep patient journeys smoother with WhatsApp-ready reminders, confirmations, and follow-up messages.",
    icon: MessageCircleMore,
  },
] as const;

const solutionCards = [
  {
    title: "Front Desk Excellence",
    description:
      "Reduce waiting time with token flow, check-in, schedule changes, and reception visibility.",
    points: ["Queue management", "Check-in status", "Doctor availability"],
    icon: UsersRound,
  },
  {
    title: "Clinical Visibility",
    description:
      "Doctors can review visits, records, tests, and notes inside a clear treatment workflow.",
    points: ["Consultation notes", "Patient history", "Lab coordination"],
    icon: Stethoscope,
  },
  {
    title: "Admin Control Center",
    description:
      "Owners and managers get a complete overview of users, permissions, billing, and clinic performance.",
    points: ["User roles", "Revenue view", "Operational insights"],
    icon: Building2,
  },
] as const;

const pricingPlans = [
  {
    name: "Starter",
    price: "Rs 999",
    period: "/month",
    summary: "For single clinics launching a reliable digital workflow.",
    featured: false,
    features: [
      "Appointments and patient records",
      "Basic billing and receipts",
      "Core user setup",
      "Dashboard reporting",
    ],
  },
  {
    name: "Professional",
    price: "Rs 2,499",
    period: "/month",
    summary: "For clinics that want operations, communication, and visibility in one system.",
    featured: true,
    features: [
      "Everything in Starter",
      "WhatsApp-ready communication",
      "Role permissions and notifications",
      "Pharmacy, lab, and queue modules",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    summary: "For larger clinics, advanced workflows, and multi-branch rollout support.",
    featured: false,
    features: [
      "Everything in Professional",
      "Custom onboarding",
      "Advanced permissions",
      "Priority support and scale planning",
    ],
  },
] as const;

const integrationCards = [
  {
    title: "WhatsApp Integration",
    description:
      "Share booking confirmations, reminders, and follow-up notices through familiar patient channels.",
    icon: MessageCircleMore,
  },
  {
    title: "Notification Hub",
    description:
      "Centralize system alerts, appointment reminders, billing notices, and internal team updates.",
    icon: BellRing,
  },
  {
    title: "Analytics Snapshot",
    description:
      "Track operational health with charts, key metrics, and live performance summaries.",
    icon: BarChart3,
  },
] as const;

const contactCards = [
  { label: "Email", value: "hello@citycare.health", icon: Mail },
  { label: "Phone", value: "+91 87565 89656", icon: Phone },
  { label: "Location", value: "India", icon: MapPin },
] as const;

type ContactForm = {
  name: string;
  email: string;
  message: string;
};

const initialContact: ContactForm = {
  name: "",
  email: "",
  message: "",
};

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="text-sm font-bold uppercase tracking-[0.3em] text-[#0f766e]">
        {eyebrow}
      </div>
      <h2 className="mt-4 text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-[-0.05em] text-[#0f172a]">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-[#4e6470]">{subtitle}</p>
    </div>
  );
}

function ContactField({
  placeholder,
  value,
  onChange,
  textarea = false,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  const className =
    "w-full rounded-2xl border border-[#d5e5e3] bg-white px-4 text-sm text-[#0f172a] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10";

  if (textarea) {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${className} min-h-[140px] py-3`}
      />
    );
  }

  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`${className} h-12`}
    />
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-[30px] border border-[#dbe9e7] bg-white p-6 shadow-[0_22px_55px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(15,118,110,0.13)]">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#dff6f3] text-[#0f766e]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-xl font-bold text-[#0f172a]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#526874]">{description}</p>
    </article>
  );
}

function SectionDivider() {
  return <div className="section-divider mx-auto max-w-7xl" aria-hidden="true" />;
}

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState(initialContact);

  const year = new Date().getFullYear();

  const scrollToSection = (target: string) => {
    setMenuOpen(false);
    document
      .getElementById(target)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePrimaryAction = () => {
    navigate(isAuthenticated ? "/dashboard" : "/signup");
  };

  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/signup");

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(isAuthenticated ? "/dashboard" : "/login");
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap"
      />

      <style>{`
        @keyframes floatSoft {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.18); }
          50% { box-shadow: 0 0 0 18px rgba(34,197,94,0); }
        }

        .hero-float {
          animation: floatSoft 7s ease-in-out infinite;
        }

        .signal-pulse {
          animation: pulseGlow 3s ease-in-out infinite;
        }
      `}</style>

      <div className="gradient-page min-h-screen overflow-x-hidden text-[#0f172a] [font-family:'Sora',sans-serif]">
        <header className="sticky top-0 z-50 border-b border-[#d7ebe7] bg-white/82 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8 lg:px-10">
            <button
              type="button"
              onClick={() => scrollToSection("home")}
              className="flex items-center gap-3 border-none bg-transparent p-0 text-left"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#0f766e_0%,#14b8a6_100%)] text-white shadow-[0_18px_34px_rgba(15,118,110,0.28)]">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-extrabold tracking-[-0.05em] text-[#0f172a]">
                  City Care
                </div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-[#647b85]">
                  Clinic Management System
                </div>
              </div>
            </button>

            <nav className="hidden items-center gap-8 lg:flex">
              {navItems.map((item) => (
                <button
                  key={item.target}
                  type="button"
                  onClick={() => scrollToSection(item.target)}
                  className="border-none bg-transparent p-0 text-sm font-semibold text-[#29424b] transition hover:text-[#0f766e]"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogin}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#cfe3e0] bg-white px-5 py-3 text-sm font-bold text-[#17313a] transition hover:border-[#0f766e] hover:text-[#0f766e]"
                >
                  Login
                </button>
              )}
              <button
                type="button"
                onClick={isAuthenticated ? handlePrimaryAction : handleRegister}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-none bg-[#0f766e] px-6 py-3 text-sm font-bold text-white shadow-[0_18px_34px_rgba(15,118,110,0.22)] transition hover:-translate-y-0.5"
              >
                {isAuthenticated ? "Open Dashboard" : "Register"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-[#d7e8e5] bg-white text-[#17313a] lg:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {menuOpen && (
            <div className="border-t border-[#d8ebe8] bg-white px-5 py-5 lg:hidden">
              <div className="mx-auto flex max-w-7xl flex-col gap-3">
                {navItems.map((item) => (
                  <button
                    key={item.target}
                    type="button"
                    onClick={() => scrollToSection(item.target)}
                    className="rounded-2xl border border-[#dce9e7] bg-[#f6fbfb] px-4 py-3 text-left text-sm font-semibold text-[#26414a]"
                  >
                    {item.label}
                  </button>
                ))}
                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="rounded-2xl border border-[#dce9e7] bg-white px-4 py-3 text-left text-sm font-bold text-[#17313a]"
                  >
                    Login
                  </button>
                )}
                <button
                  type="button"
                  onClick={isAuthenticated ? handlePrimaryAction : handleRegister}
                  className="rounded-2xl border-none bg-[#0f766e] px-4 py-3 text-left text-sm font-bold text-white"
                >
                  {isAuthenticated ? "Open Dashboard" : "Register"}
                </button>
              </div>
            </div>
          )}
        </header>

        <section
          id="home"
          className="relative overflow-hidden px-5 pb-16 pt-12 md:px-8 lg:px-10 lg:pb-20 lg:pt-16"
        >
          <div className="absolute left-[-7rem] top-[2rem] h-72 w-72 rounded-full bg-[#a7f3d0]/60 blur-3xl" />
          <div className="absolute right-[-8rem] top-[4rem] h-96 w-96 rounded-full bg-[#93c5fd]/25 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-[540px] bg-[linear-gradient(180deg,hsl(var(--primary)/0.12)_0%,rgba(255,255,255,0)_100%)]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch xl:gap-10">
              <div className="pt-2 lg:flex lg:h-full lg:flex-col lg:pt-0 lg:pr-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#bde6df] bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0f766e] shadow-[0_12px_30px_rgba(15,118,110,0.08)]">
                  <Sparkles className="h-4 w-4" />
                  Trusted clinic platform
                </div>

                <h1 className="mt-6 max-w-5xl text-[clamp(2.5rem,4.8vw,4.2rem)] font-extrabold leading-[1.05] tracking-[-0.06em] text-[#0f172a] lg:max-w-[13ch]">
                  Streamline appointments, billing, and patient operations.
                </h1>

                <p className="mt-6 max-w-[42rem] text-lg leading-8 text-[#4d6874] md:text-xl">
                  City Care gives your team one professional system to handle front
                  desk activity, doctors, billing, pharmacy, lab workflows, and
                  communication with patients.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={handlePrimaryAction}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border-none bg-[#0f766e] px-8 py-4 text-base font-bold text-white shadow-[0_22px_44px_rgba(15,118,110,0.24)] transition hover:-translate-y-0.5"
                  >
                    {isAuthenticated ? "Open Dashboard" : "Get Started"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection("features")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#c9e1de] bg-white/90 px-8 py-4 text-base font-bold text-[#17313a] transition hover:border-[#0f766e] hover:text-[#0f766e]"
                  >
                    Explore Features
                    <BadgeCheck className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-10 flex flex-1 flex-col justify-end gap-10">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {heroHighlights.map(({ title, description, icon: Icon }) => (
                      <div
                        key={title}
                        className="rounded-[24px] border border-[#dceae7] bg-white/92 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]"
                      >
                        <div className="mb-3 inline-flex rounded-2xl bg-[#dff6f3] p-2.5 text-[#0f766e]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-sm font-bold text-[#17313a]">{title}</div>
                        <p className="mt-2 text-sm leading-7 text-[#4e6672]">
                          {description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {trustStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-[22px] border border-[#d8ebe8] bg-white/85 px-5 py-4"
                      >
                        <div className="text-3xl font-extrabold tracking-[-0.05em] text-[#0f766e]">
                          {stat.value}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-[#4d6672]">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative lg:h-full lg:pt-0">
                <div className="rounded-[34px] border border-[#d7ebe7] bg-[linear-gradient(180deg,#0b1727_0%,#11253c_42%,#0f766e_100%)] p-6 text-white shadow-[0_28px_72px_rgba(15,23,42,0.16)] md:p-8 lg:flex lg:h-full lg:flex-col">
                  <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#63e4cf]">
                        Dashboard preview
                      </div>
                      <h2 className="mt-2 max-w-md text-3xl font-extrabold tracking-[-0.04em] text-white">
                        Clear daily view for your clinic team
                      </h2>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b7fff3]">
                      Live
                    </div>
                  </div>

                  <div className="mt-6 rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.24em] text-white/65">
                          Daily overview
                        </div>
                        <div className="mt-2 text-2xl font-bold text-white">
                          Clinic performance snapshot
                        </div>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                        Updated every hour
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {dashboardMetrics.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[22px] border border-white/10 bg-[#12283d]/70 p-4"
                        >
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                            {item.label}
                          </div>
                          <div className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-white">
                            {item.value}
                          </div>
                          <div className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[#70f0dd]">
                            {item.delta}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-[24px] border border-white/10 bg-[#102132]/70 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-bold text-white">
                            Weekly activity
                          </div>
                          <div className="text-xs text-white/55">
                            Appointments, revenue, and patient engagement
                          </div>
                        </div>
                        <BarChart3 className="h-5 w-5 text-[#78f3e0]" />
                      </div>

                      <div className="mt-5 flex items-end gap-3">
                        {[58, 76, 68, 88, 96, 72, 92].map((height, index) => (
                          <div key={height} className="flex-1 text-center">
                            <div
                              className={`mx-auto w-full max-w-[38px] rounded-t-2xl ${
                                index === 4
                                  ? "bg-[linear-gradient(180deg,#99f6e4_0%,#2dd4bf_100%)]"
                                  : "bg-white/55"
                              }`}
                              style={{ height: `${height * 1.2}px` }}
                            />
                            <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/55">
                              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {[
                      {
                        title: "Notification management",
                        description:
                          "Track reminders, queue alerts, and payment follow-ups in one feed.",
                        icon: BellRing,
                      },
                      {
                        title: "Permission-secured access",
                        description:
                          "Keep each team member inside the correct role and workflow scope.",
                        icon: ShieldCheck,
                      },
                    ].map(({ title, description, icon: Icon }) => (
                      <div
                        key={title}
                        className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dff6f3] text-[#0f766e]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="text-sm font-bold text-white">{title}</div>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-white/75">
                          {description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-8 md:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-[36px] border border-[#d7ebe7] bg-white/90 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)] md:p-8">
            <div className="grid gap-6 md:grid-cols-3">
              {trustStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-[clamp(2.7rem,5vw,4.1rem)] font-extrabold tracking-[-0.05em] text-[#0f766e]">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-base font-semibold text-[#29414a]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />
        <section id="features" className="px-5 py-20 md:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Key Features"
              title="Make the landing experience more professional and the product story more complete"
              subtitle="This updated homepage highlights the modules your clinic system already needs, while fixing low-contrast text and presenting the platform with stronger visual credibility."
            />

            <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featureCards.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />
        <section
          id="solutions"
          className="gradient-secondary px-5 py-20 md:px-8 lg:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Solutions"
              title="Built for reception, doctors, admins, billing, pharmacy, and lab teams"
              subtitle="Instead of a generic landing page, City Care now presents role-focused value with clearer workflow sections and stronger visual hierarchy."
            />

            <div className="mt-16 grid gap-6 xl:grid-cols-3">
              {solutionCards.map(({ title, description, points, icon: Icon }) => (
                <article
                  key={title}
                  className="rounded-[32px] border border-[#d7ebe7] bg-white p-7 shadow-[0_18px_46px_rgba(15,23,42,0.06)]"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#dff6f3] text-[#0f766e]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-[#0f172a]">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#536874]">{description}</p>
                  <div className="mt-6 space-y-3">
                    {points.map((point) => (
                      <div
                        key={point}
                        className="flex items-center gap-3 rounded-2xl border border-[#e6f1ef] bg-[#f8fcfb] px-4 py-3"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#0f766e]" />
                        <span className="text-sm font-medium text-[#29414a]">{point}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />
        <section id="pricing" className="px-5 py-20 md:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Pricing"
              title="Simple pricing for growing clinics and advanced teams"
              subtitle="The plans below make the landing page feel complete while highlighting premium modules like notifications, WhatsApp communication, and permissions."
            />

            <div className="mt-16 grid gap-6 xl:grid-cols-3">
              {pricingPlans.map((plan) => (
                <article
                  key={plan.name}
                  className={`rounded-[34px] border p-7 shadow-[0_20px_54px_rgba(15,23,42,0.06)] ${
                    plan.featured
                      ? "border-[#0f766e] bg-[linear-gradient(180deg,#0b1727_0%,#0f766e_100%)] text-white"
                      : "border-[#dbe8e6] bg-white text-[#0f172a]"
                  }`}
                >
                  {plan.featured && (
                    <div className="mb-5 inline-flex rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-white">
                      Most Popular
                    </div>
                  )}
                  <div
                    className={`text-sm font-bold uppercase tracking-[0.24em] ${
                      plan.featured ? "text-white/70" : "text-[#67808b]"
                    }`}
                  >
                    {plan.name}
                  </div>
                  <div className="mt-4 flex items-end gap-2">
                    <div className="text-5xl font-extrabold tracking-[-0.05em]">
                      {plan.price}
                    </div>
                    <div
                      className={`pb-1 text-sm ${
                        plan.featured ? "text-white/70" : "text-[#6a8088]"
                      }`}
                    >
                      {plan.period}
                    </div>
                  </div>
                  <p
                    className={`mt-4 text-sm leading-7 ${
                      plan.featured ? "text-white/80" : "text-[#556874]"
                    }`}
                  >
                    {plan.summary}
                  </p>

                  <div className="mt-7 space-y-3">
                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
                          plan.featured
                            ? "border-white/10 bg-white/6"
                            : "border-[#e7f0ef] bg-[#f8fcfb]"
                        }`}
                      >
                        <CheckCircle2
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            plan.featured ? "text-[#9ff7e8]" : "text-[#0f766e]"
                          }`}
                        />
                        <span className="text-sm leading-7">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handlePrimaryAction}
                    className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold transition ${
                      plan.featured
                        ? "border border-white/20 bg-white text-[#0f766e] hover:bg-[#ecfffc]"
                        : "border-none bg-[#0f766e] text-white shadow-[0_14px_30px_rgba(15,118,110,0.20)] hover:-translate-y-0.5"
                    }`}
                  >
                    {plan.name === "Enterprise" ? "Talk to Sales" : "Choose Plan"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />
        <section
          id="integrations"
          className="gradient-secondary px-5 py-20 md:px-8 lg:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Integrations & Visuals"
              title="Show more features with icons, charts, and polished interface blocks"
              subtitle="This section makes the page feel richer and more product-led, especially on desktop, while still stacking cleanly on tablets and phones."
            />

            <div className="mt-16 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="grid gap-6">
                {integrationCards.map(({ title, description, icon: Icon }) => (
                  <article
                    key={title}
                    className="rounded-[30px] border border-[#d7ebe7] bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.05)]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#dff6f3] text-[#0f766e]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#0f172a]">{title}</h3>
                        <p className="mt-3 text-sm leading-7 text-[#556874]">
                          {description}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="rounded-[34px] border border-[#d8ebe8] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-[0.24em] text-[#0f766e]">
                      Management preview
                    </div>
                    <h3 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[#0f172a]">
                      Attractive visuals with useful product proof
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#15803d]">
                    <HeartPulse className="h-4 w-4" />
                    Healthy system
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      title: "User role & permission matrix",
                      detail: "Clinic admin, doctor, accountant, receptionist, pharmacy, lab",
                      icon: UserCog,
                    },
                    {
                      title: "Notification timeline",
                      detail: "Reminder sent, payment follow-up, queue update, consultation alert",
                      icon: BellRing,
                    },
                    {
                      title: "Billing and receipts",
                      detail: "Payments tracked, daily collection trend, pending invoices",
                      icon: ReceiptText,
                    },
                    {
                      title: "Clinical reports",
                      detail: "Registrations, appointments, lab completion, care continuity",
                      icon: FileText,
                    },
                  ].map(({ title, detail, icon: Icon }) => (
                    <div
                      key={title}
                      className="rounded-[24px] border border-[#e5f0ee] bg-[#f8fcfb] p-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dff6f3] text-[#0f766e]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-sm font-bold text-[#17313a]">{title}</div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[#566f7a]">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />
        <section id="contact" className="px-5 py-20 md:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-[34px] border border-[#d8ebe8] bg-white/92 shadow-[0_20px_52px_rgba(15,23,42,0.06)]">
            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="border-b border-[#e2efec] p-8 lg:border-b-0 lg:border-r md:p-10">
                <div className="text-sm font-bold uppercase tracking-[0.24em] text-[#0f766e]">
                  Contact
                </div>
                <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.05em] text-[#0f172a]">
                  Let&apos;s discuss your clinic workflow
                </h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-[#556874]">
                  Reach out if you want a clean setup for appointments, billing,
                  communication, and secure staff access. We&apos;ll help you choose
                  the right modules for your clinic.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={handlePrimaryAction}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border-none bg-[#0f766e] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#0c655e]"
                  >
                    Book a Demo
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d6e8e4] bg-white px-6 py-3.5 text-sm font-bold text-[#17313a] transition hover:border-[#0f766e] hover:text-[#0f766e]"
                  >
                    Login to System
                    <Phone className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-10 grid gap-4">
                  {contactCards.map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="flex items-center gap-4 rounded-[20px] border border-[#e4efed] bg-[#f8fcfb] px-5 py-4"
                    >
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dff6f3] text-[#0f766e]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#17313a]">{label}</div>
                        <div className="text-sm text-[#617783]">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 md:p-10">
                <div className="text-sm font-bold uppercase tracking-[0.24em] text-[#0f766e]">
                  Send a Message
                </div>
                <h3 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#0f172a]">
                  Tell us what your clinic needs
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#556874]">
                  Share your workflow priorities and we&apos;ll help align the right
                  modules for appointments, billing, communication, and staff access.
                </p>

                <form onSubmit={handleContactSubmit} className="mt-8 space-y-4">
                  <ContactField
                    value={contactForm.name}
                    placeholder="Your name"
                    onChange={(name) => setContactForm((current) => ({ ...current, name }))}
                  />
                  <ContactField
                    value={contactForm.email}
                    placeholder="Email address"
                    onChange={(email) =>
                      setContactForm((current) => ({ ...current, email }))
                    }
                  />
                  <ContactField
                    value={contactForm.message}
                    placeholder="Need notification management, WhatsApp integration, or role permissions?"
                    textarea
                    onChange={(message) =>
                      setContactForm((current) => ({ ...current, message }))
                    }
                  />
                  <button
                    type="submit"
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-none bg-[#0f766e] text-sm font-bold text-white transition hover:bg-[#0c655e]"
                  >
                    <Send className="h-4 w-4" />
                    Submit Inquiry
                  </button>
                </form>

                <div className="mt-6 rounded-[24px] border border-[#dce9e7] bg-[#f7fcfb] p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-[#dff6f3] p-2.5 text-[#0f766e]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#17313a]">
                        Recommended feature stack
                      </div>
                      <p className="mt-2 text-sm leading-7 text-[#556874]">
                        Appointments, Billing, Reports, Notification Management,
                        WhatsApp Integration, Queue Management, User Roles, and
                        Permission Controls.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#d8ebe8] bg-white px-5 py-8 md:px-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[#617983] md:flex-row md:items-center md:justify-between">
            <div>
              &copy; {year} <span className="font-bold text-[#0f172a]">City Care</span>.
              Built for modern clinic operations.
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {navItems.map((item) => (
                <button
                  key={item.target}
                  type="button"
                  onClick={() => scrollToSection(item.target)}
                  className="border-none bg-transparent p-0 text-sm text-[#617983] transition hover:text-[#0f766e]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
