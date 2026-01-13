import { Injectable } from '@nestjs/common';
import { main } from './agents/tool';
import { agentmanger } from './agents/multiAgent/agent_manager';
import { RecipientAgent } from './agents/handoff/agentHandoff';
import { runMathAgent } from './agents/guard/input.guard';
import { runSqlAgent } from './agents/guard/output.gaurd';

@Injectable()
export class AppService {
    async getWeather(city: string = 'New York') {
        const result = await main(city);
        return { message: result };
    }

    async getHello() {
        return { message: 'Hello World!' };
    }

    async getAgent(query: string = '') {
        const result = await agentmanger(query);
        return { message: result };
    }
    async gethandoff(query: string = '') {
        const result = await RecipientAgent(query);
        return { message: result };
    }

    async getMathAgent(query: string = '') {

        const result = await runMathAgent(query);
        return { message: result };
    }

    async getSqlAgent(query: string = '') {
        const result = await runSqlAgent(query);
        return { message: result };
    }
}
