import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.js";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }

  (req as any).user = decoded;
  next();
};
