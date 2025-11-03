import path from "path";
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
      console.log(`${client.user?.username} is ready!`);
    });

    client.login(token);
  }
})();
