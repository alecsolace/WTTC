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
  let foundShips = ships.filter((ship) =>
    ship.model.toLowerCase().includes(shipName.toLowerCase())
  );
  return foundShips;
}

async function findVariants(shipName: string, shipVariant: string) {
  let ships = await accessSpreadsheet();
  let shipFullName = shipName + " " + shipVariant;
  let foundShips = ships.filter(
    (ship) => ship.model.toLowerCase() === shipFullName.toLowerCase()
  );
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

  if (shipData === undefined || shipData === null || shipData.length === 0) {
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
      `The ${shipData[0].manufacturer} ${shipData[0].model} is owned by the following members`
    );

  shipData.forEach((ship: any) => {
    let field: EmbedFieldData = {
      name: "Owner",
      value: ship.owner,
      inline: true,
    };
    embeddedMessage.addFields([field]);
  });

  embeddedMessage.setTitle(`${shipData[0].manufacturer} ${shipData[0].model}`);

  interaction.reply({ embeds: [embeddedMessage] });
}
