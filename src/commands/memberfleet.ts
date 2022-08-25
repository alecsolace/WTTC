import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import { accessSpreadsheet } from "../googleConfig";
const members: [name: string, value: string][] = Object(
  require("../../members.json")
);

async function getMembers() {
  let members = await accessSpreadsheet();
  let uniqueMembers: any[] = [];
  members.forEach((member) => {
    if (!uniqueMembers.includes(member.owner)) {
      uniqueMembers.push({ value: member.owner, name: member.owner });
    }
  });

  return uniqueMembers;
}
async function findShips(member: string) {
  let ships = await accessSpreadsheet();
  let ownedShips: any[] = [];

  ships.forEach((ship) => {
    if (ship.owner.toLowerCase() === member.toLowerCase()) {
      ownedShips.push(ship);
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

  const channel = await client.channels.fetch(interaction.channelId);

  if (!channel || channel.type !== "GUILD_TEXT") {
    return;
  }

  const member = interaction.options.getString("member")!;
  let memberShips = await findShips(member);
  if (memberShips.length === 0) {
    interaction.reply(`Could not find ships for member: ${member}`);
    return;
  }
  const embeddedMessage = new MessageEmbed()
    .setTitle(memberShips[0].owner)
    .setColor("AQUA")
    .setAuthor(`WTTC-Bot`)
    .setTimestamp()
    .setFooter("WTTC-Bot")
    .setDescription(`The ships owned by ${memberShips[0].owner}`);

  memberShips = memberShips.sort((a, b) =>
    a.manufacturer > b.manufacturer ? 1 : -1
  );
  memberShips.forEach((ship) => {
    embeddedMessage.addField(ship.manufacturer, ship.model, true);
  });

  const { user } = interaction;

  interaction.reply({ embeds: [embeddedMessage] });
}
