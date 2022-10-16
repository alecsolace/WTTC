import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { getFleetValues } from "../googleConfig";

async function getValue() {
  let data = await getFleetValues();

  return data;
}

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Get information on how every command works");

export async function execute(interaction: CommandInteraction, client: Client) {
  if (!interaction?.channelId) {
    return;
  }

  const embeddedMessage = new EmbedBuilder()
    .setAuthor({ name: "World Traveling Trading Circus" })
    .setColor("Aqua")
    .setTimestamp()
    .setTitle("WTTC-Bot Help")
    .setDescription(
      "The bot is synced with the spreadsheet https://bit.ly/wttc_fleet that you can also find over at current-fleet and will pull info from there. Atm only ships owned by members will be shown in the bot, but this will be changed soon(ish) \n \n /brand - Returns a list of ships based on the selected brand \n eg. /brand Crusader \n \n /fleetvalue - Returns the current value of WTTC's combined fleet value, along some other stats \n \n /memberfleet - Returns a list of a members owned ships as per the spreadsheet \n eg. /memberfleet Wisur \n *The membername has to be the same as what's used in the spreadsheet. The names should be identical to their discord nick, but some might have written it differently in the spreadsheet. \n \n /ship - returns information on the selected ship \n eg. /ship 400i \n \n For ships that have a variant you need to specify the full name as it is in the spreadsheet. \n eg. /ship ship: 600i variant: Explorer \n *For now only ships that a member own will give a callback from the spreadsheet, but this will be changed in a later iteration of the bot. \n \n Disclaimer: This bot is ongoing and still under development, any issue you find will be fixed later, just let us know.. This is the first iteration open to member access, and it will increase in amounts of things it can do as we go along. Every ship in game will eventually be searchable, but we have the same time horizon on things as our beloved God CR, so take from it what you want."
    )
    .setFooter({ text: "Cheers from AlecSolaris - Wisur" });

  interaction.reply({ embeds: [embeddedMessage] });
}
