import * as discordJs from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import * as fs from "fs";
import { getManufacturers } from "../googleConfig";
const members: [name: string, value: string][] = Object(
  require("../../members.json")
);

async function findShips(brand: string) {
  let ships = await getManufacturers();
  let shipString = "";
  let manufacturer = "";
  let ownedShips: any[] = ships.filter((ship: any) =>
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

export async function execute(
  interaction: discordJs.CommandInteraction,
  client: discordJs.Client
) {
  if (!interaction?.channelId) {
    return;
  }
  await interaction.reply("Searching for ships...");
  const channel = await client.channels.fetch(interaction.channelId);

  if (!channel || channel.type !== discordJs.ChannelType.GuildText) {
    return;
  }

  const brand = interaction.options.get("brand")!.value! as string;
  let memberShips = await findShips(brand);
  if (memberShips.shipString.length == 0) {
    await interaction.editReply(`Could not find ships for: ${brand}`);
    return;
  }
  const embeddedMessage = new discordJs.EmbedBuilder()
    .setTitle(memberShips.manufacturer)
    .setColor("Aqua")
    .setAuthor({ name: "WTTC-Bot" })
    .setTimestamp()
    .setFooter({ text: "WTTC-Bot" })
    .setDescription(
      `The brand ${memberShips.manufacturer} has the following ships: `
    );

  let field: discordJs.EmbedField = {
    name: memberShips.manufacturer,
    value: memberShips.shipString,
    inline: true,
  };
  embeddedMessage.addFields([field]);

  await interaction.editReply({ embeds: [embeddedMessage] });
}

//discord autocomplete function in typescript?

export async function autocomplete(
  interaction: discordJs.CommandInteraction,
  client: discordJs.Client
) {
  if (!interaction?.channelId) {
    return;
  }
  const channel = await client.channels.fetch(interaction.channelId);

  if (!channel || channel.type !== discordJs.ChannelType.GuildText) {
    return;
  }

  const brand = interaction.options.get("brand")!.value! as string;
  let memberShips: any = fs.readFile(
    "ships.json",
    "utf8",
    async (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      let ships = JSON.parse(data);
      let ownedShips: any[] = ships.filter((ship: any) =>
        ship.manufacturer.toLowerCase().includes(brand.toLowerCase())
      );

      if (memberShips.shipString.length == 0) {
        await interaction.editReply(`Could not find ships for: ${brand}`);
        return;
      }
      const embeddedMessage = new discordJs.EmbedBuilder()
        .setTitle(memberShips.manufacturer)
        .setColor("Aqua")
        .setAuthor({ name: "WTTC-Bot" })
        .setTimestamp()
        .setFooter({ text: "WTTC-Bot" })
        .setDescription(
          `The brand ${memberShips.manufacturer} has the following ships: `
        );

      let field: discordJs.EmbedField = {
        name: memberShips.manufacturer,
        value: memberShips.shipString,
        inline: true,
      };
      embeddedMessage.addFields([field]);

      await interaction.editReply({ embeds: [embeddedMessage] });
    }
  );
}
