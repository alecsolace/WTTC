import dotenv from "dotenv";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";

dotenv.config();

const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env;

if (!CLIENT_ID || !GUILD_ID || !DISCORD_TOKEN) {
  throw new Error("Missing enviroment variables");
}

const config: Record<string, string> = {
  CLIENT_ID,
  GUILD_ID,
  DISCORD_TOKEN,
};

export default config;
