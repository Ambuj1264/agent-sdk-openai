import { Injectable } from '@nestjs/common';
import { main } from './agents/tool';
import { agentmanger } from './agents/multiAgent/agent_manager';

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
}
