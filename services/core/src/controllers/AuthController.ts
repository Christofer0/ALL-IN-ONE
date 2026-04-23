import { Request, Response } from "express";
import { AuthService } from "../services/AuthService.js";

export const AuthController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const { token, user } = await AuthService.login(email, password);

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ message: "Login successful", user });
    } catch (err) {
      const message = (err as Error).message;
      res.status(message === "Invalid credentials" ? 401 : 500).json({ error: message });
    }
  },

  async logout(req: Request, res: Response) {
    res.clearCookie("auth_token");
    res.json({ message: "Logged out successfully" });
  },

  async me(req: Request, res: Response) {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ authenticated: false });
    res.json({ authenticated: true });
  },
};
