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

export const eventSchema = EventSafeCreateSchema.omit({
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
  notes: z.string().nullable().describe("Any additional details about the event — description, ticket prices, age restrictions, website info, etc. Null if nothing extra is visible."),
  url: z.string().nullable().describe("Event website or ticket purchase URL if visible in the image. Null if not present."),
  recurrence: z
    .object({
      frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).describe("How often the event repeats."),
      interval: z.number().int().describe("Repeat every N units, e.g. 2 for 'every 2 weeks'. Use 1 if not specified."),
      end_date: z.string().datetime({ offset: true }).nullable().describe("ISO 8601 date when recurrence ends. Null if ongoing or unknown."),
      days_of_week: z.array(z.number().int().min(0).max(6)).nullable().describe("Days of week for weekly recurrence. 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat. e.g. [3,4] for Wed+Thu. Null if not applicable."),
    })
    .nullable()
    .describe("Only set if the image explicitly states the event repeats. Null for one-time events."),
  user_facing_context: z.string().describe("Human-readable description of what was visible in the image, shown to the user as confirmation."),
});

// Top-level object wrapping the array — structured output models are more reliable with an object root
const outputSchema = z.object({
  events: z.array(eventSchema).describe("All events found in the image. One-time concerts, classes, or calendar entries each become a separate item."),
});

const agentOutput = Output.object({ schema: outputSchema });

export async function callAgent(
  image: ArrayBuffer,
  timezone: z.infer<ReturnType<typeof zodTimezone>>,
): Promise<z.infer<typeof outputSchema>> {
  const analysisAgent = new ToolLoopAgent({
    model: "openai/gpt-5-nano",
    output: agentOutput,
    instructions:
      "Your job is to analyze images uploaded by the user and extract calendar event details. Extract every distinct event visible — a paper calendar may have many.",
    callOptionsSchema: z.object({ timezone: zodTimezone() }),
    prepareCall: ({ options, ...settings }) => ({
      ...settings,
      instructions:
        settings.instructions +
        `\nUser context:\n  - Timezone: ${options.timezone}\n  - Current time: ${new Date().toISOString()}`,
    }),
  });

  const { output } = await analysisAgent.generate({
    prompt: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract every event visible in this image. For each: name, date, start/end time, location, notes (prices, age limits, descriptions), URL, and recurrence only if explicitly stated (e.g. 'every Saturday'). Use today's date to fill in missing date parts. Leave unrecoverable fields null.",
          },
          { type: "image", image: image },
        ],
      },
    ],
    options: { timezone: timezone },
  });
  return output;
}
