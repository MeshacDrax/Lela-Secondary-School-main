import type { Role } from "@lela/shared";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  password: string;
  avatarInitials: string;
  linkedStudentId?: string;
}

export interface ModuleDefinition {
  key: DemoModuleKey;
  label: string;
  description: string;
  icon: string;
  roles: Role[];
}

export type DemoModuleKey =
  | "students"
  | "teachers"
  | "attendance"
  | "academics"
  | "timetable"
  | "finance"
  | "portal"
  | "communications"
  | "library"
  | "inventory"
  | "hostel"
  | "transport"
  | "aiInsights"
  | "auditLogs"
  | "backups";

export const demoUsers: DemoUser[] = [
  {
    id: "usr-admin",
    name: "Grace Achieng",
    email: "admin@lela.sch.ke",
    role: "ADMIN",
    password: "Admin@123",
    avatarInitials: "GA"
  },
  {
    id: "usr-principal",
    name: "Daniel Otieno",
    email: "principal@lela.sch.ke",
    role: "PRINCIPAL",
    password: "Principal@123",
    avatarInitials: "DO"
  },
  {
    id: "usr-teacher",
    name: "Mary Wanjiku",
    email: "teacher@lela.sch.ke",
    role: "TEACHER",
    password: "Teacher@123",
    avatarInitials: "MW"
  },
  {
    id: "usr-student",
    name: "Amani Were",
    email: "student@lela.sch.ke",
    role: "STUDENT",
    password: "Student@123",
    avatarInitials: "AW",
    linkedStudentId: "std-1001"
  },
  {
    id: "usr-parent",
    name: "Joseph Were",
    email: "parent@lela.sch.ke",
    role: "PARENT",
    password: "Parent@123",
    avatarInitials: "JW",
    linkedStudentId: "std-1001"
  },
  {
    id: "usr-accountant",
    name: "Susan Kilonzo",
    email: "accounts@lela.sch.ke",
    role: "ACCOUNTANT",
    password: "Accounts@123",
    avatarInitials: "SK"
  },
  {
    id: "usr-librarian",
    name: "Peter Mwangi",
    email: "librarian@lela.sch.ke",
    role: "LIBRARIAN",
    password: "Library@123",
    avatarInitials: "PM"
  }
];

const allStaffRoles: Role[] = ["ADMIN", "PRINCIPAL", "TEACHER", "ACCOUNTANT", "LIBRARIAN"];
const leadershipRoles: Role[] = ["ADMIN", "PRINCIPAL"];

export const moduleDefinitions: ModuleDefinition[] = [
  {
    key: "students",
    label: "Students",
    description: "Admissions, profiles, ID generation, discipline, transfers, alumni, attendance, and bulk records.",
    icon: "GraduationCap",
    roles: [...allStaffRoles]
  },
  {
    key: "teachers",
    label: "Teachers & Staff",
    description: "Staff profiles, subject allocation, attendance, leave, payroll overview, and performance tracking.",
    icon: "UsersRound",
    roles: [...allStaffRoles]
  },
  {
    key: "attendance",
    label: "Attendance",
    description: "Daily summaries, QR-ready check-in, staff attendance, boarding attendance, and exceptions.",
    icon: "CalendarCheck",
    roles: [...allStaffRoles, "PARENT", "STUDENT"]
  },
  {
    key: "academics",
    label: "Academics",
    description: "Classes, streams, subjects, curriculum, exams, grading, reports, transcripts, assignments, and analytics.",
    icon: "BookOpenCheck",
    roles: ["ADMIN", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"]
  },
  {
    key: "timetable",
    label: "Timetable",
    description: "Smart scheduling, teacher conflict detection, classroom allocation, and printable schedules.",
    icon: "CalendarDays",
    roles: ["ADMIN", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"]
  },
  {
    key: "finance",
    label: "Finance",
    description: "Fee structures, payments, receipts, balances, expenses, reports, and M-Pesa-ready workflows.",
    icon: "ReceiptText",
    roles: ["ADMIN", "PRINCIPAL", "ACCOUNTANT", "PARENT", "STUDENT"]
  },
  {
    key: "portal",
    label: "Parent & Student Portal",
    description: "Academic progress, attendance, fee balances, announcements, report cards, and homework access.",
    icon: "MonitorSmartphone",
    roles: ["ADMIN", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"]
  },
  {
    key: "communications",
    label: "Communication",
    description: "SMS, email, announcements, event reminders, and parent-teacher messaging.",
    icon: "MessagesSquare",
    roles: ["ADMIN", "PRINCIPAL", "TEACHER", "PARENT", "STUDENT"]
  },
  {
    key: "library",
    label: "Library",
    description: "Catalog, borrowing, returns, fines, and digital library records.",
    icon: "LibraryBig",
    roles: ["ADMIN", "PRINCIPAL", "LIBRARIAN", "TEACHER", "STUDENT"]
  },
  {
    key: "inventory",
    label: "Inventory & Assets",
    description: "Asset tracking, inventory, classroom equipment, laboratory equipment, and condition monitoring.",
    icon: "Boxes",
    roles: leadershipRoles
  },
  {
    key: "hostel",
    label: "Hostel",
    description: "Room allocation, boarding attendance, meal tracking, and hostel reports.",
    icon: "BedDouble",
    roles: leadershipRoles
  },
  {
    key: "transport",
    label: "Transport",
    description: "Bus routes, driver records, passenger manifests, and transport fee tracking.",
    icon: "Bus",
    roles: ["ADMIN", "PRINCIPAL", "ACCOUNTANT"]
  },
  {
    key: "aiInsights",
    label: "AI Insights",
    description: "Academic insights, risk prediction, intervention recommendations, and cohort trend analysis.",
    icon: "Sparkles",
    roles: ["ADMIN", "PRINCIPAL", "TEACHER"]
  },
  {
    key: "auditLogs",
    label: "Audit Logs",
    description: "Activity tracking, sensitive changes, security events, and compliance exports.",
    icon: "ShieldCheck",
    roles: leadershipRoles
  },
  {
    key: "backups",
    label: "Backup & Recovery",
    description: "Backup status, recovery points, data retention policy, and restore readiness checks.",
    icon: "DatabaseBackup",
    roles: ["ADMIN"]
  }
];

export const schoolProfile = {
  name: "Lela Secondary School",
  motto: "Discipline, Knowledge, Service",
  colors: {
    green: "#0F7A3A",
    gold: "#D7A928",
    white: "#FFFFFF"
  },
  campuses: ["Main Campus", "Junior Wing", "Science Annex"],
  academicYear: "2026",
  currentTerm: "Term 2"
};

export const dashboardMetrics = [
  { label: "Total Students", value: "1,284", trend: "+6.2% this year", tone: "green" },
  { label: "Attendance Today", value: "94.8%", trend: "+2.1% vs last week", tone: "gold" },
  { label: "Fee Collection", value: "KES 18.6M", trend: "82% of term target", tone: "green" },
  { label: "Academic Mean", value: "7.42", trend: "+0.38 from last CAT", tone: "blue" }
];

export const students = [
  {
    id: "std-1001",
    admissionNumber: "LELA/2026/001",
    studentId: "LS-2026-0001",
    name: "Amani Were",
    className: "Form 4",
    stream: "Green",
    gender: "Male",
    guardian: "Joseph Were",
    guardianPhone: "+254 712 455 901",
    medicalInfo: "Asthma inhaler on file",
    academicHistory: "Transferred from Lela Junior, top 10 in Form 3",
    status: "Active",
    attendanceRate: 96,
    averageScore: 82,
    feeBalance: 12800,
    disciplinePoints: 94
  },
  {
    id: "std-1002",
    admissionNumber: "LELA/2026/002",
    studentId: "LS-2026-0002",
    name: "Neema Akinyi",
    className: "Form 3",
    stream: "Gold",
    gender: "Female",
    guardian: "Rose Akinyi",
    guardianPhone: "+254 733 120 411",
    medicalInfo: "No known allergies",
    academicHistory: "Strong STEM performance",
    status: "Active",
    attendanceRate: 98,
    averageScore: 88,
    feeBalance: 0,
    disciplinePoints: 99
  },
  {
    id: "std-1003",
    admissionNumber: "LELA/2025/119",
    studentId: "LS-2025-0119",
    name: "Brian Mutiso",
    className: "Form 2",
    stream: "White",
    gender: "Male",
    guardian: "Lydia Mutiso",
    guardianPhone: "+254 701 996 203",
    medicalInfo: "Peanut allergy",
    academicHistory: "Needs literacy support plan",
    status: "Active",
    attendanceRate: 89,
    averageScore: 61,
    feeBalance: 23600,
    disciplinePoints: 76
  },
  {
    id: "std-1004",
    admissionNumber: "LELA/2024/087",
    studentId: "LS-2024-0087",
    name: "Faith Njeri",
    className: "Alumni",
    stream: "2025",
    gender: "Female",
    guardian: "Peter Njeri",
    guardianPhone: "+254 722 300 819",
    medicalInfo: "Archived record",
    academicHistory: "KCSE 2025 graduate, university placement pending",
    status: "Alumni",
    attendanceRate: 97,
    averageScore: 79,
    feeBalance: 0,
    disciplinePoints: 92
  }
];

export const teachers = [
  {
    id: "tch-001",
    staffNumber: "LSS/T/001",
    name: "Mary Wanjiku",
    role: "Senior Teacher",
    subjects: ["Mathematics", "Physics"],
    classes: ["Form 4 Green", "Form 3 Gold"],
    attendanceRate: 97,
    leaveDays: 4,
    payrollStatus: "Processed",
    performanceScore: 91
  },
  {
    id: "tch-002",
    staffNumber: "LSS/T/014",
    name: "Samuel Kiptoo",
    role: "Head of Humanities",
    subjects: ["History", "CRE"],
    classes: ["Form 2 White", "Form 1 Green"],
    attendanceRate: 95,
    leaveDays: 2,
    payrollStatus: "Processed",
    performanceScore: 88
  },
  {
    id: "tch-003",
    staffNumber: "LSS/T/022",
    name: "Janet Odhiambo",
    role: "Class Teacher",
    subjects: ["English", "Literature"],
    classes: ["Form 3 White"],
    attendanceRate: 92,
    leaveDays: 7,
    payrollStatus: "Pending approval",
    performanceScore: 84
  }
];

export const attendance = [
  { id: "att-001", date: "2026-05-07", group: "Form 4 Green", present: 42, absent: 2, late: 1, qrEnabled: true },
  { id: "att-002", date: "2026-05-07", group: "Form 3 Gold", present: 39, absent: 1, late: 3, qrEnabled: true },
  { id: "att-003", date: "2026-05-07", group: "Staff", present: 61, absent: 3, late: 4, qrEnabled: false }
];

export const academics = [
  { id: "aca-001", item: "Form 4 CAT 2", className: "Form 4", status: "Published", meanScore: 72, rankingReady: true },
  { id: "aca-002", item: "Form 3 Midterm Exam", className: "Form 3", status: "Marking", meanScore: 68, rankingReady: false },
  { id: "aca-003", item: "Mathematics Assignment", className: "Form 2", status: "Due Friday", meanScore: 0, rankingReady: false }
];

export const timetable = [
  { id: "tt-001", day: "Monday", period: "08:00 - 08:40", className: "Form 4 Green", subject: "Mathematics", teacher: "Mary Wanjiku", room: "Lab 2", conflict: false },
  { id: "tt-002", day: "Monday", period: "08:40 - 09:20", className: "Form 3 Gold", subject: "Physics", teacher: "Mary Wanjiku", room: "Lab 1", conflict: false },
  { id: "tt-003", day: "Tuesday", period: "11:00 - 11:40", className: "Form 2 White", subject: "History", teacher: "Samuel Kiptoo", room: "Room 12", conflict: false }
];

export const finance = [
  { id: "fin-001", student: "Amani Were", term: "Term 2", billed: 52000, paid: 39200, balance: 12800, lastReceipt: "RCT-2026-2881", mpesaReady: true },
  { id: "fin-002", student: "Neema Akinyi", term: "Term 2", billed: 52000, paid: 52000, balance: 0, lastReceipt: "RCT-2026-2910", mpesaReady: true },
  { id: "fin-003", student: "Brian Mutiso", term: "Term 2", billed: 52000, paid: 28400, balance: 23600, lastReceipt: "RCT-2026-2733", mpesaReady: true }
];

export const expenses = [
  { id: "exp-001", category: "Laboratory", description: "Physics practical materials", amount: 84000, status: "Approved" },
  { id: "exp-002", category: "Transport", description: "Bus maintenance", amount: 126000, status: "Pending" },
  { id: "exp-003", category: "Library", description: "Digital journal subscription", amount: 45000, status: "Approved" }
];

export const communications = [
  { id: "com-001", channel: "SMS", audience: "Parents", title: "Fee reminder", status: "Scheduled", sendAt: "2026-05-08 08:30" },
  { id: "com-002", channel: "Email", audience: "Teachers", title: "Exam moderation meeting", status: "Sent", sendAt: "2026-05-06 16:15" },
  { id: "com-003", channel: "Portal", audience: "Students", title: "Science fair registration", status: "Live", sendAt: "2026-05-07 09:00" }
];

export const library = [
  { id: "lib-001", isbn: "978-9966-31-001-0", title: "Secondary Mathematics Book 4", copies: 42, available: 36, fines: 450 },
  { id: "lib-002", isbn: "978-019-839-211-5", title: "Oxford English Grammar", copies: 30, available: 19, fines: 1200 },
  { id: "lib-003", isbn: "DIG-001", title: "Digital Biology Practicals", copies: 1, available: 1, fines: 0 }
];

export const inventory = [
  { id: "ast-001", tag: "LSS-LAB-MIC-014", item: "Microscope", location: "Biology Lab", condition: "Good", custodian: "Janet Odhiambo" },
  { id: "ast-002", tag: "LSS-ICT-LAP-032", item: "Laptop", location: "ICT Lab", condition: "Needs service", custodian: "ICT Office" },
  { id: "ast-003", tag: "LSS-CLS-DES-210", item: "Desk", location: "Form 2 White", condition: "Good", custodian: "Class Teacher" }
];

export const hostel = [
  { id: "hos-001", room: "A-12", capacity: 8, occupied: 7, mealPlan: "Standard", attendance: "Complete" },
  { id: "hos-002", room: "B-04", capacity: 6, occupied: 6, mealPlan: "Medical diet 1", attendance: "1 exception" }
];

export const transport = [
  { id: "bus-001", route: "Lela - Town - Market", driver: "Isaac Mboya", students: 43, feeCollection: 79, status: "Active" },
  { id: "bus-002", route: "Lela - East Estate", driver: "Caroline Atieno", students: 37, feeCollection: 86, status: "Active" }
];

export const aiInsights = [
  {
    id: "ai-001",
    student: "Brian Mutiso",
    risk: "High",
    prediction: "Likely to drop below 55 mean without literacy intervention",
    recommendation: "Assign reading mentor and weekly English formative check"
  },
  {
    id: "ai-002",
    student: "Amani Were",
    risk: "Low",
    prediction: "Projected B+ aggregate with stable Physics trend",
    recommendation: "Add advanced problem set for Mathematics"
  }
];

export const auditLogs = [
  { id: "log-001", actor: "Grace Achieng", action: "Updated fee structure", module: "Finance", timestamp: "2026-05-07 08:12", severity: "Info" },
  { id: "log-002", actor: "Mary Wanjiku", action: "Published CAT marks", module: "Academics", timestamp: "2026-05-06 17:45", severity: "Info" },
  { id: "log-003", actor: "System", action: "Backup completed", module: "Backups", timestamp: "2026-05-07 02:00", severity: "Success" }
];

export const backups = [
  { id: "bkp-001", type: "Database", status: "Healthy", lastRun: "2026-05-07 02:00", retention: "30 days", restorePoint: "Available" },
  { id: "bkp-002", type: "Documents", status: "Healthy", lastRun: "2026-05-07 02:15", retention: "90 days", restorePoint: "Available" }
];

export const notifications = [
  { id: "not-001", title: "Exam moderation starts at 3:30 PM", audience: "Teachers", tone: "gold", unread: true },
  { id: "not-002", title: "M-Pesa payment sync completed", audience: "Accountants", tone: "green", unread: true },
  { id: "not-003", title: "Backup verification passed", audience: "Administrators", tone: "green", unread: false }
];

export const moduleData: Record<DemoModuleKey, unknown[]> = {
  students,
  teachers,
  attendance,
  academics,
  timetable,
  finance,
  portal: [
    { id: "prt-001", student: "Amani Were", progress: "B+ trajectory", attendance: "96%", feeBalance: "KES 12,800", reportCard: "Available", homework: "2 open" },
    { id: "prt-002", student: "Neema Akinyi", progress: "A- trajectory", attendance: "98%", feeBalance: "Cleared", reportCard: "Available", homework: "1 open" }
  ],
  communications,
  library,
  inventory,
  hostel,
  transport,
  aiInsights,
  auditLogs,
  backups
};
