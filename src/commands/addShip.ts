import {
  AutocompleteInteraction,
  ChannelType,
  Client,
  CommandInteraction,
  GuildMember,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { insertShip, Ship } from "../googleConfig";
const ships: any = Object(require("../../ships.json"));

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
  );
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
    console.log(manufacturer);
    const choices = ships;
    console.log(ships[manufacturer]);
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
  const model = interaction.options.get("model")?.value! as string;
  const ship: Ship = { owner, manufacturer, model };
  // const resp = await insertShip(ship);
  console.log(ship);
  await interaction.editReply(
    `The following ship has been added to ${owner}: ${manufacturer} ${model}`
  );
}
