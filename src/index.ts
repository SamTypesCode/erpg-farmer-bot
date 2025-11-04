import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

async function load_tokens(): Promise<string[]> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const filePath = path.join(__dirname, "../config/tokens.txt");
  const file = await fs.readFile(filePath, "utf-8");
  return file
    .split(/\r?\n/)
    .map((line: string) => line.trim())
    .filter(Boolean);
}

import chalk from "chalk";
import { Client } from "discord.js-selfbot-v13";

async function login(token: string): Promise<void> {
  const client = new Client();

  client.once("ready", () => {
    console.log(
      `${chalk.greenBright("[READY]")} ${client.user?.username} logged in`
    );
  });

  await client.login(token).catch((err: unknown) => {
    const message =
      err instanceof Error && err.message.includes("invalid token")
        ? "Invalid token"
        : `Login failed: ${err}`;
    console.log(`${chalk.redBright("[ERROR]")} ${message}`);
  });
}

async function main() {
  const tokens = await load_tokens();

  if (tokens.length === 0) {
    console.log(
      `${chalk.yellowBright("[WARN]")} No tokens found in config/tokens.txt`
    );
    return;
  }

  console.log(
    `${chalk.cyanBright(`[INFO]`)} Logging into ${tokens.length} token(s)`
  );

  for (const token of tokens) {
    await login(token);
  }
}

main().catch((err) => {
  console.error(`${chalk.redBright("[FATAL]")} Unexpected error: ${err}`);
});
