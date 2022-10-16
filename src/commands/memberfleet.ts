import { SlashCommandBuilder } from "@discordjs/builders";
import {
  Client,
  CommandInteraction,
  EmbedField,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import { accessSpreadsheet } from "../googleConfig";

let manufacturers: string[] = [];
async function findShips(member: string) {
  let ships = await accessSpreadsheet();
  let ownedShips = ships.filter(
    (ship) => ship.owner!.toLowerCase() == member.toLowerCase()
  );

  ownedShips.forEach((ship) => {
    if (!manufacturers.includes(ship.manufacturer)) {
      manufacturers.push(ship.manufacturer);
    }
  });
  return ownedShips;
}

export const data = new SlashCommandBuilder()
  .setName("memberfleet")
  .setDescription("Returns a list of your owned ships")
  .addStringOption(
    (option) =>
      option
        .setName("member")
        .setDescription("Enter your Star Citizen Username")
        .setRequired(true)
    //.addChoices(members)
  );

export async function execute(interaction: CommandInteraction, client: Client) {
  if (!interaction?.channelId) {
    return;
  }
  await interaction.reply("Searching for ships...");
  const channel = await client.channels.fetch(interaction.channelId);

  if (!channel || channel.type !== ChannelType.GuildText) {
    return;
  }

  const member = interaction.options.get("member")!.value! as string;
  let memberShips = await findShips(member);
  if (memberShips.length === 0) {
    await interaction.editReply(`Could not find ships for member: ${member}`);
    return;
  }
  const embeddedMessage = new EmbedBuilder()
    .setTitle(memberShips[0].owner!)
    .setColor("Aqua")
    .setAuthor({ name: "WTTC-Bot" })
    .setTimestamp()
    .setFooter({ text: "WTTC-Bot" })
    .setDescription(`The ships owned by ${memberShips[0].owner!}`);

  manufacturers.forEach((manufacturer) => {
    let ships: string = "";
    memberShips.forEach((ship) => {
      if (ship.manufacturer === manufacturer) {
        ships += "\n" + ship.model;
      }
    });
    let fields: EmbedField = {
      name: manufacturer,
      value: ships,
      inline: true,
    };
    embeddedMessage.addFields([fields]);
  });

  await interaction.editReply({ embeds: [embeddedMessage] });
}
