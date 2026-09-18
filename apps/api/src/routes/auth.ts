import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import type { AuthUser } from "@lela/shared";
import { demoUsers } from "../data/demoData";
import { requireAuth, signToken } from "../middleware/auth";
import { ApiError } from "../middleware/error";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const users = demoUsers.map((user) => ({
  ...user,
  passwordHash: bcrypt.hashSync(user.password, 10)
}));

function toAuthUser(user: (typeof users)[number]): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarInitials: user.avatarInitials
  };
}

router.post("/login", async (req, res, next) => {
  try {
    const credentials = loginSchema.parse(req.body);
    const user = users.find((candidate) => candidate.email.toLowerCase() === credentials.email.toLowerCase());

    if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
      throw new ApiError(401, "Invalid email or password");
    }

    const authUser = toAuthUser(user);

    res.json({
      data: {
        user: authUser,
        token: signToken(authUser)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ data: req.user });
});

router.get("/demo-users", (_req, res) => {
  res.json({
    data: demoUsers.map(({ password, ...user }) => user),
    meta: {
      note: "Passwords are documented in README.md for local demo usage only."
    }
  });
});

export { router as authRouter };
