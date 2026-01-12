import { tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";


const weatherTool = tool({
    name: "get weather",
    description: "Get the weather report for a given city",
    parameters: z.object({
        city: z.string().describe("The city to get the weather report for")
    }),
    execute: async ({ city }: { city: string }) => {
        try {
            console.log(`Fetching weather for city: ${city}`);
            //  call the weather public API with the axios library
            const url = `https://wttr.in/${(city?.toLowerCase())}?format=%C+%t`;
            const response = await axios.get(url);
            const data = response.data;
            return data;
        } catch (error) {
            return `Unable to retrieve weather for ${city}. Please try again.`;
        }
    }
});



export { weatherTool };
