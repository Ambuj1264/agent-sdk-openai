import { Agent, OutputGuardrail, run } from "@openai/agents";
import { z } from "zod";

/* -------------------------------------------------------
   SQL SAFETY CHECK AGENT (TEXT OUTPUT ONLY)
------------------------------------------------------- */

const sqlGuardrailAgent = new Agent({
    name: "sql-guardrail-agent",
    instructions: `
You are a SQL security validator.

Rules:
- ONLY allow SELECT queries
- Block INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE
- Block multiple statements
- Block comments (-- or /* */)

Respond ONLY in valid JSON:
{
  "isSafe": boolean,
  "reason": string
}
`,
});

/* -------------------------------------------------------
   ZOD SCHEMA FOR GUARDRAIL PARSING
------------------------------------------------------- */

const guardrailResponseSchema = z.object({
    isSafe: z.boolean(),
    reason: z.string(),
});

/* -------------------------------------------------------
   OUTPUT GUARDRAIL
------------------------------------------------------- */

const sqlGuardrail: OutputGuardrail = {
    name: "sql-guardrail",

    execute: async ({ agentOutput }) => {
        // agentOutput is ALWAYS string
        const sqlQuery = String(agentOutput);

        const result: any = await run(
            sqlGuardrailAgent,
            `Validate this SQL query:\n${sqlQuery}`
        );

        let parsed;
        try {
            parsed = guardrailResponseSchema.parse(
                JSON.parse(result?.finalOutput)
            );
        } catch {
            // Fail-safe: block execution if parsing fails
            return {
                tripwireTriggered: true,
                outputInfo: {
                    reason: "Invalid guardrail response format",
                    sqlQuery,
                },
            };
        }

        return {
            tripwireTriggered: !parsed.isSafe,
            outputInfo: {
                reason: parsed.reason,
                sqlQuery,
            },
        };
    },
};

/* -------------------------------------------------------
   SQL GENERATION AGENT
------------------------------------------------------- */

const sqlAgent = new Agent({
    name: "sql-agent",
    instructions: `
You are an expert PostgreSQL agent.

Return ONLY the SQL query.
Do NOT add explanations or formatting.

Database schema:

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`,
    outputGuardrails: [sqlGuardrail],
});

/* -------------------------------------------------------
   RUNNER FUNCTION
------------------------------------------------------- */

async function runSqlAgent(query: string): Promise<string | undefined> {
    const result = await run(
        sqlAgent,
        `Generate a SQL query for this request:\n${query}`
    );

    return result.finalOutput;
}

export { runSqlAgent };
