import { z } from "zod";

export const todoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .optional(),

  dueDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),

  tags: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const tags = val.split(",").map((tag) => tag.trim());
        return tags.length <= 5;
      },
      { message: "You can enter up to 5 tags only" }
    ),

  priority: z.enum(["low", "medium", "high"]),
});

export const todoUpdateSchema = todoSchema.extend({
  id: z.string(),
});
