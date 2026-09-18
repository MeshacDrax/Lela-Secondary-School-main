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
import { apiRequest, downloadReport, downloadReportCard, login, realtimeUrl } from "./api/client";
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
type QuickAction =
  | "Register student"
  | "Edit student"
  | "Record attendance"
  | "Generate report card"
  | "Send announcement"
  | "Export finance report"
  | "Run backup check";

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
  const [action, setAction] = useState<QuickAction | null>(null);
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

  async function handleQuickAction(selectedAction: QuickAction, values: Record<string, string>) {
    if (selectedAction === "Edit student") {
      const studentId = values.id;
      const payload = {
        admissionNumber: values.admissionNumber,
        studentId: values.studentId,
        name: values.name,
        className: values.className,
        stream: values.stream,
        gender: values.gender,
        guardian: values.guardian,
        guardianPhone: values.guardianPhone
      };

      if (token.startsWith("offline-")) {
        const student = fallbackRecords.students.find((record) => record.id === studentId);
        if (student) {
          Object.assign(student, payload);
        }
        setRecords([...fallbackRecords.students]);
        setNotice("Student information updated in demo mode");
      } else {
        const updated = await apiRequest<RecordRow>(`/api/students/${encodeURIComponent(studentId)}`, token, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        setRecords((current) => current.map((record) => record.id === studentId ? updated : record));
        setNotice("Student information updated");
      }
      return;
    }

    if (selectedAction === "Export finance report") {
      if (token.startsWith("offline-")) {
        setNotice("Finance report ready in demo mode");
      } else {
        await downloadReport("finance", token, "excel");
        setNotice("Finance report downloaded");
      }
      return;
    }

    if (selectedAction === "Generate report card") {
      if (token.startsWith("offline-")) {
        setNotice(`Report card ready for ${values.student}`);
      } else {
        await downloadReportCard(values.student, token);
        setNotice("Report card downloaded");
      }
      return;
    }

    const endpoints: Record<string, string> = {
      "Register student": "/api/students",
      "Record attendance": "/api/attendance",
      "Send announcement": "/api/communications",
      "Run backup check": "/api/backups/check"
    };
    const payload = selectedAction === "Register student"
      ? {
          admissionNumber: values.admissionNumber,
          studentId: values.studentId,
          name: values.name,
          className: values.className,
          stream: values.stream,
          gender: values.gender,
          guardian: values.guardian,
          guardianPhone: values.guardianPhone
        }
      : selectedAction === "Record attendance"
        ? { group: values.group, present: Number(values.present), absent: Number(values.absent), late: Number(values.late), qrEnabled: values.qrEnabled === "true" }
        : selectedAction === "Send announcement"
          ? { audience: values.audience, title: values.title, message: values.message }
          : {};

    if (token.startsWith("offline-")) {
      if (selectedAction === "Register student") {
        fallbackRecords.students.unshift({
          id: `offline-${Date.now()}`,
          admissionNumber: values.admissionNumber,
          studentId: values.studentId,
          name: values.name,
          className: values.className,
          stream: values.stream,
          gender: values.gender,
          guardian: values.guardian,
          guardianPhone: values.guardianPhone,
          attendanceRate: 100,
          averageScore: 0,
          feeBalance: 0
        });
      }
      if (selectedAction === "Record attendance") {
        (fallbackRecords.attendance ??= []).unshift({ id: `offline-${Date.now()}`, date: new Date().toISOString().slice(0, 10), group: values.group, present: Number(values.present), absent: Number(values.absent), late: Number(values.late), qrEnabled: values.qrEnabled === "true" });
      }
      if (selectedAction === "Send announcement") {
        (fallbackRecords.communications ??= []).unshift({ id: `offline-${Date.now()}`, channel: "Portal", audience: values.audience, title: values.title, message: values.message, status: "Sent", sendAt: new Date().toISOString() });
      }
      if (selectedAction === "Register student" || selectedAction === "Record attendance" || selectedAction === "Send announcement") {
        const nextModule = selectedAction === "Register student" ? "students" : selectedAction === "Record attendance" ? "attendance" : "communications";
        setRecords([...(fallbackRecords[nextModule] ?? [])]);
        setActiveModule(nextModule);
      }
      setNotice(`${selectedAction} completed in demo mode`);
      return;
    }

    await apiRequest(endpoints[selectedAction], token, { method: "POST", body: JSON.stringify(payload) });
    setNotice(`${selectedAction} completed`);
    if (selectedAction === "Register student" || selectedAction === "Record attendance" || selectedAction === "Send announcement") {
      setActiveModule(selectedAction === "Register student" ? "students" : selectedAction === "Record attendance" ? "attendance" : "communications");
    }
  }

  if (!user || !token) {
    return <LoginScreen error={loginError} onLogin={handleLogin} theme={theme} setTheme={setTheme} />;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-block">
          <img className="school-logo school-logo-small" src="/lela-logo.jpeg" alt="Lela Secondary School logo" />
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
            <DashboardView data={dashboard} onOpenModule={setActiveModule} onQuickAction={setAction} />
          ) : (
            <ModuleView
              module={selectedModule}
              records={records}
              query={query}
              loading={loading}
              onQuery={setQuery}
              onExport={handleExport}
              onEditStudent={async (studentId, values) => handleQuickAction("Edit student", { id: studentId, ...values })}
            />
          )}
        </main>
      </div>
      {action ? (
        <ActionDialog
          action={action}
          onClose={() => setAction(null)}
          onSubmit={async (values) => {
            try {
              await handleQuickAction(action, values);
              setAction(null);
            } catch (error) {
              setNotice(error instanceof Error ? error.message : "Action failed");
            }
          }}
        />
      ) : null}
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
          <img className="school-logo school-logo-large" src="/lela-logo.jpeg" alt="Lela Secondary School logo" />
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

function DashboardView({ data, onOpenModule, onQuickAction }: { data: DashboardData; onOpenModule: (module: string) => void; onQuickAction: (action: QuickAction) => void }) {
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
          <button className="quick-action" key={action} onClick={() => onQuickAction(action as QuickAction)}>
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

function ActionDialog({ action, initialValues, onClose, onSubmit }: { action: QuickAction; initialValues?: Record<string, string>; onClose: () => void; onSubmit: (values: Record<string, string>) => Promise<void> }) {
  const [values, setValues] = useState<Record<string, string>>({
    admissionNumber: "",
    studentId: "",
    student: "Amani Were",
    name: "",
    className: "Form 1",
    stream: "Green",
    gender: "Male",
    guardian: "",
    guardianPhone: "",
    group: "Form 4 Green",
    present: "40",
    absent: "0",
    late: "0",
    qrEnabled: "true",
    audience: "Parents",
    title: "",
    message: "",
    ...initialValues
  });
  const fields: Record<QuickAction, Array<{ key: string; label: string; type?: string; options?: string[] }>> = {
    "Register student": [
      { key: "admissionNumber", label: "Admission number" },
      { key: "studentId", label: "Student ID" },
      { key: "name", label: "Student name" },
      { key: "className", label: "Class" },
      { key: "stream", label: "Stream" },
      { key: "gender", label: "Gender", type: "select", options: ["Male", "Female"] },
      { key: "guardian", label: "Guardian name" },
      { key: "guardianPhone", label: "Guardian phone", type: "tel" }
    ],
    "Edit student": [
      { key: "admissionNumber", label: "Admission number" },
      { key: "studentId", label: "Student ID" },
      { key: "name", label: "Student name" },
      { key: "className", label: "Class" },
      { key: "stream", label: "Stream" },
      { key: "gender", label: "Gender", type: "select", options: ["Male", "Female"] },
      { key: "guardian", label: "Guardian name" },
      { key: "guardianPhone", label: "Guardian phone", type: "tel" }
    ],
    "Record attendance": [
      { key: "group", label: "Class or group" },
      { key: "present", label: "Present", type: "number" },
      { key: "absent", label: "Absent", type: "number" },
      { key: "late", label: "Late", type: "number" }
    ],
    "Generate report card": [{ key: "student", label: "Student name" }],
    "Send announcement": [
      { key: "audience", label: "Audience" },
      { key: "title", label: "Title" }
    ],
    "Export finance report": [],
    "Run backup check": []
  };
  const actionFields = fields[action];

  useEffect(() => {
    if (actionFields.length === 0) {
      void onSubmit(values);
    }
  }, []);

  return actionFields.length === 0 ? null : (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="action-dialog" onSubmit={(event) => { event.preventDefault(); void onSubmit(values); }}>
        <div className="dialog-header">
          <div><p className="eyebrow">Quick action</p><h2>{action}</h2></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
        </div>
        <div className="dialog-fields">
          {actionFields.map((field) => (
            <label key={field.key}>
              {field.label}
              {field.type === "select" ? (
                <select required value={values[field.key]} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}>
                  {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input required type={field.type ?? "text"} value={values[field.key]} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} />
              )}
            </label>
          ))}
          {action === "Send announcement" ? <label>Message<textarea required value={values.message} onChange={(event) => setValues((current) => ({ ...current, message: event.target.value }))} /></label> : null}
        </div>
        <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">{action === "Edit student" ? "Save" : "Continue"}</button></div>
      </form>
    </div>
  );
}

function ModuleView({
  module,
  records,
  query,
  loading,
  onQuery,
  onExport,
  onEditStudent
}: {
  module?: ModuleItem;
  records: RecordRow[];
  query: string;
  loading: boolean;
  onQuery: (query: string) => void;
  onExport: (format: "pdf" | "excel") => void;
  onEditStudent: (studentId: string, values: Record<string, string>) => Promise<void>;
}) {
  const [selectedRecord, setSelectedRecord] = useState<RecordRow | null>(null);
  const [editingStudent, setEditingStudent] = useState(false);
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
                      <button className="row-action" onClick={() => setSelectedRecord(record)}>Open</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {selectedRecord ? (
        <section className="detail-panel record-detail" aria-live="polite">
          <div className="detail-header">
            <div><p className="eyebrow">Record details</p><h3>{String(selectedRecord.name ?? selectedRecord.student ?? selectedRecord.title ?? "Selected record")}</h3></div>
            <button className="icon-button" onClick={() => setSelectedRecord(null)} aria-label="Close record details"><X size={18} /></button>
          </div>
          <div className="detail-list">
            {Object.entries(selectedRecord).filter(([key]) => key !== "id").map(([key, value]) => (
              <div key={key}><span>{key.replace(/([A-Z])/g, " $1")}</span><strong>{Array.isArray(value) ? value.join(", ") : String(value ?? "")}</strong></div>
            ))}
          </div>
          {module?.key === "students" ? (
            <div className="detail-actions">
              <button onClick={() => setEditingStudent(true)}>Edit student</button>
            </div>
          ) : null}
        </section>
      ) : null}
      {editingStudent && selectedRecord ? (
        <ActionDialog
          action="Edit student"
          initialValues={Object.fromEntries(Object.entries(selectedRecord).map(([key, value]) => [key, String(value ?? "")]))}
          onClose={() => setEditingStudent(false)}
          onSubmit={async (values) => {
            await onEditStudent(String(selectedRecord.id), values);
            const editableFields = ["admissionNumber", "studentId", "name", "className", "stream", "gender", "guardian", "guardianPhone"];
            setSelectedRecord((current) => current ? { ...current, ...Object.fromEntries(editableFields.map((field) => [field, values[field]])) } : current);
            setEditingStudent(false);
          }}
        />
      ) : null}
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
