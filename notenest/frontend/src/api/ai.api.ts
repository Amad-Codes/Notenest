import { api } from "./axios";
import { ApiSuccess } from "@/types";

export const AI_ACTIONS = ["summarize", "grammar", "improve", "actionItems", "rewrite"] as const;
export type AIAction = (typeof AI_ACTIONS)[number];

export const AI_ACTION_LABELS: Record<AIAction, string> = {
  summarize: "Summarize",
  grammar: "Fix grammar",
  improve: "Improve writing",
  actionItems: "Extract action items",
  rewrite: "Rewrite professionally",
};

interface AIResponse {
  result: string;
  provider: "openai" | "local";
}

export const aiApi = {
  async run(action: AIAction, text: string) {
    const res = await api.post<ApiSuccess<AIResponse>>("/ai", { action, text });
    return res.data.data;
  },
};
