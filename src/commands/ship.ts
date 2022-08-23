import { SlashCommandBuilder } from "@discordjs/builders";
import fetch from "node-fetch";
import { GoogleSpreadsheet } from "google-spreadsheet";
import {
  Client,
  CommandInteraction,
  MessageEmbed,
  TextChannel,
  ThreadChannel,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ship")
  .setDescription("Returns information on the selected ship")
  .addStringOption((option) =>
    option
      .setName("ship")
      .setDescription('Enter the name of the ship. ex: "Merchantman"')
      .setRequired(true)
  );

async function accessSpreadsheet() {
    const doc = new GoogleSpreadsheet('1qA11t460-ceILmwu6RtfiPGb_n9MUD_7z6Ld7I_Z6yc');
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    var sheet = info.worksheets[0];

    var cells = await promisify(sheet.getCells)({
        'min-row': 2,
        'max-row': 5,
        'min-col': 3,
        'max-col': 3,
        'return-empty': true,
    })
    for (var cell of cells) {
        message.author.send(cell.value)
    }
}
export async function execute(interaction: CommandInteraction, client: Client) {
  if (!interaction?.channelId) {
    return;
  }

  const channel = await client.channels.fetch(interaction.channelId);

  if (!channel || channel.type !== "GUILD_TEXT") {
    return;
  }

  const embeddedMessage = new MessageEmbed()
    .setColor("#0099ff")
    .setAuthor("WTTC-Bot")
    .setTimestamp()
    .setFooter("WTTC-Bot");

  const shipName = interaction.options.getString("ship")!;
  let shipData;
  try {
    const response = await fetch(
      `https://api.star-citizen.wiki/api/vehicles/${shipName}`,
      {
        method: "GET",
        headers: {},
      }
    );

    if (response.ok) {
      const result = await response.json();

      console.log(result);
    }
  } catch (err) {
    console.error(err);
  }
  const { user } = interaction;

  embeddedMessage.setTitle(shipName);

  interaction.reply({ embeds: [embeddedMessage] });
}
