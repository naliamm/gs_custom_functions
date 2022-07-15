// TODO: Install time trigger on Apps Script if this is the first time using this script

const SOURCE_SHEET = SpreadsheetApp
  .openByUrl("<GOOGLE-SHEETS-URL")
  .getSheetByName("<SHEET-NAME>");
  
const MAIN_SHEET = SpreadsheetApp
  .openByUrl("<GOOGLE-SHEETS-URL")
  .getSheetByName("<SHEET-NAME>");

var mainCurrentIndex = parseInt(getLastRowIndex(MAIN_SHEET, "B"));
var sourceCurrentIndex = parseInt(getLastRowIndex(SOURCE_SHEET, "B"));

/** Copy new samples information from SOURCE_SHEET to MAIN_SHEET
 * Check for mismatched data, if there's any
 * Send an email of all the changes
 */
function emailNewSamplesAdded() {
  // Return if no new run
  if (isNaN(sourceCurrentIndex)) {
    return;
  
  // No new samples for existing run, check and notify for mismatched rows if there's any
  } else if (mainCurrentIndex == sourceCurrentIndex) {
    let mismatchedRows = findMismatchedRows();
    if (mismatchedRows == 0) {
      return;
    } else {
      let emailBody = "No new samples added. \n Mismatched rows have index: " + mismatchedRows; 
      GmailApp.sendEmail('<EMAIL-ADDRESS>', '<EMAIL-SUBJECT>', emailBody);
    }
  
  // Add new samples to the masterlist
  } else {
    let numNewSamples = sourceCurrentIndex - mainCurrentIndex;
    let sourceRangeToCopy = SOURCE_SHEET.getRange(parseInt(getSourceStartRow()), 2, numNewSamples, 11);
    let mainRangeToPaste = MAIN_SHEET.getRange(parseInt(mainCurrentIndex+2), 2, numNewSamples, 11);

    let newSamples = sourceRangeToCopy.getValues();
    mainRangeToPaste.setValues(newSamples);

    let emailBody = numNewSamples +
    " new sample(s) have been added. \n\t Sample(s) start from Row Index " +
    (mainCurrentIndex + 1);

    // Check for mismatch if existing samples in SOURCE_SHEET have been modified
    let mismatchedRows = findMismatchedRows();
      if (mismatchedRows == 0) {
        emailBody = emailBody + "No mismatched rows";
        GmailApp.sendEmail('<EMAIL-ADDRESS>', '<EMAIL-SUBJECT>', emailBody);
        return;
      } else {
        let emailBody = "Mismatched rows have index: " + mismatchedRows; 
        GmailApp.sendEmail('<EMAIL-ADDRESS>', '<EMAIL-SUBJECT>', emailBody);
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
  var mismatchedRows = new Set();

  let sourceRange = SOURCE_SHEET
  .getRange("A2:L" + getLastRowInColumn(SOURCE_SHEET, "B"))
  .getValues();
    
  let mainStartRow = SOURCE_SHEET.getRange("A2").getValue();
  let mainRange = MAIN_SHEET
  .getRange("A" + (mainStartRow+1) + ":L" + getLastRowInColumn(MAIN_SHEET, "B"))
  .getValues();

  // Get row and col numbers of mismatched data
  for (let i = 0; i < sourceRange.length; i++) {
    for (let j = 0; j < sourceRange[1].length; j++) {
      if (sourceRange[i][j] != mainRange[i][j]) {
        let rowIndex = sourceRange[i][0];
        mismatchedRows.add(rowIndex);
      }
    }

      // TODO: Handle which specific column value has been changed
      // for (let j = 0; j < sourceData[1].length; j++) {
      //   if ( String(sourceData[i][j]) != String(mainData[i][j]) ) {
      //     let rowIndex = sourceData[i][0];
      //     mismatchedRows.push(rowIndex)
      //   }
  } 
  
  if (mismatchedRows.size == 0) {
    return parseInt(0);
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
