/**
 * Highlights barcodes that are being used >1 in the current sequencing run.
 * Current sequencing run is defined by empty submission_date (i.e.; samples have not been
 * submitted for sequencing)
 * @param {object} e - Trigger event when someone enters a new sample 
 */
function onEdit(e) {
  let inputValue = e.range;

  // Return if not the barcode column and not the samples_information sheet
  if ( (inputValue.getSheet().getSheetName() != "samples_information") || (inputValue.getColumn() != 6) ) {
    return;
  
  // Clear format if empty input or previous value has been deleted
  } else if ( (inputValue.getValues() == "") && (inputValue.getSheet().getSheetName() == "samples_information") && (inputValue.getColumn() == 6) ) {
    inputValue.clearFormat();
    return;
  }

  // Highlight if input is a duplicate
  else {
    highlightDuplicate(inputValue);
    return;
  }
}

// TODO: Add note when there is duplicate notifying that it's a duplicate */
/**
 * Highlights barcodes that are similar to the inputValue
 * @param {string} inputValue - Library barcode
 */
function highlightDuplicate(inputValue) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("samples_information");

  // Get the row to start conditional formatting from
  let rowStart = getLastRowInColumn(sheet, "K") + 1;

  // Get the barcodes that are being used in current run
  let barcodesRange = sheet.getRange("F" + rowStart + ":F" + getLastRowInColumn(sheet, "F"));
  let currentBarcodes = (barcodesRange.getValues()).filter(String);

  // First barcode of a new run does not have a duplicate
  if (currentBarcodes.length == 1) {
    return;
  
  // Count each element occurrence
  } else {
    let counts = {};
    for (let num of currentBarcodes) {
      counts[num] = counts[num] ? counts[num] + 1 : 1;
    }
    occInput = counts[inputValue.getValues()];

    // Return if there is no duplicate
    if (occInput == 1) {
      return;

    // Highlight if a duplicate
    } else {
      let rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(inputValue.getValues())
      .setBackground("#F4CCCC")
      .setRanges([barcodesRange])
      .build();

      let rules = sheet.getConditionalFormatRules();
      rules.push(rule);
      sheet.setConditionalFormatRules(rules);

      return;
    }
  } 
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
