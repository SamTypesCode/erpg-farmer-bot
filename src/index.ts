import path from "path";
import chalk from "chalk";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { Client } from "discord.js-selfbot-v13";

(async () => {
  const tokens: string[] = (
    await fs.readFile(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "../config/tokens.txt"
      ),
      "utf-8"
    )
  )
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const token of tokens) {
    const client = new Client();

    client.on("ready", () => {
      console.log(
        `${chalk.greenBright("[SUCCESS]")} ${client.user?.username} is ready!`
      );
    });

    try {
      await client.login(token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("An invalid token was provided")) {
          console.log(
            `${chalk.redBright("[ERROR]")} invalid token, login failed.`
          );
        } else {
          console.log(
            `${chalk.redBright("[ERROR]")} login failed, error: ${err}`
          );
        }
      }
    }
  }
})();
