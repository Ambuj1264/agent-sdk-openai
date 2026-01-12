import { Agent, run } from '@openai/agents';
import { weatherTool } from './weather.tool';
import { z } from 'zod';

const GetWeatherResultSchema = z.object({
    city: z.string().describe("The city to get the weather report for"),
    degrees: z.string().describe("The temperature in degrees"),
    condition: z.string().describe("The weather condition"),
})

const agent = new Agent({
    name: 'weather agent',
    instructions: 'You are an expert weather agent that helps find weather reports.',
    tools: [weatherTool],
    outputType: GetWeatherResultSchema
});

async function main(query: string = "") {
    const result = await run(
        agent,
        `Provide me the weather report for ${query}`,
    );
    // console.log('Weather Agent Result:', result);
    return result.finalOutput;
}

export { main };