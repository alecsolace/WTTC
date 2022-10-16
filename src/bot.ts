import { Client } from "discord.js";
import config from "./config";
import * as commandModules from "./commands";
import { getMembers } from "./googleConfig";
import fs from "fs";

const commands = Object(commandModules);

export const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

client.once("ready", async () => {
  let members = await getMembers();
  fs.writeFile("members.json", JSON.stringify(members), "utf8", (err) => {
    if (err) {
      console.log("Error: ", err);
    }
    console.log('The file "members.json" has been saved.');
  });
  console.log("Bot ready");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const { commandName } = interaction;
  commands[commandName].execute(interaction, client);
});

client.login(config.DISCORD_TOKEN);
