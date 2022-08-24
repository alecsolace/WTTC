import dotenv from "dotenv";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";

dotenv.config();

const {
  CLIENT_ID,
  GUILD_ID,
  DISCORD_TOKEN,
  type,
  project_id,
  private_key_id,
  private_key,
  client_email,
  client_id,
  auth_uri,
  token_uri,
  auth_provider_x509_cert_url,
  client_x509_cert_url,
} = process.env;

if (
  !CLIENT_ID ||
  !GUILD_ID ||
  !DISCORD_TOKEN ||
  !type ||
  !project_id ||
  !private_key_id ||
  !private_key ||
  !client_email ||
  !client_id ||
  !auth_uri ||
  !token_uri ||
  !auth_provider_x509_cert_url ||
  !client_x509_cert_url
) {
  throw new Error("Missing enviroment variables");
}

const config: Record<string, string> = {
  CLIENT_ID,
  GUILD_ID,
  DISCORD_TOKEN,
  type,
  project_id,
  private_key_id,
  private_key,
  client_email,
  client_id,
  auth_uri,
  token_uri,
  auth_provider_x509_cert_url,
  client_x509_cert_url,
};

export default config;
