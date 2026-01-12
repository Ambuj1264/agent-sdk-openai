import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get("find-weather")
    async getWeather(@Query('city') city: string = 'New York') {
        return this.appService.getWeather(city);

    }

    @Get("agent-manager")
    async getAgentManager(@Query("query") query: string) {
        console.log('Received query:', query);
        return this.appService.getAgent(query);
    }

    @Get("agent-handoff")
    async getAgentHandoff(@Query("query") query: string) {
        return this.appService.gethandoff(query);
    }
    @Get("hello")
    async getHello() {
        return this.appService.getHello();
    }
}
