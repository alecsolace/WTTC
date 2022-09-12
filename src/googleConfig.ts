import { GoogleSpreadsheet } from "google-spreadsheet";
import { ship } from "./commands";

const creds = require("../google-credentials.json");
const doc = new GoogleSpreadsheet(
  "1zCv-6z2HqdNISRruH-wDvYT0JZ54ByYonNWBTeyI27s"
);
type Ship = {
  manufacturer: string;
  model: string;
  owner?: string;
  price?: string;
};
type Member = {
  value: string;
  name: string;
};
export async function accessSpreadsheet() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  await sheet.loadHeaderRow(4);
  const rows = await sheet.getRows();

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

export async function getMembers() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[3];
  await sheet.loadHeaderRow(3);
  const rows = await sheet.getRows();

  let members: [name: string, value: string][] = [];
  rows.forEach((row) => {
    if (row.MEMBER !== "") {
      let member: [name: string, value: string] = [row.MEMBER, row.MEMBER];
      members.push(member);
    }
  });
  return members;
}

export async function getShips() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[6];
  await sheet.loadHeaderRow(2);
  const rows = await sheet.getRows();

  let ships: [name: string, value: string][] = [];
  rows.forEach((row) => {
    if (row.Ship != null) {
      let ship: [name: string, value: string] = [row.Ship, row.Ship];
      ships.push(ship);
    }
  });
  return ships;
}

export async function getManufacturers() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[2];
  await sheet.loadHeaderRow(3);
  const rows = await sheet.getRows();

  let ships: { manufacturer: string; model: string }[] = [];
  rows.forEach((row) => {
    if (row.Name != null) {
      let ship: { manufacturer: string; model: string } = {
        manufacturer: row.Manufacturer,
        model: row.Name,
      };
      ships.push(ship);
    }
  });
  return ships;
}

export async function getFleetValues() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  await sheet.loadHeaderRow(2);
  const rows = await sheet.getRows();
  const totalShips = rows[0].Total_Ships;
  const fleetValue = rows[0].Total_Fleet_Value;
  const valueMember = rows[0].Average_Per_Member;
  return { totalShips, fleetValue, valueMember };
}

export async function getShipValues() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[2];
  await sheet.loadHeaderRow(3);
  const rows = await sheet.getRows();
  let ships: Ship[] = [];
  rows.forEach((row) => {
    const name = row.Name;
    const manufacturer = row.Manufacturer;
    const inGamePrice = row.aUEC;
    let ship: Ship = {
      manufacturer: manufacturer,
      model: name,
      price: inGamePrice,
    };
    ships.push(ship);
  });
  return ships;
}
