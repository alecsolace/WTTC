import * as discordJs from "discord.js";
import { getFleetValues } from "../googleConfig";
const members: [name: string, value: string][] = Object(
  require("../../members.json")
);

async function getValue() {
  let data = await getFleetValues();

  return data;
}

export const data = new discordJs.SlashCommandBuilder()
  .setName("fleetvalue")
  .setDescription("Return the current value of the Org fleet");

export async function execute(
  interaction: discordJs.CommandInteraction,
  client: discordJs.Client
) {
  if (!interaction?.channelId) {
    return;
  }

  const channel = await client.channels.fetch(interaction.channelId);
  const data = await getValue();
  if (!channel || channel.type !== discordJs.ChannelType.GuildText) {
    return;
  }
  if (data === undefined || data === null) {
    interaction.reply(
      "There has been an error collecting the data from the spreadsheet."
    );
    return;
  }
  const embeddedMessage = new discordJs.EmbedBuilder()
    .setTitle("World Traveling Trading Circus")
    .setColor("Aqua")
    .setAuthor({ name: "WTTC-Bot" })
    .setTimestamp()
    .setFooter({ text: "WTTC-Bot" });

  let field1: discordJs.EmbedField = {
    name: "Total ships",
    value: data.totalShips,
    inline: true,
  };
  let field2: discordJs.EmbedField = {
    name: "Fleet value",
    value: data.fleetValue,
    inline: true,
  };
  let field3: discordJs.EmbedField = {
    name: "Value per member",
    value: data.valueMember,
    inline: true,
  };
  embeddedMessage.addFields([field1, field2, field3]);

  interaction.reply({ embeds: [embeddedMessage] });
}
