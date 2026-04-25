import { z } from "zod";

export const LoginSchema = z.object({
  identifier: z.string().min(1, { message: "Email or username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const RegisterSchema = z.object({
  email: z.string().email({ message: "Invalid email structure" }),
  username: z.string().min(2, { message: "Username must be at least 2 characters long" }).max(30, { message: "Username cannot exceed 30 characters" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, { message: "Password is too long" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const OnboardingSchema = z.object({
  email: z.string().email({ message: "Invalid email structure" }),
  username: z.string().min(2, { message: "Username must be at least 2 characters long" }).max(30, { message: "Username cannot exceed 30 characters" }),
  userId: z.string().min(1, { message: "User ID is required" }),
});
