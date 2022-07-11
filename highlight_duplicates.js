/* Adds a conditional format rule to a sheet that causes cells in col E to turn red if
 they have empty col submission_date AND text equal to barcode previously used. */

function onEdit(e) {
  input_value = e.range;

  // Return if not the barcode column and not the samples_information sheet
  if ( (input_value.getSheet().getSheetName() !== "samples_information") || (input_value.getColumn() !== 5) ) {
    return;
  
  // Clear format if empty input or previous value has been deleted
  } else if ( (input_value.getValues == "") || (input_value.getSheet().getSheetName() == "samples_information") || (input_value.getColumn() == 5)){
    input_value.clearFormat();
    return;
  
  // Highlight if input is duplicate
  } else {
    highlightDuplicate(input_value);
    return;
  }
}

/* TODO:
    Add note when there is duplicate notifying that it's a duplicate
    Remove conditional formatting when submission date has been entered */

function highlightDuplicate(input_value) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("samples_information");

  // Get the row to start conditional formatting from
  var date_range = sheet.getRange("J2:J"); // start is defined by the first empty row in submission_date column
  var submit_dates = date_range.getValues();
  var row_start = submit_dates.filter(String).length + 2; // the last row with non-empty cell

  // Get the barcodes that are being used in current run
  var start_range = "E" + row_start + ":E";
  var used_barcodes = sheet.getRange(start_range).getValues();
  var current_barcodes = used_barcodes.filter(String); // this filters for the barcodes that are currently being used starting from start_row to input_value

  // First barcode of a new run does not have a duplicate
  if (current_barcodes.length == 1) {
    return;
  
  // Count each element occurrence
  } else {
    const counts = {};
    for (const num of current_barcodes) {
      counts[num] = counts[num] ? counts[num] + 1 : 1;
    }
    occ_input = counts[input_value.getValues()];

    // Return if there is no duplicate
    if (occ_input == 1) {
      return;

    // Highlight if a duplicate
    } else {
      //input_value.setNote("duplicate!!");
      var used_barcodes_range = sheet.getRange("E2:E");
      var used_barcodes_values = used_barcodes_range.getValues();
      var row_end = used_barcodes_values.filter(String).length + 1;
      var format_range = "E" + row_start + ":E" + row_end;

      var rule_range = sheet.getRange(format_range);

      var rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(input_value.getValues())
      .setBackground("#F4CCCC")
      .setRanges([rule_range])
      .build();

      var rules = sheet.getConditionalFormatRules();
      rules.push(rule);
      sheet.setConditionalFormatRules(rules);

      return;
    }
  } 
}
