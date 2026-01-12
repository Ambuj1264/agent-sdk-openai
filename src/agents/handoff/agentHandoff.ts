import { Agent, run, tool } from '@openai/agents';
import fs from 'node:fs/promises';
import { z } from 'zod';
import { RECOMMENDED_PROMPT_PREFIX } from '@openai/agents-core/extensions';

// refund agent
const fetchAvailablePlan = tool({
    name: 'fetch available plans',
    description: 'Fetch the available internet broadband plans for the user',
    parameters: z.object({}),
    execute: async () => {
        console.log('Fetching available plans...');
        // Simulate fetching plans from a database or API
        return [
            { name: 'Basic Plan', speed: '50 Mbps', price: '$30/month' },
            { name: 'Standard Plan', speed: '100 Mbps', price: '$50/month' },
            { name: 'Premium Plan', speed: '200 Mbps', price: '$70/month' },
        ];
    }
})

const proccessRefund = tool({
    name: 'process refund',
    description: 'Process a refund for the customer',
    parameters: z.object({
        customerId: z.string().describe("The ID of the customer"),
        reason: z.string().describe("The reason for the refund")
    }),
    execute: async ({ customerId, reason }: { customerId: string, reason: string }) => {
        console.log(`Processing refund for Customer ID: ${customerId}, Reason: ${reason}`);
        // Simulate refund processing logic
        await fs.appendFile('./refunds.txt', `Refund processed for Customer ID: ${customerId}, Reason: ${reason}\n`);
        return `Refund processed for Customer ID: ${customerId}`;
    }
})

const refundAgent = new Agent({
    name: 'refund agent',
    instructions: " you are expert in issuing refunds to the customer.",
    tools: [proccessRefund],

})


const salesAgent = new Agent({
    name: 'sales agent',
    instructions: "you are an expert sales agent for  an internet broadband company. talk to the user and help them with what they need.",
    tools: [fetchAvailablePlan, refundAgent.asTool(
        { toolName: 'initiate refund', toolDescription: 'Initiate a refund process for a customer' }
    )],
})


const receptionAgent = new Agent({
    name: 'reception agent',
    instructions: RECOMMENDED_PROMPT_PREFIX + " you are the customer facing agent expert in understanding what the customer needs route then or handoff them to right agent.",
    handoffDescription: "you have two agent is availabe :    1. sales agent : you can help the customer with sales related queries like fetching available plans , process refund etc. 2. refund agent : you can help the customer with refund related queries only.",
    handoffs: [salesAgent, refundAgent],
})
export const RecipientAgent = async (query: string) => {
    const result = await run(receptionAgent, query);
    return result.finalOutput;
}