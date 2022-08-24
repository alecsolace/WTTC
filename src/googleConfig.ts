import { GoogleSpreadsheet } from "google-spreadsheet";

const creds = require("../client_secret.json");
type Ship = {
  manufacturer: string;
  model: string;
  owner: string;
};
export async function accessSpreadsheet() {
  const doc = new GoogleSpreadsheet(
    "1P8X1knEkndqaZsavvnRKlmaDV3_tC9DTCrn8yMIwIyE"
  );
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  await sheet.loadHeaderRow(4);
  const rows = await sheet.getRows();
  console.log(
    `Sheet Title: ${sheet.title}, Sheet Row count: ${sheet.rowCount}`
  );
  let ships: Ship[] = [];
  rows.forEach((row) => {
    let ship: Ship = {
      manufacturer: row.Manufacturer,
      model: row.Model,
      owner: row.Owner,
    };
    ships.push(ship);
  });
  return ships;
}
