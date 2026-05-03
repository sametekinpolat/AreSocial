import { z } from "zod";

export const CreateEventSchema = z
  .object({
    communityId: z.string().uuid("Invalid community."),
    communityName: z.string().trim().min(1),
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters.")
      .max(120, "Title is too long."),
    description: z.string().trim().max(1000, "Description is too long.").optional(),
    startTime: z.string().min(1, "Start time is required."),
    endTime: z.string().min(1, "End time is required."),
  })
  .superRefine((data, ctx) => {
    const now = new Date();
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (isNaN(start.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid start time.", path: ["startTime"] });
      return;
    }
    if (isNaN(end.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid end time.", path: ["endTime"] });
      return;
    }
    if (start <= now) {
      ctx.addIssue({
        code: "custom",
        message: "Start time must be in the future.",
        path: ["startTime"],
      });
    }
    if (end <= start) {
      ctx.addIssue({
        code: "custom",
        message: "End time must be after start time.",
        path: ["endTime"],
      });
    }
  });
