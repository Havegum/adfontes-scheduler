import GSheetReader from 'g-sheets-api';

function sheetFetch (options) {
  return new Promise((resolve, reject) => {
    GSheetReader(options, resolve, reject);
  });
}

export default function fetchAndParse ({ sheetId, apiKey }) {
  return async function (sheetName) {
    return await sheetFetch({ sheetId, apiKey, sheetName, returnAllResults: true });
  }
}