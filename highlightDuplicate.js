/**
 * Highlights barcodes that are being used >1 in the current sequencing run.
 * @param {object} e - Trigger event when someone enters a new sample 
 * 
 */
function onEdit(e) {
  let inputValue = e.range;
  let sheetName = inputValue.getSheet().getSheetName();
  let colNum = inputValue.getColumn();
  
  if ( (sheetName == "<bla>") && (colNum == <num>) ) {
    
    // Clear format if empty input or previous value has been deleted
    if (inputValue.getValues() == "") {
      inputValue.clear({formatOnly: "true"});
      inputValue.setBackground("#d9ead3");
      return;

    // Highlight duplicate barcodes in the same COLUMN for the same run
    } else {
      let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      highlightDuplicate(sheet, inputValue, "<col>");
      return;
    }
    
  } else {
    return;
    }
}

/**
 * Highlights barcodes that are similar to the inputValue
 * @param {string} inputValue - Library barcode
 */
function highlightDuplicate(sheet, inputValue, colToHighlight) {
  
  // Get the barcodes that are being used in current run
  let barcodesRange = sheet.getRange(colToHighlight + "2:" + colToHighlight + getLastRowInColumn(sheet, colToHighlight));
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
