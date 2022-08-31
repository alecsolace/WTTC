import { SlashCommandBuilder } from "@discordjs/builders";
import {
  Client,
  CommandInteraction,
  EmbedFieldData,
  MessageEmbed,
} from "discord.js";
import { accessSpreadsheet, getManufacturers } from "../googleConfig";
const members: [name: string, value: string][] = Object(
  require("../../members.json")
);

async function findShips(brand: string) {
  let ships = await getManufacturers();
  let ownedShips: any[] = [];

  ships.forEach((ship) => {
    if (ship.manufacturer.toLowerCase().includes(brand.toLowerCase())) {
      ownedShips.push(ship);
    }
  });
  return ownedShips;
}

export const data = new SlashCommandBuilder()
  .setName("brand")
  .setDescription("Returns a list of ships based on the selected brand")
  .addStringOption(
    (option) =>
      option
        .setName("brand")
        .setDescription("Enter then name of the brand. ex: Origin")
        .setRequired(true)
    //.addChoices(members)
  );

export async function execute(interaction: CommandInteraction, client: Client) {
  if (!interaction?.channelId) {
    return;
  }

  const channel = await client.channels.fetch(interaction.channelId);

  if (!channel || channel.type !== "GUILD_TEXT") {
    return;
  }

  const brand = interaction.options.getString("brand")!;
  let memberShips = await findShips(brand);
  if (memberShips.length == 0) {
    interaction.reply(`Could not find ships for: ${brand}`);
    return;
  }
  const embeddedMessage = new MessageEmbed()
    .setTitle(memberShips[0].manufacturer)
    .setColor("AQUA")
    .setAuthor("WTTC-Bot")
    .setTimestamp()
    .setFooter("WTTC-Bot")
    .setDescription(
      `The brand ${memberShips[0].manufacturer} has the following ships: `
    );

  memberShips = memberShips.sort((a, b) => (a.model > b.model ? 1 : -1));
  memberShips.forEach((ship) => {
    let field: EmbedFieldData = {
      name: ship.manufacturer,
      value: ship.model,
      inline: true,
    };
    embeddedMessage.addFields([field]);
  });

  const { user } = interaction;

  interaction.reply({ embeds: [embeddedMessage] });
}
