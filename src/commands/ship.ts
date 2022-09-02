import { SlashCommandBuilder } from "@discordjs/builders";
import {
  Client,
  CommandInteraction,
  EmbedFieldData,
  MessageEmbed,
} from "discord.js";
import { accessSpreadsheet } from "../googleConfig";

async function findOwners(shipName: string) {
  let ships = await accessSpreadsheet();
  let foundShips: string[] = [];
  let manufacturer: string = "";
  let model: string = shipName;
  for (let i = 0; i < ships.length; i++) {
    if (
      ships[i].model.toLowerCase().includes(shipName.toLowerCase()) &&
      !foundShips.includes(ships[i].owner) &&
      ships[i].model.toLowerCase().includes(model)
    ) {
      model = ships[i].model;
      manufacturer = ships[i].manufacturer;
      foundShips.push(ships[i].owner);
    }
  }
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

  if (
    shipData === undefined ||
    shipData === null ||
    shipData.foundShips.length === 0
  ) {
    interaction.reply(
      `There's been an error finding the owners of ${shipName}`
    );
    return;
  }

  const embeddedMessage = new MessageEmbed()
    .setColor("#0099ff")
    .setAuthor({ name: "WTTC-Bot" })
    .setTimestamp()
    .setFooter({ text: "WTTC-Bot" })
    .setDescription(
      `The ${shipData.manufacturer} ${shipData.model} is owned by the following members`
    );

  shipData.foundShips.forEach((owner: any) => {
    let field: EmbedFieldData = {
      name: "Owner",
      value: owner,
      inline: true,
    };
    embeddedMessage.addFields([field]);
  });

  embeddedMessage.setTitle(`${shipData.manufacturer} ${shipData.model}`);

  interaction.reply({ embeds: [embeddedMessage] });
}
