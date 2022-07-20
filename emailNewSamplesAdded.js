const SOURCE_SHEET = SpreadsheetApp
  .openByUrl("<SHEET-URL>")
  .getSheetByName("<SHEET-NAME>");
  
const MAIN_SHEET = SpreadsheetApp
  .openByUrl("<SHEET-URL>")
  .getSheetByName("<SHEET-NAME>");

var mainCurrentIndex = parseInt(getLastRowIndex(MAIN_SHEET, "B"));
var sourceCurrentIndex = parseInt(getLastRowIndex(SOURCE_SHEET, "B"));

/** Copy new samples information from SOURCE_SHEET to MAIN_SHEET
 * Check for mismatched data, if there's any
 * Send an email of all the changes
 */
function emailNewSamplesAdded() { // TODO: Install time trigger
  // Return if no new run
  if (isNaN(sourceCurrentIndex)) {
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
    }
  
  // New run, new samples added
  } else {
    let numNewSamples = sourceCurrentIndex - mainCurrentIndex;
    let sourceRangeToCopy = SOURCE_SHEET.getRange(parseInt(getSourceStartRow()), 2, numNewSamples, 11);
    let mainRangeToPaste = MAIN_SHEET.getRange(parseInt(mainCurrentIndex+2), 2, numNewSamples, 11);

    let newSamples = sourceRangeToCopy.getValues();
    mainRangeToPaste.setValues(newSamples);

    let emailBody = numNewSamples +
    " new sample(s) have been added. \n\t Sample(s) start from Row Index " +
    (mainCurrentIndex + 1);

    let mismatchedRows = findMismatchedRows();
    
    // No mismatched rows
    if (mismatchedRows == 0) {
      emailBody = emailBody + "\nNo mismatched rows.";
      GmailApp.sendEmail('<EMAIL-ADDRESS>', '[Samples mainlist]', emailBody);
      return;
    
    // There's mismatched rows
    } else {
      emailBody = emailBody + "\nMismatched rows have index: " + mismatchedRows; 
      GmailApp.sendEmail('<EMAIL-ADDRESS>', '[Samples mainlist]', emailBody);
      return;
    }
  }
}

/**
 * Get the rows that have mismatched values between SOURCE_SHEET and MAIN_SHEET
 * @param {object} sourceData
 * @param {object} mainData
 * @return {array} mismatchedRows
 */
function findMismatchedRows() {
  var mismatchedRows = {};

  let sourceRange = SOURCE_SHEET
  .getRange("A2:I" + getLastRowInColumn(SOURCE_SHEET, "B"))
  .getValues();
    
  let mainStartRow = SOURCE_SHEET.getRange("A2").getValue();
  let mainRange = MAIN_SHEET
  .getRange("A" + (mainStartRow+1) + ":I" + getLastRowInColumn(MAIN_SHEET, "B"))
  .getValues();

  // Get row and col numbers of mismatched data
  for (let i = 0; i < sourceRange.length; i++) {
    let mismatchedCols = Array();
    let rowIndex = "Row Index " + (mainStartRow + i) + ": ";

    for (let j = 0; j < sourceRange[1].length; j++) {
      if (sourceRange[i][j] != mainRange[i][j]) {
        mismatchedCols.push(j+1);
        mismatchedRows[rowIndex] = mismatchedCols;
      }
    }
  } 
  
  // TODO: Fix random comma - IDK where this comes from..??

  if (Object.keys(mismatchedRows) == 0) {
    return parseInt(0);
  }

  return Object.entries(mismatchedRows);
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

  if (lastRow == 0) {
    return 0;
  } else {
    return lastRow;
  }
}

/**
 * Get the row index of the last row with samples information
 * @param {object} sheet
 * @param {int} column
 * @return {int}
 */
function getLastRowIndex(sheet, column) {
  let colLastRow = getLastRowInColumn(sheet, column);

  if (colLastRow == 0) {
    return 0;
  } else {
    let tempIndex = sheet.getRange("A1:A" + sheet.getLastRow()); // All index
    let rowIndex = (tempIndex.getValues()).filter(String);
    let lastRowIndex = rowIndex[colLastRow - 1]; // Array is 0-indexed
  
    return lastRowIndex; 
  }
}

/**
 * Get the row from SOURCE_SHEET to start range from
 * @return {int}
 */
function getSourceStartRow() {
  let sourceRowIndex = (SOURCE_SHEET.getRange("A1:A" + getLastRowInColumn(SOURCE_SHEET, "B"))).getValues();

  // Find start row for source
  let startIndex = mainCurrentIndex + 1;
  let startRow = (sourceRowIndex.findIndex(index => index == startIndex)) + 1;
  
  return startRow;
}

/**
 * Get the row from MAIN_SHEET to start range from
 * @param {int} startIndex
 * @return {int}
 */
function getMainStartRow(startIndex) {
  let mainRowIndex = (MAIN_SHEET.getRange("A1:A" + getLastRowInColumn(MAIN_SHEET, "B"))).getValues();

  // Find start row for main
  let startRow = (mainRowIndex.findIndex(index => index == startIndex)) + 1;
  
  return startRow;
}
