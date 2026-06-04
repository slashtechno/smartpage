import { ToolLoopAgent, Output } from "ai";
import { z } from "zod";
import { eventProcessSchema, EventSafeCreateSchema } from "./types/events";
import { zodTimezone } from "./types/misc";

// Resources:
// https://ai-sdk.dev/docs/agents
// https://ai-sdk.dev/docs/agents/building-agents#structured-output#model-and-system-instructions
// https://ai-sdk.dev/docs/agents/configuring-call-options
// https://ai-sdk.dev/docs/foundations/prompts#image-parts

const outputSchema = EventSafeCreateSchema.omit({
  starts_at: true,
  ends_at: true,
  location: true,
}).extend({
  starts_at: z.string(),
  ends_at: z.string().nullable(),
  location: z.string().nullable(),
  user_facing_context: z.string(),
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
          { type: "text", text: "Describe the image in detail." },
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
