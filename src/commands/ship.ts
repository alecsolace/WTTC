import { SlashCommandBuilder } from "@discordjs/builders";
import {
  Client,
  CommandInteraction,
  EmbedField,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import { accessSpreadsheet, getShipValues } from "../googleConfig";
import { getVehicleData, Vehicle } from "../WikiService";

async function findOwners(shipName: string) {
  let ships = await accessSpreadsheet();
  let foundShips = ships.filter((ship) =>
    `${ship.manufacturer.toLowerCase()} ${ship.model.toLowerCase()}`.includes(
      shipName.toLowerCase()
    )
  );
  return foundShips;
}
async function getFields(vehicleData: Vehicle) {
  let ships = await getShipValues();
  let price = ships.find((ship) => ship.model === vehicleData.name)?.price;
  return [
    {
      name: "Role",
      value: vehicleData.role || "not found",
      inline: true,
    },
    {
      name: "Crew",
      value: vehicleData.crew || "not found",
      inline: true,
    },
    {
      name: "Cargo",
      value: vehicleData.cargo + " SCU" || "not found",
      inline: true,
    },
    {
      name: "Length",
      value: vehicleData.length + " m" || "not found",
      inline: true,
    },
    {
      name: "Height",
      value: vehicleData.height + " m" || "not found",
      inline: true,
    },
    {
      name: "Beam",
      value: vehicleData.beam + " m" || "not found",
      inline: true,
    },
    {
      name: "Mass",
      value: vehicleData.mass + " Kg" || "not found",
      inline: true,
    },
    {
      name: "Combat speed",
      value: vehicleData.combatSpeed + " m/s" || "not found",
      inline: true,
    },
    {
      name: "Max speed",
      value: vehicleData.maxSpeed + " m/s" || "not found",
      inline: true,
    },
    {
      name: "After Burner",
      value: vehicleData.afterBurner + " m/s" || "not found",
      inline: true,
    },
    {
      name: "Pitch",
      value: vehicleData.pitch + " deg/s" || "not found",
      inline: true,
    },
    {
      name: "Yaw",
      value: vehicleData.yaw + " deg/s" || "not found",
      inline: true,
    },
    {
      name: "Roll",
      value: vehicleData.roll + " deg/s" || "not found",
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
      value: "USD $" + vehicleData.pledgePrice || "Not found",
      inline: true,
    },
    {
      name: "Ingame price",
      value: price + " aUEC" || "Not found",
      inline: true,
    },
    {
      name: "Status",
      value: vehicleData.status || "Not found",
      inline: true,
    },
  ];
}
async function findVariants(shipName: string, shipVariant: string) {
  let ships = await accessSpreadsheet();
  let shipFullName = `${shipName} ${shipVariant}`;
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

  if (!channel || channel.type !== ChannelType.GuildText) {
    return;
  }
  await interaction.reply("Delivering ship information...");
  const shipName = interaction.options.get("ship")!.value! as string;
  const shipVariant = interaction.options.get("variant")?.value as string;

  if (shipVariant != null && shipVariant !== undefined) {
    let shipsOwners = await findVariants(shipName, shipVariant);
    if (shipsOwners.length === 0) {
      await interaction.editReply("No ships found");
      return;
    }
    let vehicleQuery = shipsOwners[0].model.replace(" ", "-");
    let vehicleData: any = await getVehicleData(vehicleQuery);
    let owners: string = "";
    shipsOwners.forEach((ship) => {
      owners += ship.owner + "\n";
    });
    let fields: EmbedField[] = await getFields(vehicleData);
    fields.push({ name: "Owners", value: owners, inline: false });
    const embeddedMessage = new EmbedBuilder()
      .setColor("#0099ff")
      .setAuthor({
        name: `${vehicleData.manufacturer} (${vehicleData.manufacturerId})`,
      })
      .setTimestamp()
      .setFooter({ text: "WTTC-Bot" })
      .setDescription(vehicleData.description)
      .setTitle(`${vehicleData.manufacturer} ${vehicleData.name}`)
      .addFields(fields)
      .setURL(
        `https://starcitizen.tools/${vehicleData!.name!.replace(" ", "_")}`
      );
    await interaction.editReply({ embeds: [embeddedMessage] });
    return;
  }
  let shipData = await findOwners(shipName);

  if (shipData === undefined || shipData === null || shipData.length === 0) {
    let vehicleQuery = shipName.replace(" ", "-");
    let vehicleData: any = await getVehicleData(vehicleQuery);
    if (vehicleData === undefined || vehicleData === null) {
      await interaction.editReply(
        `There's been an error finding the owners of ${shipName}`
      );
      return;
    }

    let fields: EmbedField[] = await getFields(vehicleData);
    const embeddedMessage = new EmbedBuilder()
      .setColor("#0099ff")
      .setAuthor({
        name: `${vehicleData.manufacturer} (${vehicleData.manufacturerId})`,
      })
      .setTimestamp()
      .setFooter({ text: "WTTC-Bot" })
      .setDescription(vehicleData.description || "No description found")
      .setTitle(`${vehicleData.manufacturer} ${vehicleData.name}`)
      .setURL(
        `https://starcitizen.tools/${vehicleData!.name!.replace(" ", "_")}`
      );
    fields.push({
      name: "Owners",
      value: "No members own this ship",
      inline: false,
    });
    embeddedMessage.addFields(fields);
    await interaction.editReply({ embeds: [embeddedMessage] });
    return;
  }
  let vehicleQuery = shipData[0].model.replace(" ", "-");
  let vehicleData: Vehicle = await getVehicleData(vehicleQuery);

  if (vehicleData === undefined || vehicleData === null) {
    await interaction.editReply(
      `There's been an error fetching the information from the API`
    );
    return;
  }
  const embeddedMessage = new EmbedBuilder()
    .setColor("#0099ff")
    .setAuthor({
      name: `${vehicleData.manufacturer} (${vehicleData.manufacturerId})`,
    })
    .setTimestamp()
    .setFooter({ text: "WTTC-Bot" })
    .setDescription(vehicleData.description || "No description found")
    .setTitle(`${vehicleData.manufacturer} ${vehicleData.name}`)
    .setURL(
      `https://starcitizen.tools/${vehicleData!.name!.replace(" ", "_")}`
    );
  let owners: string = "";
  shipData.forEach((ship: any) => {
    owners += `${ship.owner}\n`;
  });

  let fields = await getFields(vehicleData);
  fields.push({
    name: `Members that own this ship (${shipData.length} ships)`,
    value: owners,
    inline: false,
  });
  embeddedMessage.addFields(fields);

  await interaction.editReply({ embeds: [embeddedMessage] });
}
