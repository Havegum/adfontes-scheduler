// By Rob Kendal. Extracted function as it's not exported by the npm-package. Source:
// https://github.com/bpk68/g-sheets-api/blob/master/src/gsheetsprocessor.js
function processGSheetResults(JSONResponse) {
  const data = JSONResponse.feed.entry;
  const startRow = 2; // skip the header row(1), don't need it

  let processedResults = [{}];
  let colNames = {};

  for (let item of data) {
    const cell = item['gs$cell']; // gets cell data
    const val = cell['$t']; // gets cell value
    const columnNum = cell['col']; // gets the col number
    const thisRow = cell['row']; // gets the row number

    const colNameToAdd = colNames[columnNum]; // careful, this will be undefined if we hit it on the first pass

    // don't add this row to the return data, but add it to list of column names
    if (thisRow < startRow) {
      colNames[columnNum] = val.toLowerCase();
      continue; // skip the header row
    }

    if (typeof processedResults[thisRow] === 'undefined')
      processedResults[thisRow] = {};

    if (typeof colNameToAdd !== 'undefined' && colNameToAdd.length > 0)
      processedResults[thisRow][colNameToAdd] = val;
  }
  // make sure we're only returning valid, filled data items
  processedResults = processedResults.filter(result => Object.keys(result).length);

  return processedResults;
}


function fetchAndParse (sheetId, sheetNumber) {
	const url = `https://spreadsheets.google.com/feeds/cells/${sheetId}/${sheetNumber}/public/values?alt=json-in-script`;
	return new Promise(async function (resolve, reject) {
		let res;
		try {
			res = await fetch(url);
		} catch (err) {
			return reject({ message: err.toString() });
		}
		if (!res.ok) reject(res);

    try {
      return resolve(
        processGSheetResults(
          JSON.parse(
            (await res.text())
              .replace('gdata.io.handleScriptLoaded(', '')
              .slice(0, -2)
          )
        )
      );
    } catch (error) {
      return reject({ message: 'Error parsing Sheets results' })
    }
	});
}


const curriedFetch = sheetId => sheetNumber => fetchAndParse(sheetId, sheetNumber);


export default curriedFetch;
