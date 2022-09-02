import { SlashCommandBuilder } from "@discordjs/builders";
import {
  Client,
  CommandInteraction,
  EmbedFieldData,
  MessageEmbed,
} from "discord.js";
import { getFleetValues } from "../googleConfig";
const members: [name: string, value: string][] = Object(
  require("../../members.json")
);

async function getValue() {
  let data = await getFleetValues();

  return data;
}

export const data = new SlashCommandBuilder()
  .setName("fleetvalue")
  .setDescription("Return the current value of the Org fleet");

export async function execute(interaction: CommandInteraction, client: Client) {
  if (!interaction?.channelId) {
    return;
  }

  const channel = await client.channels.fetch(interaction.channelId);
  const data = await getValue();
  if (!channel || channel.type !== "GUILD_TEXT") {
    return;
  }
  if (data === undefined || data === null) {
    interaction.reply(
      "There has been an error collecting the data from the spreadsheet."
    );
    return;
  }
  const embeddedMessage = new MessageEmbed()
    .setTitle("World Trading Traveling Circus")
    .setColor("AQUA")
    .setAuthor("WTTC-Bot")
    .setTimestamp()
    .setFooter("WTTC-Bot");

  let field1: EmbedFieldData = {
    name: "Total ships",
    value: data.totalShips,
    inline: true,
  };
  let field2: EmbedFieldData = {
    name: "Fleet value",
    value: data.fleetValue,
    inline: true,
  };
  let field3: EmbedFieldData = {
    name: "Value per member",
    value: data.valueMember,
    inline: true,
  };
  embeddedMessage.addFields([field1, field2, field3]);

  interaction.reply({ embeds: [embeddedMessage] });
}
