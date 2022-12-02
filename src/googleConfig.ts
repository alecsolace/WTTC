import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";

const creds = require("../google-credentials.json");
//Prod Sheet
const doc = new GoogleSpreadsheet(
  "1zCv-6z2HqdNISRruH-wDvYT0JZ54ByYonNWBTeyI27s"
);

/* // Test Sheet
const doc = new GoogleSpreadsheet(
  "1P8X1knEkndqaZsavvnRKlmaDV3_tC9DTCrn8yMIwIyE"
); */

export type Ship = {
  manufacturer: string;
  model: string;
  owner?: string;
  price?: string;
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
      let member = row.MEMBER;
      members.push(member);
    }
  });
  return members;
}

export async function getShips() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  await sheet.loadHeaderRow(4);
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
  let orderedShips = groupBy(ships, "manufacturer");
  return orderedShips;
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

export async function insertShip(ship: any) {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  await sheet.loadHeaderRow(4);
  sheet
    .getRows()
    .then((data: GoogleSpreadsheetRow[]) =>
      data.find((row: GoogleSpreadsheetRow) => row.Manufacturer === "")
    )
    .then((empty) => {
      empty!.Manufacturer = ship.manufacturer;
      empty!.Model = ship.model;
      empty!.Owner = ship.owner;
      empty!.Comments = ship.comments;
      empty!["Ship name"] = ship.shipName;
      empty!["TCS prefix?"] = ship.prefix;
      empty!.save();
    });
}

export async function deleteShip(ship: any) {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  await sheet.loadHeaderRow(4);

  if (ship.name === "" || ship.name === undefined || ship.name === null) {
    return sheet
      .getRows()
      .then((data: GoogleSpreadsheetRow[]) =>
        data.find(
          (row: GoogleSpreadsheetRow) =>
            row.Manufacturer === ship.manufacturer &&
            row.Model === ship.model &&
            row.Owner === ship.owner
        )
      )
      .then((found) => {
        if (!found) {
          console.log("Ship not found");
          return false;
        }
        found.Manufacturer = "";
        found.Model = "";
        found.Owner = "";
        found.Comments = "";
        found["Ship name"] = "";
        found["TCS prefix?"] = false;
        found.save();
        return true;
      });
  } else {
    sheet
      .getRows()
      .then((data: GoogleSpreadsheetRow[]) =>
        data.find(
          (row: GoogleSpreadsheetRow) =>
            row.Manufacturer === ship.manufacturer &&
            row.Model === ship.model &&
            row.Owner === ship.owner &&
            row["Ship name"] === ship.name
        )
      )
      .then((found) => {
        if (!found) {
          console.log("Ship not found");
          return false;
        }

        found.Manufacturer = "";
        found.Model = "";
        found.Owner = "";
        found.Comments = "";
        found["Ship name"] = "";
        found["TCS prefix?"] = false;
        found.save();
        return true;
      });
  }
}

function groupBy(list: any[], prop: string | number) {
  return list.reduce((groupped, item) => {
    var key = item[prop];
    delete item[prop];
    if (groupped.hasOwnProperty(key)) {
      groupped[key].push(item);
    } else {
      groupped[key] = [item];
    }
    return groupped;
  }, {});
}
