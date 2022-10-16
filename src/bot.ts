import { Client, InteractionType } from "discord.js";
import config from "./config";
import * as commandModules from "./commands";
import { getManufacturers, getMembers, getShips } from "./googleConfig";
import fs from "fs";

const commands = Object(commandModules);

export const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

client.once("ready", async () => {
  console.log("Initialazing...");
  let members = await getMembers();
  let manufacturers = await getManufacturers();
  fs.writeFile("members.json", JSON.stringify(members), "utf8", (err) => {
    if (err) console.log("Error: ", err);
    console.log('The file "members.json" has been saved.');
  });
  fs.writeFile("ships.json", JSON.stringify(manufacturers), "utf8", (err) => {
    if (err) console.log("Error: ", err);
    console.log('The file "manufacturer.json" has been saved.');
  });
  console.log("------------------------------------");
  console.log("Bot ready");
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
    const { commandName } = interaction;
    const command = commands[commandName];

    if (!command) return;

    try {
      await command.autocomplete(interaction, client);
    } catch (error) {
      console.error(error);
    }
    return;
  }
  if (!interaction.isCommand()) {
    return;
  }

  const { commandName } = interaction;

  commands[commandName].execute(interaction, client);
});

client.login(config.DISCORD_TOKEN);
