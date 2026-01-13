import { Agent, run, InputGuardrail, InputGuardrailTripwireTriggered } from "@openai/agents";
import { z } from "zod";

const mathInputAgent = new Agent({
    name: "math-input-agent",
    instructions: "You are an agent that validates if the input is a valid mathematical query,  and there are some rules : - The question has to be stricityly a maths question only  - Reject any other kind of request  ",


    outputType: z.object({
        isValidMathQuery: z.string().describe("Returns 'true' if the input is a valid mathematical query, otherwise 'false'."),
        reason: z.string().describe("Explanation for the decision.")
    })
})
/**
 * Math input guardrail
 */
const mathInputGuardrail: InputGuardrail = {
    name: "math-input-guardrail",
    execute: async ({ input }) => {
        const result = await run(
            mathInputAgent,
            `Is the following input a valid mathematical query? Answer with "true" or "false". Input: ${input}`
        );
        console.log(result?.finalOutput?.isValidMathQuery)
        return {
            tripwireTriggered: !(result?.finalOutput?.isValidMathQuery === "true"),
            outputInfo: {
                reason: "Input accepted as valid math query",
                input,
            },
        };
    },
};

/**
 * Math agent
 */
const mathAgent = new Agent({
    name: "math-agent",
    instructions: "You are an expert math agent that helps solve mathematical problems.",
    inputGuardrails: [mathInputGuardrail],
});

/**
 * Run math agent
 */
async function runMathAgent(query: string): Promise<string | undefined> {
    try {
        const result = await run(
            mathAgent,
            `Solve the following mathematical problem: ${query}`
        );

        return result.finalOutput;
    } catch (e) {
        if (e instanceof InputGuardrailTripwireTriggered) {
            throw `Input rejected: ${e.message}`;
        }
        throw e;
    }

}

export { runMathAgent };
