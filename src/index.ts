import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { Client, Message } from "discord.js-selfbot-v13";
import { start_farming } from "./farmer.js";
import { get_time, type ConfigType } from "./utils/lib.js";
import chalk from "chalk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config: ConfigType = (
  await import("../config/config.json", { assert: { type: "json" } })
).default;

async function loadTokens(): Promise<string[]> {
  const file = path.join(__dirname, "../config/tokens.txt");
  try {
    return (await fs.readFile(file, "utf-8"))
      .split(/\r?\n/)
      .map((t) => t.trim())
      .filter(Boolean);
  } catch (err) {
    console.log(
      `${chalk.redBright(
        "[ERROR]"
      )} - ${get_time()}: Failed to load tokens: ${err}`
    );
    return [];
  }
}

async function login(token: string): Promise<void> {
  const client = new Client();

  client.once("ready", () => {
    const username = client.user?.username ?? "Unknown";
    console.log(
      `${chalk.greenBright("[READY]")} - ${get_time()}: ${chalk.redBright(
        username
      )}: Logged in`
    );
    console.log(
      `${chalk.cyan("[EVENT]")} - ${get_time()}: ${chalk.redBright(
        username
      )}: Listening for ${config.command_prefix}start`
    );
  });

  client.on("messageCreate", async (msg: Message) => {
    const self = client.user;
    if (!self || msg.author.id !== self.id) return;
    const username = self.username;
    const prefix = config.command_prefix;

    if (!msg.content.startsWith(`${prefix}start`)) return;

    start_farming(client, msg.channel, config);

    try {
      await msg.delete();
      console.log(
        `${chalk.magenta("[DOING]")} - ${get_time()}: ${chalk.redBright(
          username
        )}: Deleted trigger command`
      );
    } catch {
      console.log(
        `${chalk.yellowBright("[ALERT]")} - ${get_time()}: ${chalk.redBright(
          username
        )}: Failed to delete trigger message`
      );
    }
  });

  try {
    await client.login(token);
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("invalid token")
        ? "Invalid token"
        : `Login failed: ${err}`;
    console.log(`${chalk.redBright("[ERROR]")} - ${get_time()}: ${message}`);
  }
}

async function main(): Promise<void> {
  const tokens = await loadTokens();
  if (!tokens.length) {
    console.log(
      `${chalk.yellowBright(
        "[ALERT]"
      )} - ${get_time()}: No tokens found in config/tokens.txt`
    );
    return;
  }

  console.log(
    `${chalk.cyan("[EVENT]")} - ${get_time()}: Logging into ${
      tokens.length
    } token(s)`
  );

  for (const token of tokens) await login(token);
}

main().catch((err) => {
  console.error(
    `${chalk.red("[FATAL]")} - ${get_time()}: Unexpected error: ${err}`
  );
});
