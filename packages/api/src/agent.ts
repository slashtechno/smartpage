  import { ToolLoopAgent, Output } from 'ai';
  import { z } from 'zod';

// Resources:
// https://ai-sdk.dev/docs/agents
// https://ai-sdk.dev/docs/agents/building-agents#structured-output#model-and-system-instructions

const outputSchema = Output.object({
  schema: z.object({
    sentiment: z.enum(['positive', 'neutral', 'negative']),
    summary: z.string(),
    keyPoints: z.array(z.string()),
  }),
})

export async function callAgent(): Promise<z.infer<typeof outputSchema>> {


  const analysisAgent = new ToolLoopAgent({
    model: "openai/gpt-5-nano",
    output:outputSchema
  });

  const { output } = await analysisAgent.generate({
    prompt: 'Analyze customer feedback from the last quarter',
  });
  return output
}


if (import.meta.main) {
  // only runs when this file is executed directly
  // not when imported as a module
  console.log(await callAgent())
}
