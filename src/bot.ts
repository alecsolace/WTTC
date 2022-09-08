import { Client } from "discord.js";
import config from "./config";
import * as commandModules from "./commands";
import { getFleetValues, getMembers, getShips } from "./googleConfig";
import fs from "fs";
import { getVehicleData } from "./WikiService";

const commands = Object(commandModules);

export const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
});

client.once("ready", async () => {
  let members = await getMembers();
  let ships = await getShips();
  fs.writeFile("members.json", JSON.stringify(members), "utf8", (err) => {
    if (err) {
      console.log("Error: ", err);
    }
  });
  fs.writeFile("ships.json", JSON.stringify(ships), "utf8", (err) => {
    if (err) {
      console.log("Error: ", err);
    }
  });
  console.log("Bot ready");
  getFleetValues();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const { commandName } = interaction;
  commands[commandName].execute(interaction, client);
});

client.login(config.DISCORD_TOKEN);
