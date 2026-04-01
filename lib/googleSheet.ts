// src/lib/googleSheets.ts

const getGapi = () => {
  if (!window.gapi?.client) {
    throw new Error("Google API not initialized");
  }
  return window.gapi.client;
};

// ✅ CREATE DECK
export async function createGoogleSheet(title: string) {
  const gapi = getGapi();

  const res = await gapi.sheets.spreadsheets.create({
    properties: { title },
  });

  const spreadsheetId = res.result.spreadsheetId;

  // Add headers
  await gapi.sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "A1:C1",
    valueInputOption: "RAW",
    resource: {
      values: [["Word", "Meaning", "Example"]],
    },
  });

  return {
    spreadsheetId,
    spreadsheetUrl: res.result.spreadsheetUrl,
  };
}

// ✅ RENAME DECK
export async function renameGoogleSheet(
  spreadsheetId: string,
  newName: string
) {
  const gapi = getGapi();

  await gapi.sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests: [
        {
          updateSpreadsheetProperties: {
            properties: {
              title: newName,
            },
            fields: "title",
          },
        },
      ],
    },
  });
}

// ✅ ADD WORD (FLASHCARD)
export async function addWordToGoogleSheet(
  spreadsheetId: string,
  word: string,
  meaning: string,
  example: string
) {
  const gapi = getGapi();

  await gapi.sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "A:C",
    valueInputOption: "RAW",
    resource: {
      values: [[word, meaning, example]],
    },
  });
}

// ✅ GET WORDS (you didn’t have this yet — very important)
export async function getWordsFromGoogleSheet(spreadsheetId: string) {
  const gapi = getGapi();

  const res = await gapi.sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "A2:C",
  });

  return res.result.values || [];
}