import { Router } from "express";
import { nanoid } from "nanoid";
import type { Role } from "@lela/shared";
import {
  auditLogs,
  dashboardMetrics,
  expenses,
  finance,
  moduleData,
  moduleDefinitions,
  notifications,
  schoolProfile,
  students,
  type DemoModuleKey
} from "../data/demoData";
import { authorize, requireAuth, verifyToken } from "../middleware/auth";
import { ApiError } from "../middleware/error";

const router = Router();

const leadership: Role[] = ["ADMIN", "PRINCIPAL"];
const staff: Role[] = ["ADMIN", "PRINCIPAL", "TEACHER", "ACCOUNTANT", "LIBRARIAN"];

function canAccess(role: Role, moduleKey: DemoModuleKey) {
  const module = moduleDefinitions.find((item) => item.key === moduleKey);
  return Boolean(module?.roles.includes(role));
}

function visibleModules(role: Role) {
  return moduleDefinitions.filter((module) => module.roles.includes(role));
}

function filterRecords(records: unknown[], query: string | undefined) {
  if (!query) {
    return records;
  }

  const normalized = query.toLowerCase();
  return records.filter((record) => JSON.stringify(record).toLowerCase().includes(normalized));
}

function csvEscape(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(records: unknown[]) {
  if (!records.length) {
    return "";
  }

  const rows = records as Record<string, unknown>[];
  const headers = Object.keys(rows[0]);
  return [headers.map(csvEscape).join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
}

function createSimplePdf(title: string, records: unknown[]) {
  const lines = [
    "Lela Secondary School",
    title,
    `Generated: ${new Date().toISOString()}`,
    "",
    ...records.slice(0, 18).map((record, index) => `${index + 1}. ${JSON.stringify(record).slice(0, 160)}`)
  ];
  const content = lines.join("\\n").replace(/[()]/g, "");
  const stream = `BT /F1 11 Tf 50 780 Td ${content
    .split("\\n")
    .map((line, index) => `${index === 0 ? "" : "0 -16 Td "}(${line}) Tj`)
    .join(" ")} ET`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`
  ];
  const body = objects.join("\n");
  return Buffer.from(`%PDF-1.4\n${body}\ntrailer << /Root 1 0 R >>\n%%EOF`);
}

router.get("/school", (_req, res) => {
  res.json({ data: schoolProfile });
});

router.get("/dashboard", requireAuth, (req, res) => {
  const modules = visibleModules(req.user!.role);

  res.json({
    data: {
      school: schoolProfile,
      metrics: dashboardMetrics,
      modules,
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
      notifications,
      aiHighlights: moduleData.aiInsights
    }
  });
});

router.get("/modules", requireAuth, (req, res) => {
  res.json({ data: visibleModules(req.user!.role) });
});

router.get("/search", requireAuth, (req, res, next) => {
  try {
    const q = String(req.query.q ?? "").trim();
    const role = req.user!.role;
    const results = Object.entries(moduleData)
      .filter(([key]) => canAccess(role, key as DemoModuleKey))
      .flatMap(([moduleKey, records]) =>
        filterRecords(records, q).slice(0, 8).map((record) => ({
          module: moduleKey,
          record
        }))
      );

    res.json({ data: results, meta: { query: q, count: results.length } });
  } catch (error) {
    next(error);
  }
});

router.post("/communications", requireAuth, authorize(staff), (req, res, next) => {
  try {
    const { audience, title, message } = req.body;
    if (!audience || !title || !message) {
      throw new ApiError(400, "Audience, title, and message are required");
    }

    const announcement = {
      id: `com-${nanoid(8)}`,
      channel: "Portal",
      audience,
      title,
      message,
      status: "Sent",
      sendAt: new Date().toISOString()
    };
    moduleData.communications.unshift(announcement);
    notifications.unshift({ id: `not-${nanoid(8)}`, title, audience, tone: "green", unread: true });
    res.status(201).json({ data: announcement });
  } catch (error) {
    next(error);
  }
});

router.post("/backups/check", requireAuth, authorize(["ADMIN"]), (_req, res) => {
  const result = {
    id: `bkp-${nanoid(8)}`,
    type: "Verification",
    status: "Healthy",
    lastRun: new Date().toISOString(),
    retention: "30 days",
    restorePoint: "Available"
  };
  moduleData.backups.unshift(result);
  auditLogs.unshift({
    id: `log-${nanoid(8)}`,
    actor: "System",
    action: "Backup verification completed",
    module: "Backups",
    timestamp: new Date().toISOString(),
    severity: "Success"
  });
  res.status(201).json({ data: result });
});

router.get("/reports/:module", requireAuth, (req, res, next) => {
  try {
    const moduleKey = req.params.module as DemoModuleKey;
    const format = String(req.query.format ?? "json");

    if (!moduleData[moduleKey]) {
      throw new ApiError(404, "Unknown report module");
    }

    if (!canAccess(req.user!.role, moduleKey)) {
      throw new ApiError(403, "You do not have permission to export this report");
    }

    const records = filterRecords(moduleData[moduleKey], String(req.query.q ?? ""));
    const filename = `${moduleKey}-report`;

    if (format === "excel") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
      return res.send(toCsv(records));
    }

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.pdf"`);
      return res.send(createSimplePdf(`${moduleKey.toUpperCase()} Report`, records));
    }

    return res.json({
      data: records,
      meta: {
        module: moduleKey,
        generatedAt: new Date().toISOString(),
        count: records.length
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/reports/report-card", requireAuth, (req, res, next) => {
  try {
    const student = String(req.query.student ?? "Student");
    if (!canAccess(req.user!.role, "academics")) {
      throw new ApiError(403, "You do not have permission to generate report cards");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${student.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-report-card.pdf"`);
    return res.send(createSimplePdf(`${student} Report Card`, moduleData.academics));
  } catch (error) {
    next(error);
  }
});

router.get("/finance/expenses", requireAuth, authorize(["ADMIN", "PRINCIPAL", "ACCOUNTANT"]), (_req, res) => {
  res.json({ data: expenses });
});

router.post("/finance/payments/mpesa/initiate", requireAuth, authorize(["ADMIN", "ACCOUNTANT", "PARENT"]), (req, res) => {
  const { phone, amount, studentId } = req.body;

  res.status(202).json({
    data: {
      checkoutRequestId: `demo-${nanoid(10)}`,
      studentId,
      phone,
      amount,
      provider: "M-Pesa",
      status: "Integration-ready demo request accepted"
    }
  });
});

router.get("/realtime", (req, res, next) => {
  try {
    const token = String(req.query.token ?? "");
    if (!token) {
      throw new ApiError(401, "Realtime stream requires token query parameter");
    }

    verifyToken(token);

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    });

    res.write(`event: notification\ndata: ${JSON.stringify(notifications[0])}\n\n`);
    const interval = setInterval(() => {
      res.write(`event: heartbeat\ndata: ${JSON.stringify({ at: new Date().toISOString() })}\n\n`);
    }, 15000);

    req.on("close", () => clearInterval(interval));
  } catch (error) {
    next(error);
  }
});

router.get("/:module", requireAuth, (req, res, next) => {
  try {
    const moduleKey = req.params.module as DemoModuleKey;
    const records = moduleData[moduleKey];

    if (!records) {
      throw new ApiError(404, "Unknown module");
    }

    if (!canAccess(req.user!.role, moduleKey)) {
      throw new ApiError(403, "You do not have permission to access this module");
    }

    res.json({
      data: filterRecords(records, String(req.query.q ?? "")),
      meta: {
        module: moduleKey,
        count: records.length
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/students", requireAuth, authorize(leadership), (req, res) => {
  const id = `std-${nanoid(8)}`;
  const student = {
    id,
    admissionNumber: req.body.admissionNumber ?? `LELA/2026/${students.length + 1}`,
    studentId: req.body.studentId ?? `LS-2026-${String(students.length + 1).padStart(4, "0")}`,
    status: "Active",
    attendanceRate: 100,
    averageScore: 0,
    feeBalance: 0,
    disciplinePoints: 100,
    ...req.body
  };

  students.push(student);
  auditLogs.unshift({
    id: `log-${nanoid(8)}`,
    actor: req.user!.name,
    action: `Registered student ${student.name}`,
    module: "Students",
    timestamp: new Date().toISOString(),
    severity: "Info"
  });

  res.status(201).json({ data: student });
});

router.put("/students/:id", requireAuth, authorize(leadership), (req, res, next) => {
  try {
    const student = students.find((item) => item.id === req.params.id);
    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    Object.assign(student, req.body);
    auditLogs.unshift({
      id: `log-${nanoid(8)}`,
      actor: req.user!.name,
      action: `Updated student ${student.name}`,
      module: "Students",
      timestamp: new Date().toISOString(),
      severity: "Info"
    });

    res.json({ data: student });
  } catch (error) {
    next(error);
  }
});

router.post("/attendance", requireAuth, authorize(staff), (req, res) => {
  const summary = {
    id: `att-${nanoid(8)}`,
    date: new Date().toISOString().slice(0, 10),
    qrEnabled: Boolean(req.body.qrEnabled),
    ...req.body
  };

  (moduleData.attendance as unknown[]).push(summary);
  res.status(201).json({ data: summary });
});

router.get("/finance/summary/balances", requireAuth, authorize(["ADMIN", "PRINCIPAL", "ACCOUNTANT"]), (_req, res) => {
  const totalOutstanding = finance.reduce((sum, item) => sum + item.balance, 0);
  const totalBilled = finance.reduce((sum, item) => sum + item.billed, 0);
  const totalPaid = finance.reduce((sum, item) => sum + item.paid, 0);

  res.json({
    data: {
      totalOutstanding,
      totalBilled,
      totalPaid,
      collectionRate: Math.round((totalPaid / totalBilled) * 100)
    }
  });
});

export { router as modulesRouter };
