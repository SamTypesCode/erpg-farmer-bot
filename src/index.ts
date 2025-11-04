import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import chalk from "chalk";
import { Client, Message, TextChannel } from "discord.js-selfbot-v13";

async function loadTokens(): Promise<string[]> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const filePath = path.join(__dirname, "../config/tokens.txt");

  try {
    const file = await fs.readFile(filePath, "utf-8");
    return file
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (err) {
    console.error(`${chalk.redBright("[ERROR]")} Failed to load tokens:`, err);
    return [];
  }
}

interface ConfigType {
  command_prefix: string;
  erpg_bot_id: string;
}

import rawConfig from "../config/config.json" with { type: "json" };
const config: ConfigType = rawConfig;

async function login(token: string): Promise<void> {
  const client = new Client();
  let activeChannelId: string | null = null;

  console.log(`${chalk.green("[LOGIN]")} Attempting login with token`);

  client.once("ready", () => {
    const username = client.user?.username ?? "Unknown";
    console.log(`[${username}] ${chalk.greenBright("[READY]")} Logged in`);
    console.log(`[${username}] ${chalk.cyan("[INFO]")} Listening for ${config.command_prefix}start`);
  });

  client.on("messageCreate", async (message: Message) => {
    if (message.author.id !== client.user?.id) return;
    const username = client.user?.username ?? "Unknown";

    if (message.content.startsWith(`${config.command_prefix}start`)) {
      activeChannelId = message.channel.id;
      const channelName =
        message.channel instanceof TextChannel
          ? `#${message.channel.name}`
          : "DM channel";

      console.log(`[${username}] ${chalk.magentaBright("[ACTION]")} Started farming in ${channelName}`);

      try {
        await message.delete();
        console.log(`[${username}] ${chalk.magenta("[ACTION]")} Deleted the trigger command`);
      } catch {
        console.log(`[${username}] ${chalk.yellowBright("[WARN]")} Failed to delete the trigger message`);
      }

      return;
    }

    if (
      activeChannelId &&
      message.channel.id === activeChannelId &&
      message.author.id === config.erpg_bot_id
    ) {
      console.log(`[${username}] ${chalk.cyan("[INFO]")} Message from EpicRPG bot detected`);
    }
  });

  try {
    await client.login(token);
  } catch (err) {
    const msg =
      err instanceof Error && err.message.includes("invalid token")
        ? "Invalid token"
        : `Login failed: ${err}`;
    console.log(`${chalk.redBright("[ERROR]")} ${msg}`);
  }
}

async function main(): Promise<void> {
  const tokens = await loadTokens();

  if (tokens.length === 0) {
    console.log(`${chalk.yellowBright("[WARN]")} No tokens found in config/tokens.txt`);
    return;
  }

  console.log(`${chalk.cyan("[INFO]")} Logging into ${tokens.length} token(s)`);

  for (const token of tokens) {
    await login(token);
  }
}

main().catch((err) => {
  console.error(`${chalk.red("[FATAL]")} Unexpected error:`, err);
});
