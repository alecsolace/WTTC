import {
  ChannelType,
  Client,
  CommandInteraction,
  GuildMember,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { insertShip, Ship } from "../googleConfig";
export const menu = new SelectMenuBuilder()
  .setCustomId("shipSelect")
  .addOptions([
    new SelectMenuOptionBuilder().setLabel("Ship").setValue("ship"),
  ]);

export const data = new SlashCommandBuilder()
  .setName("addship")
  .setDescription("Add a ship to the spreadhseet")
  .addStringOption((option) =>
    option
      .setName("manufacturer")
      .setDescription("Enter the manufacturer of the ship. ex: Origin")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("model")
      .setDescription("Enter the model of the ship. ex: 890 Jump")
      .setRequired(true)
  );

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
