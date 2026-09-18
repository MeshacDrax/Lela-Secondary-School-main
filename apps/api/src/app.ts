import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { authRouter } from "./routes/auth";
import { modulesRouter } from "./routes/modules";
import { errorHandler, notFound } from "./middleware/error";

const app = express();

const allowedOrigins = env.WEB_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
  .filter(Boolean)
  .map((url) => `https://${url}`);

function isAllowedOrigin(origin: string | undefined) {
  return (
    !origin ||
    allowedOrigins.includes(origin) ||
    vercelOrigins.includes(origin) ||
    (env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
  );
}

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    status: "ok",
    service: "lela-secondary-school-api",
    timestamp: new Date().toISOString()
  });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

app.use("/api/auth", authRouter);
app.use("/api", modulesRouter);
app.use(notFound);
app.use(errorHandler);

export { app };
export default app;