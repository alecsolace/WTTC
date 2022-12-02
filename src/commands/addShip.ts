import {
  AutocompleteInteraction,
  ChannelType,
  Client,
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { insertShip } from "../googleConfig";
const ships: any = Object(require("../../ships.json"));

//Autocomplete function
export async function autocomplete(
  interaction: AutocompleteInteraction,
  client: Client
) {
  const focusedValue = interaction.options.getFocused();
  if (interaction.options.get("manufacturer")?.focused) {
    const choices = ships;
    const options = Object.keys(choices);
    const filtered = options.filter((choice) =>
      choice.startsWith(focusedValue)
    );
    await interaction.respond(
      filtered.map((choice) => ({
        name: choice,
        value: choice,
      }))
    );
  }
  if (interaction.options.get("model")?.focused) {
    const manufacturer: string = interaction.options.get("manufacturer")
      ?.value! as string;
    const choices = ships;
    const filtered = choices[manufacturer].filter((choice: any) =>
      choice.model.startsWith(focusedValue)
    );
    await interaction.respond(
      filtered.map((choice: any) => ({
        name: choice.model,
        value: choice.model,
      }))
    );
  }
}

//Execute function
export async function execute(interaction: CommandInteraction, client: Client) {
  if (!interaction?.channelId) {
    return;
  }
  await interaction.reply("Adding ship to the database...");
  const channel = await client.channels.fetch(interaction.channelId);
  if (!channel || channel.type !== ChannelType.GuildText) {
    return;
  }
  const guildMember = interaction.member as GuildMember;
  const owner =
    guildMember.nickname?.split(" ")[0] || guildMember.user.username;
  const manufacturer = interaction.options.get("manufacturer")
    ?.value! as string;
  let shipName = (interaction.options.get("name")?.value! as string) || "";
  const comments =
    (interaction.options.get("comments")?.value! as string) || "";
  const prefix = (interaction.options.get("tcs")?.value! as boolean) || false;
  const model = interaction.options.get("model")?.value! as string;
  if (prefix) shipName = `TCS ${shipName}`;
  const ship: {
    owner: string;
    manufacturer: string;
    model: string;
    shipName: string;
    comments: string;
    prefix: boolean;
  } = {
    owner,
    manufacturer,
    model,
    shipName,
    comments,
    prefix,
  };
  await insertShip(ship);

  await interaction.editReply(
    shipName !== ""
      ? `The following ship has been added to ${owner}: ${manufacturer} ${model}. The ship name is ${shipName}.`
      : `The following ship has been added to ${owner}: ${manufacturer} ${model}.`
  );
}

export const data = new SlashCommandBuilder()
  .setName("addship")
  .setDescription("Add a ship to the spreadhseet")
  .addStringOption((option) =>
    option
      .setName("manufacturer")
      .setDescription("Enter the manufacturer of the ship. ex: Origin")
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption((option) =>
    option
      .setName("model")
      .setDescription("Enter the model of the ship. ex: 890 Jump")
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption((option) =>
    option
      .setName("name")
      .setDescription("Enter the name of the ship.")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("comments")
      .setDescription("Enter any comments you want to leave for this ship.")
      .setRequired(false)
  )
  .addBooleanOption((option) =>
    option
      .setName("tcs")
      .setDescription("Add the TCS Prefix to the name of the ship.")
      .setRequired(false)
  );
