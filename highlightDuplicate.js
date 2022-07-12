/**
 * Highlights barcodes that are being used >1 in the current sequencing run.
 * Current sequencing run is defined by empty submission_date (i.e.; samples have not been
 * submitted for sequencing)
 * @param {object} e - Trigger event when someone enters a new sample 
 */
function onEdit(e) {
  let inputValue = e.range;

  // Return if not the barcode column and not the samples_information sheet
  if ( (inputValue.getSheet().getSheetName() !== "samples_information") || (inputValue.getColumn() !== 6) ) {
    return;
  
  // Clear format if empty input or previous value has been deleted
  } else if ( (inputValue.getValues == "") || (inputValue.getSheet().getSheetName() == "samples_information") || (inputValue.getColumn() == 6)){
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
//       Add getLastRowInColumn() from emailNewSamplesAdded()
/**
 * Highlights barcodes that are similar to the inputValue
 * @param {string} inputValue - Library barcode
 */
function highlightDuplicate(inputValue) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("samples_information");

  // Get the row to start conditional formatting from
  let dateRange = sheet.getRange("J2:J"); // start is defined by the first empty row in submission_date column
  let submitDates = dateRange.getValues();
  let rowStart = submitDates.filter(String).length + 2; // the last row with non-empty cell

  // Get the barcodes that are being used in current run
  let startRange = "E" + rowStart + ":E";
  let usedBarcodes = sheet.getRange(startRange).getValues();
  let currentBarcodes = usedBarcodes.filter(String); // this filters for the barcodes that are currently being used starting from start_row to inputValue

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
      //inputValue.setNote("duplicate!!");
      let usedBarcodesRange = sheet.getRange("E2:E");
      let usedBarcodesValues = usedBarcodesRange.getValues();
      let rowEnd = usedBarcodesValues.filter(String).length + 1;
      let formatRange = "E" + rowStart + ":E" + rowEnd;

      let ruleRange = sheet.getRange(formatRange);

      let rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(inputValue.getValues())
      .setBackground("#F4CCCC")
      .setRanges([ruleRange])
      .build();

      let rules = sheet.getConditionalFormatRules();
      rules.push(rule);
      sheet.setConditionalFormatRules(rules);

      return;
    }
  } 
}
