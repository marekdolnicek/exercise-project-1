import { streamText, smoothStream } from "ai";
import { azure, DEFAULT_MODEL } from "@/lib/utils/azure";
import { agentTools } from "@/lib/agent/tools";
import { SYSTEM_PROMPT } from "@/lib/agent/system-prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: azure.responses(DEFAULT_MODEL),
      messages,
      system: SYSTEM_PROMPT,
      tools: agentTools,
      providerOptions: {
        openai: {
          reasoningEffort: "low",
          reasoningSummary: "detailed",
        },
        azure: {
          reasoningEffort: "low",
          reasoningSummary: "detailed",
        },
      },
      experimental_transform: smoothStream(),
    });

    return result.toTextStreamResponse({
      headers: {
        "Transfer-Encoding": "chunked",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
