import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  await repl(AppModule);
}
bootstrap();
