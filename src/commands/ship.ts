import { SlashCommandBuilder } from "@discordjs/builders";
import fetch from "node-fetch";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import { accessSpreadsheet } from "../googleConfig";

async function findOwners(shipName: string) {
  let ships = await accessSpreadsheet();
  let foundShips: string[] = [];
  let manufacturer: string = "";
  let model: string = "";
  ships.forEach((ship) => {
    if (
      ship.model.toLowerCase().includes(shipName.toLowerCase()) &&
      !foundShips.includes(ship.owner)
    ) {
      model = ship.model;
      manufacturer = ship.manufacturer;
      foundShips.push(ship.owner);
    }
  });
  return {
    model: model,
    manufacturer: manufacturer,
    foundShips: foundShips,
  };
}
export const data = new SlashCommandBuilder()
  .setName("ship")
  .setDescription("Returns information on the selected ship")
  .addStringOption((option) =>
    option
      .setName("ship")
      .setDescription('Enter the name of the ship. ex: "Merchantman"')
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction, client: Client) {
  if (!interaction?.channelId) {
    return;
  }

  const channel = await client.channels.fetch(interaction.channelId);

  if (!channel || channel.type !== "GUILD_TEXT") {
    return;
  }

  const shipName = interaction.options.getString("ship")!;
  let shipData = await findOwners(shipName);

  const embeddedMessage = new MessageEmbed()
    .setColor("#0099ff")
    .setAuthor("WTTC-Bot")
    .setTimestamp()
    .setFooter("WTTC-Bot")
    .setDescription(
      `The ${shipData.manufacturer} ${shipData.model} is owned by the following members`
    );

  shipData.foundShips.forEach((owner: any) => {
    embeddedMessage.addField("Owner", owner, true);
  });

  const { user } = interaction;

  embeddedMessage.setTitle(`${shipData.manufacturer} ${shipData.model}`);

  interaction.reply({ embeds: [embeddedMessage] });
}
