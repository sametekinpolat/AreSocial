import { z } from "zod";

export const CreateCommunitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Community name must be at least 3 characters.")
    .max(21, "Community name must be 21 characters or fewer.")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores are allowed."),
  description: z.string().trim().max(500, "Description is too long.").optional(),
  isNsfw: z
    .preprocess((val) => val === "on" || val === true, z.boolean())
    .default(false),
});

export const AddRuleSchema = z.object({
  communityId: z.string().uuid("Invalid community."),
  communityName: z.string().trim().min(1),
  title: z.string().trim().min(1, "Rule title is required.").max(100, "Title is too long."),
  description: z.string().trim().max(500, "Description is too long.").optional(),
});

export const InviteUserSchema = z.object({
  communityId: z.string().uuid("Invalid community."),
  communityName: z.string().trim().min(1),
  inviteeUsername: z.string().trim().min(1, "Username is required."),
});
