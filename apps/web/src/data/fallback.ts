export const fallbackDashboard = {
  school: {
    name: "Lela Secondary School",
    motto: "Discipline, Knowledge, Service",
    academicYear: "2026",
    currentTerm: "Term 2"
  },
  metrics: [
    { label: "Total Students", value: "1,284", trend: "+6.2% this year", tone: "green" },
    { label: "Attendance Today", value: "94.8%", trend: "+2.1% vs last week", tone: "gold" },
    { label: "Fee Collection", value: "KES 18.6M", trend: "82% of term target", tone: "green" },
    { label: "Academic Mean", value: "7.42", trend: "+0.38 from last CAT", tone: "blue" }
  ],
  quickActions: [
    "Register student",
    "Record attendance",
    "Generate report card",
    "Send announcement",
    "Export finance report",
    "Run backup check"
  ],
  charts: {
    attendance: [
      { label: "Mon", value: 93 },
      { label: "Tue", value: 95 },
      { label: "Wed", value: 91 },
      { label: "Thu", value: 96 },
      { label: "Fri", value: 94 }
    ],
    performance: [
      { label: "Form 1", value: 68 },
      { label: "Form 2", value: 64 },
      { label: "Form 3", value: 71 },
      { label: "Form 4", value: 76 }
    ]
  },
  modules: [
    { key: "students", label: "Students", icon: "GraduationCap" },
    { key: "teachers", label: "Teachers & Staff", icon: "UsersRound" },
    { key: "attendance", label: "Attendance", icon: "CalendarCheck" },
    { key: "academics", label: "Academics", icon: "BookOpenCheck" },
    { key: "finance", label: "Finance", icon: "ReceiptText" },
    { key: "communications", label: "Communication", icon: "MessagesSquare" }
  ],
  notifications: [
    { id: "not-001", title: "Exam moderation starts at 3:30 PM", tone: "gold", unread: true },
    { id: "not-002", title: "M-Pesa payment sync completed", tone: "green", unread: true }
  ],
  aiHighlights: [
    {
      id: "ai-001",
      student: "Brian Mutiso",
      risk: "High",
      prediction: "Likely to drop below 55 mean without literacy intervention",
      recommendation: "Assign reading mentor and weekly English formative check"
    }
  ]
};

export const fallbackRecords: Record<string, Array<Record<string, unknown>>> = {
  students: [
    {
      id: "std-1001",
      studentId: "LS-2026-0001",
      name: "Amani Were",
      className: "Form 4",
      stream: "Green",
      guardian: "Joseph Were",
      attendanceRate: 96,
      averageScore: 82,
      feeBalance: 12800
    },
    {
      id: "std-1002",
      studentId: "LS-2026-0002",
      name: "Neema Akinyi",
      className: "Form 3",
      stream: "Gold",
      guardian: "Rose Akinyi",
      attendanceRate: 98,
      averageScore: 88,
      feeBalance: 0
    }
  ],
  finance: [
    { id: "fin-001", student: "Amani Were", billed: 52000, paid: 39200, balance: 12800, lastReceipt: "RCT-2026-2881" },
    { id: "fin-002", student: "Neema Akinyi", billed: 52000, paid: 52000, balance: 0, lastReceipt: "RCT-2026-2910" }
  ]
};
