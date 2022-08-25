import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import config from "./config";
import * as commandModules from "./commands";

type Command = {
  data: unknown;
};
const commands = [];

for (const module of Object.values<Command>(commandModules)) {
  commands.push(module.data);
}

const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

// ...

// for guild-based commands
rest.put(Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);

// for global commands
rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);