import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';

// The one-off commands (Layer 9) run with ts-node, like the TypeORM scripts, inside a Nest application
// context so they reuse the services. Exit code 1 on any error.
export async function runCommand(
  name: string,
  command: (app: INestApplicationContext, args: CommandArgs) => Promise<void>,
): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  let exitCode = 0;
  try {
    await command(app, new CommandArgs(process.argv.slice(2)));
  } catch (error) {
    console.error(`${name}: ${error?.message ?? error}`);
    exitCode = 1;
  } finally {
    await app.close();
  }
  process.exit(exitCode);
}

export class CommandArgs {
  constructor(private readonly argv: string[]) {}

  // --dry-run
  has(flag: string): boolean {
    return this.argv.includes(flag);
  }

  // --reason "text" or --reason=text
  option(name: string): string | undefined {
    const inline = this.argv.find((arg) => arg.startsWith(`${name}=`));
    if (inline) return inline.slice(name.length + 1);
    const index = this.argv.indexOf(name);
    return index >= 0 ? this.argv[index + 1] : undefined;
  }

  // The arguments that are neither flags nor option values.
  positional(): string[] {
    const result: string[] = [];
    for (let i = 0; i < this.argv.length; i++) {
      const arg = this.argv[i];
      if (arg.startsWith('--')) {
        if (!arg.includes('=') && OPTIONS_WITH_VALUE.includes(arg)) i++;
        continue;
      }
      result.push(arg);
    }
    return result;
  }
}

const OPTIONS_WITH_VALUE = ['--reason', '--template', '--date', '--batch-size'];
