import { useEffect, useMemo, useState } from "react";
import type { AuthUser } from "@lela/shared";
import {
  BarChart3,
  BedDouble,
  Bell,
  BookOpenCheck,
  Boxes,
  Bus,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  DatabaseBackup,
  Download,
  FileSpreadsheet,
  GraduationCap,
  LibraryBig,
  LogOut,
  Menu,
  MessagesSquare,
  MonitorSmartphone,
  Moon,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  UsersRound,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiRequest, downloadReport, login, realtimeUrl } from "./api/client";
import { fallbackDashboard, fallbackRecords } from "./data/fallback";

type ModuleItem = {
  key: string;
  label: string;
  icon: string;
  description?: string;
};

type DashboardData = typeof fallbackDashboard & {
  modules: ModuleItem[];
};

type RecordRow = Record<string, unknown>;
type Theme = "light" | "dark";

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  UsersRound,
  CalendarCheck,
  BookOpenCheck,
  CalendarDays,
  ReceiptText,
  MonitorSmartphone,
  MessagesSquare,
  LibraryBig,
  Boxes,
  BedDouble,
  Bus,
  Sparkles,
  ShieldCheck,
  DatabaseBackup
};

const demoAccounts = [
  ["Admin", "admin@lela.sch.ke", "Admin@123"],
  ["Principal", "principal@lela.sch.ke", "Principal@123"],
  ["Teacher", "teacher@lela.sch.ke", "Teacher@123"],
  ["Parent", "parent@lela.sch.ke", "Parent@123"],
  ["Accountant", "accounts@lela.sch.ke", "Accounts@123"],
  ["Librarian", "librarian@lela.sch.ke", "Library@123"]
];

const fallbackUsers: Record<string, { password: string; user: AuthUser }> = {
  "admin@lela.sch.ke": {
    password: "Admin@123",
    user: { id: "offline-admin", name: "Grace Achieng", email: "admin@lela.sch.ke", role: "ADMIN", avatarInitials: "GA" }
  },
  "principal@lela.sch.ke": {
    password: "Principal@123",
    user: { id: "offline-principal", name: "Daniel Otieno", email: "principal@lela.sch.ke", role: "PRINCIPAL", avatarInitials: "DO" }
  },
  "teacher@lela.sch.ke": {
    password: "Teacher@123",
    user: { id: "offline-teacher", name: "Mary Wanjiku", email: "teacher@lela.sch.ke", role: "TEACHER", avatarInitials: "MW" }
  },
  "student@lela.sch.ke": {
    password: "Student@123",
    user: { id: "offline-student", name: "Amani Were", email: "student@lela.sch.ke", role: "STUDENT", avatarInitials: "AW" }
  },
  "parent@lela.sch.ke": {
    password: "Parent@123",
    user: { id: "offline-parent", name: "Joseph Were", email: "parent@lela.sch.ke", role: "PARENT", avatarInitials: "JW" }
  },
  "accounts@lela.sch.ke": {
    password: "Accounts@123",
    user: { id: "offline-accountant", name: "Susan Kilonzo", email: "accounts@lela.sch.ke", role: "ACCOUNTANT", avatarInitials: "SK" }
  },
  "librarian@lela.sch.ke": {
    password: "Library@123",
    user: { id: "offline-librarian", name: "Peter Mwangi", email: "librarian@lela.sch.ke", role: "LIBRARIAN", avatarInitials: "PM" }
  }
};

function readStoredAuth() {
  const raw = localStorage.getItem("lela-auth");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as { token: string; user: AuthUser };
  } catch {
    localStorage.removeItem("lela-auth");
    return null;
  }
}

function formatCell(key: string, value: unknown) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "boolean") {
    return <span className={`status ${value ? "status-green" : "status-muted"}`}>{value ? "Yes" : "No"}</span>;
  }

  if (typeof value === "number") {
    const moneyKeys = ["amount", "paid", "billed", "balance", "fee", "fines", "gross", "net"];
    if (moneyKeys.some((item) => key.toLowerCase().includes(item))) {
      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0
      }).format(value);
    }

    if (key.toLowerCase().includes("rate") || key.toLowerCase().includes("collection")) {
      return `${value}%`;
    }
  }

  const text = value == null ? "" : String(value);
  const statusTone = text.toLowerCase();
  if (["active", "published", "sent", "live", "healthy", "complete", "approved", "processed", "success"].includes(statusTone)) {
    return <span className="status status-green">{text}</span>;
  }
  if (["pending", "marking", "scheduled", "needs service", "1 exception"].includes(statusTone)) {
    return <span className="status status-gold">{text}</span>;
  }
  if (["high", "failed"].includes(statusTone)) {
    return <span className="status status-red">{text}</span>;
  }

  return text;
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("lela-theme") as Theme) || "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("lela-theme", theme);
  }, [theme]);

  return { theme, setTheme };
}

export default function App() {
  const stored = readStoredAuth();
  const [token, setToken] = useState(stored?.token ?? "");
  const [user, setUser] = useState<AuthUser | null>(stored?.user ?? null);
  const [dashboard, setDashboard] = useState<DashboardData>(fallbackDashboard);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("System ready");
  const [loginError, setLoginError] = useState("");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!token || token.startsWith("offline-")) {
      return;
    }

    apiRequest<DashboardData>("/api/dashboard", token)
      .then((data) => setDashboard(data))
      .catch(() => setDashboard(fallbackDashboard));
  }, [token]);

  useEffect(() => {
    if (!token || activeModule === "dashboard") {
      return;
    }

    setLoading(true);
    if (token.startsWith("offline-")) {
      setRecords(fallbackRecords[activeModule] ?? []);
      setLoading(false);
      return;
    }

    apiRequest<RecordRow[]>(`/api/${activeModule}?q=${encodeURIComponent(query)}`, token)
      .then((data) => setRecords(data))
      .catch(() => setRecords(fallbackRecords[activeModule] ?? []))
      .finally(() => setLoading(false));
  }, [activeModule, query, token]);

  useEffect(() => {
    if (!token || token.startsWith("offline-")) {
      return;
    }

    const stream = new EventSource(realtimeUrl(token));
    stream.addEventListener("notification", (event) => {
      const payload = JSON.parse(event.data);
      setNotice(payload.title ?? "New notification");
    });
    stream.onerror = () => stream.close();

    return () => stream.close();
  }, [token]);

  const selectedModule = useMemo(
    () => dashboard.modules.find((module) => module.key === activeModule),
    [activeModule, dashboard.modules]
  );

  async function handleLogin(email: string, password: string) {
    setLoginError("");
    try {
      const session = await login(email, password);
      localStorage.setItem("lela-auth", JSON.stringify(session));
      setToken(session.token);
      setUser(session.user);
      setActiveModule("dashboard");
    } catch (error) {
      const fallback = fallbackUsers[email.toLowerCase()];
      if (fallback?.password === password) {
        const session = { token: `offline-${fallback.user.role.toLowerCase()}`, user: fallback.user };
        localStorage.setItem("lela-auth", JSON.stringify(session));
        setDashboard(fallbackDashboard);
        setToken(session.token);
        setUser(session.user);
        setActiveModule("dashboard");
        setNotice("Demo mode active");
        return;
      }

      setLoginError(error instanceof Error ? error.message : "Login failed");
    }
  }

  function handleLogout() {
    localStorage.removeItem("lela-auth");
    setToken("");
    setUser(null);
    setRecords([]);
    setActiveModule("dashboard");
  }

  async function handleExport(format: "pdf" | "excel") {
    if (activeModule === "dashboard") {
      return;
    }

    try {
      await downloadReport(activeModule, token, format, query);
      setNotice(`${format === "pdf" ? "PDF" : "Excel"} report downloaded`);
    } catch {
      setNotice("Report export needs the API server");
    }
  }

  if (!user || !token) {
    return <LoginScreen error={loginError} onLogin={handleLogin} theme={theme} setTheme={setTheme} />;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-block">
          <div className="crest">LS</div>
          <div>
            <strong>Lela Secondary School</strong>
            <span>{dashboard.school.currentTerm} · {dashboard.school.academicYear}</span>
          </div>
        </div>

        <nav className="module-nav">
          <button
            className={activeModule === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => {
              setActiveModule("dashboard");
              setMenuOpen(false);
            }}
          >
            <BarChart3 size={18} />
            Dashboard
          </button>
          {dashboard.modules.map((module) => {
            const Icon = iconMap[module.icon] ?? Boxes;
            return (
              <button
                key={module.key}
                className={activeModule === module.key ? "nav-item active" : "nav-item"}
                onClick={() => {
                  setActiveModule(module.key);
                  setMenuOpen(false);
                }}
              >
                <Icon size={18} />
                {module.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div>
            <p className="eyebrow">Lela Secondary School</p>
            <h1>{activeModule === "dashboard" ? "Command Dashboard" : selectedModule?.label}</h1>
          </div>
          <div className="topbar-actions">
            <div className="notice-pill">
              <Bell size={16} />
              <span>{notice}</span>
            </div>
            <button className="icon-button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Toggle theme">
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className="user-chip">
              <span>{user.avatarInitials}</span>
              <div>
                <strong>{user.name}</strong>
                <small>{user.role}</small>
              </div>
            </div>
            <button className="icon-button" onClick={handleLogout} aria-label="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main>
          {activeModule === "dashboard" ? (
            <DashboardView data={dashboard} onOpenModule={setActiveModule} />
          ) : (
            <ModuleView
              module={selectedModule}
              records={records}
              query={query}
              loading={loading}
              onQuery={setQuery}
              onExport={handleExport}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function LoginScreen({
  error,
  onLogin,
  theme,
  setTheme
}: {
  error: string;
  onLogin: (email: string, password: string) => Promise<void>;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}) {
  const [email, setEmail] = useState("admin@lela.sch.ke");
  const [password, setPassword] = useState("Admin@123");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    await onLogin(email, password);
    setSubmitting(false);
  }

  return (
    <div className="login-shell">
      <button className="theme-float" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Toggle theme">
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>
      <section className="login-panel">
        <div className="login-identity">
          <div className="large-crest">LS</div>
          <p className="eyebrow">Secure School Management</p>
          <h1>Lela Secondary School</h1>
          <div className="login-stats">
            <span>1,284 Students</span>
            <span>87 Staff</span>
            <span>3 Campuses</span>
          </div>
        </div>

        <form className="login-card" onSubmit={submit}>
          <div>
            <p className="eyebrow">Welcome</p>
            <h2>Sign in</h2>
          </div>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" />
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
            <ChevronRight size={18} />
          </button>
          <div className="demo-grid">
            {demoAccounts.map(([role, demoEmail, demoPassword]) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setEmail(demoEmail);
                  setPassword(demoPassword);
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </form>
      </section>
    </div>
  );
}

function DashboardView({ data, onOpenModule }: { data: DashboardData; onOpenModule: (module: string) => void }) {
  return (
    <div className="dashboard-grid">
      <section className="metric-grid">
        {data.metrics.map((metric) => (
          <article className={`metric-card metric-${metric.tone}`} key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.trend}</small>
          </article>
        ))}
      </section>

      <section className="main-grid">
        <article className="panel wide">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Weekly Attendance</p>
              <h2>Daily Presence</h2>
            </div>
            <CalendarCheck size={20} />
          </div>
          <BarSeries data={data.charts.attendance} suffix="%" />
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Academic Mean</p>
              <h2>By Form</h2>
            </div>
            <BookOpenCheck size={20} />
          </div>
          <BarSeries data={data.charts.performance} />
        </article>
      </section>

      <section className="quick-grid">
        {data.quickActions.map((action) => (
          <button className="quick-action" key={action}>
            <Plus size={17} />
            {action}
          </button>
        ))}
      </section>

      <section className="module-grid">
        {data.modules.map((module) => {
          const Icon = iconMap[module.icon] ?? Boxes;
          return (
            <button key={module.key} className="module-card" onClick={() => onOpenModule(module.key)}>
              <Icon size={22} />
              <strong>{module.label}</strong>
              <ChevronRight size={18} />
            </button>
          );
        })}
      </section>

      <section className="main-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">AI Insights</p>
              <h2>Interventions</h2>
            </div>
            <Sparkles size={20} />
          </div>
          <div className="stack-list">
            {data.aiHighlights.map((item) => (
              <div className="insight-row" key={item.id}>
                <span className={`status ${item.risk === "High" ? "status-red" : "status-green"}`}>{item.risk}</span>
                <strong>{item.student}</strong>
                <p>{item.recommendation}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Notifications</p>
              <h2>Announcements</h2>
            </div>
            <Bell size={20} />
          </div>
          <div className="stack-list">
            {data.notifications.map((item) => (
              <div className="notification-row" key={item.id}>
                <span className={`dot dot-${item.tone}`} />
                <span>{item.title}</span>
                {item.unread ? <strong>New</strong> : null}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function ModuleView({
  module,
  records,
  query,
  loading,
  onQuery,
  onExport
}: {
  module?: ModuleItem;
  records: RecordRow[];
  query: string;
  loading: boolean;
  onQuery: (query: string) => void;
  onExport: (format: "pdf" | "excel") => void;
}) {
  const columns = useMemo(() => {
    const first = records[0] ?? {};
    return Object.keys(first).filter((key) => key !== "id").slice(0, 8);
  }, [records]);
  const Icon = module ? iconMap[module.icon] ?? Boxes : Boxes;

  return (
    <div className="module-workspace">
      <section className="module-toolbar">
        <div className="module-title">
          <span className="module-icon">
            <Icon size={20} />
          </span>
          <div>
            <p className="eyebrow">Module</p>
            <h2>{module?.label}</h2>
          </div>
        </div>
        <div className="search-box">
          <Search size={18} />
          <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search records" />
        </div>
        <button className="secondary-button" onClick={() => onExport("excel")}>
          <FileSpreadsheet size={17} />
          Excel
        </button>
        <button className="secondary-button" onClick={() => onExport("pdf")}>
          <Download size={17} />
          PDF
        </button>
      </section>

      <section className="record-summary">
        <article>
          <span>Total Records</span>
          <strong>{records.length}</strong>
        </article>
        <article>
          <span>Filtered View</span>
          <strong>{query ? "On" : "All"}</strong>
        </article>
        <article>
          <span>Export Status</span>
          <strong>Ready</strong>
        </article>
      </section>

      <section className="table-panel">
        {loading ? (
          <div className="empty-state">Loading records...</div>
        ) : records.length === 0 ? (
          <div className="empty-state">No records found</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column.replace(/([A-Z])/g, " $1")}</th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={String(record.id ?? JSON.stringify(record))}>
                    {columns.map((column) => (
                      <td key={column}>{formatCell(column, record[column])}</td>
                    ))}
                    <td>
                      <button className="row-action">Open</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function BarSeries({ data, suffix = "" }: { data: Array<{ label: string; value: number }>; suffix?: string }) {
  const max = Math.max(...data.map((item) => item.value), 100);

  return (
    <div className="bar-series">
      {data.map((item) => (
        <div className="bar-row" key={item.label}>
          <span>{item.label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          <strong>{item.value}{suffix}</strong>
        </div>
      ))}
    </div>
  );
}
