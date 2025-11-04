import { Client, TextChannel, Message } from "discord.js-selfbot-v13";
import { type ConfigType, get_time } from "./utils/lib.js";
import chalk from "chalk";

export async function start_farming(
  client: Client,
  channel: TextChannel | Message["channel"],
  _config: ConfigType
): Promise<void> {
  const username = client.user?.username ?? "Unknown";
  const channelName =
    channel instanceof TextChannel ? `#${channel.name}` : "DM channel";

  console.log(
    `${chalk.magentaBright("[DOING]")} - ${get_time()}: ${chalk.redBright(
      username
    )}: Started farming in ${channelName}`
  );
}
