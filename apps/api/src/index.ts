import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { authRouter } from "./routes/auth";
import { modulesRouter } from "./routes/modules";
import { errorHandler, notFound } from "./middleware/error";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "lela-secondary-school-api",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRouter);
app.use("/api", modulesRouter);
app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Lela Secondary School API running on http://localhost:${env.PORT}`);
});
