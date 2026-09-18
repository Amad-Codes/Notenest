import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../config/logger";
import { AIRequestInput } from "./ai.validation";

type AIAction = AIRequestInput["action"];

const ACTION_INSTRUCTIONS: Record<AIAction, string> = {
  summarize: "Summarize the following note in 2-3 concise sentences. Return only the summary.",
  grammar:
    "Correct any grammar and spelling mistakes in the following text, preserving its meaning and tone. Return only the corrected text.",
  improve:
    "Improve the clarity, flow, and word choice of the following text while preserving its meaning. Return only the improved text.",
  actionItems:
    "Extract a bullet list of clear, actionable tasks from the following note. Return only the bullet list, one item per line starting with '- '.",
  rewrite: "Rewrite the following text in a professional, polished tone. Return only the rewritten text.",
};

/**
 * Calls the OpenAI Chat Completions API directly via fetch (no SDK
 * dependency needed). Only invoked when OPENAI_API_KEY is set.
 */
async function runOpenAI(action: AIAction, text: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          { role: "system", content: ACTION_INSTRUCTIONS[action] },
          { role: "user", content: text },
        ],
      }),
    });
  } catch (err) {
    logger.error("OpenAI request failed to send", err);
    throw ApiError.internal("Could not reach the AI provider. Please try again.");
  }

  if (!response.ok) {
    logger.error(`OpenAI request failed with status ${response.status}`);
    throw ApiError.internal("The AI provider returned an error. Please try again.");
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const result = data.choices?.[0]?.message?.content?.trim();

  if (!result) {
    throw ApiError.internal("The AI provider returned an empty response.");
  }
  return result;
}

/**
 * A dependency-free, deterministic fallback so the AI Assistant feature is
 * fully usable and testable without any API key configured. This is
 * intentionally simple text manipulation, not real language understanding.
 *
 * To connect a real provider, set OPENAI_API_KEY — no other code changes
 * are required. To swap providers entirely (Anthropic, a local model,
 * etc.), replace `runOpenAI` with an equivalent function and update the
 * branch in `aiService.process` below; the controller/routes/frontend
 * never need to know which provider is active.
 */
function runLocalFallback(action: AIAction, text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  const firstSentence = sentences[0] ?? clean;

  switch (action) {
    case "summarize":
      return sentences.slice(0, 2).join(" ") || "(Nothing to summarize yet.)";

    case "grammar":
      // Placeholder cleanup only (whitespace + capitalization) - not a
      // real grammar checker. Swap in OPENAI_API_KEY for the real thing.
      return clean.replace(/\bi\b/g, "I").replace(/(^\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());

    case "improve":
      return sentences.length > 1 ? `${firstSentence} Additionally, ${sentences.slice(1).join(" ")}` : clean;

    case "actionItems":
      return (
        sentences
          .filter((s) => s.trim().length > 3)
          .map((s) => `- ${s.trim().replace(/[.!?]$/, "")}`)
          .join("\n") || "- (No clear action items found)"
      );

    case "rewrite":
      return `Please note: ${clean}`;

    default:
      return clean;
  }
}

export const aiService = {
  async process(action: AIAction, text: string): Promise<{ result: string; provider: "openai" | "local" }> {
    if (env.OPENAI_API_KEY) {
      return { result: await runOpenAI(action, text), provider: "openai" };
    }
    return { result: runLocalFallback(action, text), provider: "local" };
  },
};
