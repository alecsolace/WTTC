import { SlashCommandBuilder } from "@discordjs/builders";
import {
  Client,
  CommandInteraction,
  EmbedFieldData,
  MessageEmbed,
} from "discord.js";
import { accessSpreadsheet } from "../googleConfig";
import { getVehicleData, Vehicle } from "../WikiService";

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
  let vehicleQuery = shipData[0].model.replace(" ", "-");
  let vehicleData: any = await getVehicleData(vehicleQuery);

  if (vehicleData === undefined || vehicleData === null) {
    interaction.reply(
      `There's been an error finding the owners of ${shipName}`
    );
    return;
  }

  const embeddedMessage = new MessageEmbed()
    .setColor("#0099ff")
    .setAuthor({
      name: `${vehicleData.manufacturer} (${vehicleData.manufacturerId})`,
    })
    .setTimestamp()
    .setFooter({ text: "WTTC-Bot" })
    .setDescription(vehicleData.description)
    .setTitle(`${vehicleData.manufacturer} ${vehicleData.name}`);

  let owners: string = "";
  shipData.forEach((ship: any) => {
    owners += `${ship.owner}\n`;
  });

  embeddedMessage.addFields([
    {
      name: "Role",
      value: vehicleData.role,
      inline: true,
    },
    {
      name: "Crew",
      value: vehicleData.crew,
      inline: true,
    },
    {
      name: "Cargo",
      value: vehicleData.cargo + " SCU",
      inline: true,
    },
    {
      name: "Length",
      value: vehicleData.length + " m",
      inline: true,
    },
    {
      name: "Height",
      value: vehicleData.height + " m",
      inline: true,
    },
    {
      name: "Beam",
      value: vehicleData.beam + " m",
      inline: true,
    },
    {
      name: "Mass",
      value: vehicleData.mass + " Kg",
      inline: true,
    },
    {
      name: "Combat speed",
      value: vehicleData.combatSpeed + " m/s",
      inline: true,
    },
    {
      name: "Max speed",
      value: vehicleData.maxSpeed + " m/s",
      inline: true,
    },
    {
      name: "After Burner",
      value: vehicleData.afterBurner + " m/s",
      inline: true,
    },
    {
      name: "Pitch",
      value: vehicleData.pitch + " deg/s",
      inline: true,
    },
    {
      name: "Yaw",
      value: vehicleData.yaw + " deg/s",
      inline: true,
    },
    {
      name: "Roll",
      value: vehicleData.roll + " deg/s",
      inline: true,
    },
    {
      name: "Acceleration",
      value:
        "Main: " +
        vehicleData.acceleration.main +
        " m/s^2 \n Retro: " +
        vehicleData.acceleration.retro +
        " m/s^2 \n VTOL: " +
        vehicleData.acceleration.vtol +
        " m/s^2",
      inline: false,
    },
    {
      name: "Pledge price",
      value: "USD $" + vehicleData.pledgePrice,
      inline: true,
    },
    {
      name: "Status",
      value: vehicleData.status,
      inline: true,
    },
    { name: "Owners", value: owners, inline: false },
  ]);

  interaction.reply({ embeds: [embeddedMessage] });
}
