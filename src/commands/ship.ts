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

async function findVariants(shipName: string, shipVariant: string) {
  let ships = await accessSpreadsheet();
  let shipFullName = shipName + " " + shipVariant;
  let foundShips = ships.filter((ship) => ship.model === shipFullName);
  console.log(foundShips);
  return foundShips;
}
export const data = new SlashCommandBuilder()
  .setName("ship")
  .setDescription("Returns information on the selected ship")
  .addStringOption((option) =>
    option
      .setName("ship")
      .setDescription('Enter the name of the ship. ex: "600i"')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("variant")
      .setDescription('Enter then variant name. Ex: "Explorer"')
      .setRequired(false)
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
  const shipVariant = interaction.options.getString("variant");

  if (shipVariant != null && shipVariant !== undefined) {
    let shipsOwners = await findVariants(shipName, shipVariant);

    const embeddedMessage = new MessageEmbed()
      .setColor("#0099ff")
      .setAuthor({ name: "WTTC-Bot" })
      .setTimestamp()
      .setFooter({ text: "WTTC-Bot" })
      .setDescription(
        `The ${shipsOwners[0].manufacturer} ${shipsOwners[0].model} is owned by the following members`
      );

    shipsOwners.forEach((ship: any) => {
      let field: EmbedFieldData = {
        name: "Owner",
        value: ship.owner,
        inline: true,
      };
      embeddedMessage.addFields([field]);
    });

    embeddedMessage.setTitle(
      `${shipsOwners[0].manufacturer} ${shipsOwners[0].model}`
    );

    interaction.reply({ embeds: [embeddedMessage] });
    return;
  }
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
