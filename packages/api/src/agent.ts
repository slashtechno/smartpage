import { ToolLoopAgent, Output } from "ai";
import { z } from "zod";
import { eventProcessSchema, EventSafeCreateSchema } from "./types/events";
import { zodTimezone } from "./types/misc";

// Resources:
// https://ai-sdk.dev/docs/agents
// https://ai-sdk.dev/docs/agents/building-agents#structured-output#model-and-system-instructions
// https://ai-sdk.dev/docs/agents/configuring-call-options
// https://ai-sdk.dev/docs/foundations/prompts#image-parts
// https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data#property-descriptions

const outputSchema = EventSafeCreateSchema.omit({
  starts_at: true,
  ends_at: true,
  location: true,
}).extend({
  starts_at: z
    .string()
    .datetime({ offset: true })
    .describe("Full ISO 8601 datetime with timezone offset, e.g. 2026-06-13T10:00:00-05:00. Always infer a complete date using any partial info visible (day number, time) combined with the current date from user context. If a day number like '13' is visible but month/year are not, use the current month and year. Never output year 0000 or a placeholder — always resolve to a real date."),
  ends_at: z
    .string()
    .datetime({ offset: true })
    .nullable()
    .describe("Full ISO 8601 datetime with timezone offset. Null if no end time is visible. Same date inference rules as starts_at."),
  location: z.string().nullable().describe("Physical location or address of the event. Null if not visible."),
  user_facing_context: z.string().describe("Human-readable description of what was visible in the image, shown to the user as confirmation."),
});

const agentOutput = Output.object({
  schema: outputSchema,
});
// "infer the Zod type from whatever zodTimezone() returns."
export async function callAgent(
  image: ArrayBuffer,
  timezone: z.infer<ReturnType<typeof zodTimezone>>,
): Promise<z.infer<typeof outputSchema>> {
  const analysisAgent = new ToolLoopAgent({
    model: "openai/gpt-5-nano",
    output: agentOutput,
    instructions:
      "Your job is to analyze data uploaded by the user and extract key event details so it can be created in the user's calendar.",
    callOptionsSchema: z.object({
      timezone: zodTimezone(),
    }),
    prepareCall: ({ options, ...settings }) => ({
      ...settings,
      instructions:
        settings.instructions +
        `\nUser context:
  - Timezone: ${options.timezone}
  - Current time: ${new Date().toISOString()}`,
    }),
  });

  const { output } = await analysisAgent.generate({
    prompt: [
      {
        role: "user",
        content: [
          { type: "text", text: "Extract all event details from this image — name, date, start time, end time, and location. Use the current date from your context to fill in any missing date parts (e.g. if only a day number is visible, infer the month and year from today). If a field is truly unrecoverable, leave it null. Describe what you saw in user_facing_context." },
          {
            type: "image",
            image: image,
          },
        ],
      },
    ],
    // prompt: "Hey! Do you want to go to the concert in Chicago next saturday at noon?",
    options: { timezone: timezone },
  });
  return output;
}
z;

if (import.meta.main) {
  // only runs when this file is executed directly
  // not when imported as a module

  // Local file
  const file = Bun.file("test-event.png");

  // Each run seems to take $0.0008
  console.log(await callAgent(await file.arrayBuffer(), "America/Chicago"));
}
