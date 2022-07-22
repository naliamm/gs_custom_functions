const SOURCE_SHEET = SpreadsheetApp
  .openByUrl("<SHEET-URL>")
  .getSheetByName("<SHEET-NAME>");
  
const MAIN_SHEET = SpreadsheetApp
  .openByUrl("<SHEET-URL>")
  .getSheetByName("<SHEET-NAME>");

var mainCurrentIndex = getLastIndex(MAIN_SHEET);
var sourceCurrentIndex = getLastIndex(SOURCE_SHEET);

/** Copy new samples information from SOURCE_SHEET to MAIN_SHEET
 * Check for mismatched data, if there's any
 * Send an email of all the changes
 */
function emailNewSamplesAdded() { // TODO: Install time trigger
  // Return if no new run
  if (sourceCurrentIndex == 0) {
    GmailApp.sendEmail('<EMAIL-ADDRESS>', '[Samples mainlist]', "No new run.");
    return;
  
  // New run, no new samples added
  } else if (mainCurrentIndex == sourceCurrentIndex) {
    let mismatchedRows = findMismatchedRows();

    // No mismatched rows
    if (mismatchedRows == 0) {
      GmailApp.sendEmail('<EMAIL-ADDRESS>', '[Samples mainlist]', "All is well.");
      return;
    
    // There's mismatched rows
    } else {
      let emailBody = "No new samples added. \n Mismatched rows have index: " + mismatchedRows;
      GmailApp.sendEmail('<EMAIL-ADDRESS>', '[Samples mainlist]', emailBody);
      return;
    }
  
  // New run, new samples added
  } else {
    let numNewSamples = sourceCurrentIndex - mainCurrentIndex;

    let sourceSamples = SOURCE_SHEET.getRange("A1:A" + getLastRowInColumn(SOURCE_SHEET, "B")).getValues();
    let mainSamples = MAIN_SHEET.getRange("A1:A" + getLastRowInColumn(MAIN_SHEET, "B")).getValues();
    let newSamples = sourceSamples.filter(samples => !mainSamples.includes(samples));

    copyNewSamples(newSamples.slice(1));

    let emailBody = numNewSamples +
    " new sample(s) have been added.\nSample(s) start from Row Index " +
    (mainCurrentIndex + 1);
    
    let mismatchedRows = findMismatchedRows();

    // No mismatched rows
    if (mismatchedRows == 0) {
      emailBody = emailBody + "\n\nNo mismatched rows.";
      GmailApp.sendEmail('<EMAIL-ADDRESS>', '[Samples mainlist]', emailBody);
      return;
    
    // There's mismatched rows
    } else {
      emailBody = emailBody + "\n\nMismatched rows have index: " + mismatchedRows; 
      GmailApp.sendEmail('<EMAIL-ADDRESS>', '[Samples mainlist]', emailBody);
      return;
    }
  }
}

/**
 * Get the last index for the given sheet. Last index is defined by row index with the highest number
 * @param {object} sheet - The sheet to find last index for
 * @return {int} lastIndex - The highest row index number
 */
function getLastIndex(sheet) {
  let lastPkrId = getLastRowInColumn(sheet, "B");

  if (lastPkrId == 0){
    return 0;
  }

  else {
    let allID = (sheet.getRange("A2:A" + getLastRowInColumn(sheet, "B"))).getValues();
    allID.sort(compareNumbers = (a, b) => a - b);
    let lastIndex = allID[allID.length - 1];
    
    return lastIndex[0];
  }
}

/**
 * Copy new samples to the MAIN_SHEET by the row index. This function will find the row index in
 * MAIN_SHEET, and add sample information to that row.
 * @param {array} sampleIndex - An array of row index for the new samples 
 */
function copyNewSamples(sampleIndex) {
  for (let i = 0; i < sampleIndex.length; i++){
    let sourceRowNum = findA1RowGivenIndex(SOURCE_SHEET, parseInt(sampleIndex[i]));
    let mainRowNum = findA1RowGivenIndex(MAIN_SHEET, parseInt(sampleIndex[i]));

    let sourceRangeToCopy = SOURCE_SHEET.getRange("B" + sourceRowNum + ":I" + sourceRowNum);
    let valuesToCopy = sourceRangeToCopy.getValues();
    let mainRangeToPaste = MAIN_SHEET.getRange("B" + mainRowNum + ":I" + mainRowNum); 

    mainRangeToPaste.setValues(valuesToCopy);
  }
  
  return;
}

/**
 * Find the A1 notation for row number when given the row index.
 * @param {object} sheet - The sheet to find row
 * @param {int} index - Row index number to find row
 * @return {int} rowNum - A1 notation of row number
 */
function findA1RowGivenIndex(sheet, index) {
  let allIndex = sheet.getRange("A1:A" + getLastRowInColumn(sheet, "A")).getValues();
  let rowNum = allIndex.findIndex(indexToFind => indexToFind == index);

  return rowNum + 1;
}

/**
 * Get the last row with samples information from a column
 * @param {object} sheet
 * @param {int} column
 * @return {int}
 */
function getLastRowInColumn(sheet, column) {
  var lastContent = sheet.getLastRow();
  var colRange = sheet.getRange(column + "1:" + column + lastContent);
  var colValues = (colRange.getValues()).filter(String);
  var lastRow = colValues.length;

  // Return 0 if lastRow is the header. There is no new run.
  if (lastRow == 1) {
    return 0;
  } else {
    return lastRow;
  }
}

/**
 * Get the rows that have mismatched values between SOURCE_SHEET and MAIN_SHEET
 * @param {object} sourceData
 * @param {object} mainData
 * @return {array} mismatchedRows
 */
function findMismatchedRows() {
  var mismatchedRows = new Object();

  let sourceAllSamples = SOURCE_SHEET
  .getRange("A2:I" + getLastRowInColumn(SOURCE_SHEET, "B"))
  .getValues();

  for (let i = 0; i < sourceAllSamples.length; i++) {
    let sampleRowInMain = findA1RowGivenIndex(MAIN_SHEET, sourceAllSamples[i][0]);
    let sampleInMain = MAIN_SHEET.getRange("A" + sampleRowInMain + ":I" + sampleRowInMain).getValues();

    let rowIndex = "Row Index " + sourceAllSamples[i][0];
    let mismatchedCols = new Array();

    for (let j = 0; j < sourceAllSamples[0].length; j++) {
      if (sourceAllSamples[i][j] != sampleInMain[0][j]) {
        mismatchedCols.push(j+1);
        mismatchedRows[rowIndex] = mismatchedCols;
      }
    }
  }

  if (Object.keys(mismatchedRows) == 0) {
    return parseInt(0);
  }

  return Object.entries(mismatchedRows);
    
}
