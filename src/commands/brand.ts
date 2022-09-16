import { SlashCommandBuilder } from "@discordjs/builders";
import {
  Client,
  CommandInteraction,
  EmbedFieldData,
  MessageEmbed,
} from "discord.js";
import { getManufacturers } from "../googleConfig";
const members: [name: string, value: string][] = Object(
  require("../../members.json")
);

async function findShips(brand: string) {
  let ships = await getManufacturers();
  let shipString = "";
  let manufacturer = "";
  let ownedShips: any[] = ships.filter((ship) =>
    ship.manufacturer.toLowerCase().includes(brand.toLowerCase())
  );
  manufacturer = ownedShips[0].manufacturer;
  ownedShips.forEach((ship) => {
    shipString += `${ship.model} \n`;
  });

  return { shipString, manufacturer };
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
  await interaction.reply("Searching for ships...");
  const channel = await client.channels.fetch(interaction.channelId);

  if (!channel || channel.type !== "GUILD_TEXT") {
    return;
  }

  const brand = interaction.options.getString("brand")!;
  let memberShips = await findShips(brand);
  if (memberShips.shipString.length == 0) {
    await interaction.editReply(`Could not find ships for: ${brand}`);
    return;
  }
  const embeddedMessage = new MessageEmbed()
    .setTitle(memberShips.manufacturer)
    .setColor("AQUA")
    .setAuthor({ name: "WTTC-Bot" })
    .setTimestamp()
    .setFooter({ text: "WTTC-Bot" })
    .setDescription(
      `The brand ${memberShips.manufacturer} has the following ships: `
    );

  let field: EmbedFieldData = {
    name: memberShips.manufacturer,
    value: memberShips.shipString,
    inline: true,
  };
  embeddedMessage.addFields([field]);

  await interaction.editReply({ embeds: [embeddedMessage] });
}
