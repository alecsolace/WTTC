import {
  AutocompleteInteraction,
  ChannelType,
  Client,
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { deleteShip } from "../googleConfig";
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
  await interaction.reply("Removing the ship from the spreadSheet...");
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
  const model = interaction.options.get("model")?.value! as string;
  const ship: {
    owner: string;
    manufacturer: string;
    model: string;
    shipName: string;
  } = {
    owner,
    manufacturer,
    model,
    shipName,
  };
  deleteShip(ship).then((res) => {
    if (!res) {
      interaction.editReply("Ship not found in the database");
      return;
    }
  });

  await interaction.editReply(
    shipName !== ""
      ? `The ship "${shipName}" has been removed from ${owner}: ${manufacturer} ${model}.`
      : `The following ship has been removed from ${owner}: ${manufacturer} ${model}.`
  );
}

export const data = new SlashCommandBuilder()
  .setName("removeship")
  .setDescription("Remove a ship from the spreadhseet")
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
  );
