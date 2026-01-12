import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = process.env.PORT || 3000;
    console.log('✓ Environment loaded. OPENAI_API_KEY available:', !!process.env.OPENAI_API_KEY);
    await app.listen(port);
    console.log(`✓ Listening on ${port}`);
}

bootstrap();
