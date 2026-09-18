import { z } from "zod";

export const AI_ACTIONS = ["summarize", "grammar", "improve", "actionItems", "rewrite"] as const;

export const aiRequestSchema = z.object({
  body: z.object({
    action: z.enum(AI_ACTIONS),
    text: z.string().trim().min(1, "There's no text to process yet").max(20000),
  }),
});

export type AIRequestInput = z.infer<typeof aiRequestSchema>["body"];
