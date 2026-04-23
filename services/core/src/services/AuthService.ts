import { UserRepository } from "../repositories/UserRepository.js";
import { LogRepository } from "../repositories/LogRepository.js";
import { comparePassword, generateToken } from "../utils/auth.js";

export const AuthService = {
  async login(email: string, password: string) {
    const user = await UserRepository.findByEmail(email);

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken({ id: user.id, email: user.email });

    // Log the login
    await LogRepository.create({
      action: "LOGIN",
      entityType: "USER",
      entityId: user.id,
      details: { email: user.email },
    });

    return {
      token,
      user: { id: user.id, email: user.email },
    };
  },
};
