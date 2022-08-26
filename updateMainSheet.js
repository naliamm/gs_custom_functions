/**
 * Mainly a constructor of information for each set of sheets that need to be updated
 * 
 */
class DataType {
  /**
   * @param {string} dataName - name of the data type. This will be used as row name in the resulting email
   * @param {Apps Script sheet object}
   * @param {App Script sheet object}
   */
  constructor(dataName, sourceSheet, mainSheet) {
    this.dataName = dataName;
    this.sourceSheet = sourceSheet;
    this.mainSheet = mainSheet;

    let textFinder = sourceSheet.createTextFinder('Row Index'); //Both sheets should have the same startRow
    let startRow = textFinder.findNext().getRow();

    this.sourceCurrentIndex = parseInt(getLastIndex(sourceSheet, startRow));
    this.mainCurrentIndex = parseInt(getLastIndex(mainSheet, startRow));
    this.sourceFirstIndex = parseInt(sourceSheet.getRange("A" + (startRow+1)).getValues()[0][0]);
  
    this.sourceSamples = (sourceSheet
    .getRange("A2:A" + getLastRowInColumn(sourceSheet, "B"))
    .getValues())
    .filter(Number)
    .flat();
    
    this.mainSamples = (mainSheet
    .getRange("A2:A" + getLastRowInColumn(mainSheet, "B"))
    .getValues())
    .filter(Number)
    .flat();
  }
}

/**
 * Get the rows that have mismatched values between SOURCE_SHEET and MAIN_SHEET
 * @param {int} stopIndex
 * @return {array} mismatchedRows
 */
function findMismatchedRows(temp) {
  if (temp.sourceFirstIndex == temp.mainCurrentIndex + 1) {
    return "First samples of new run do not have mismatched rows.";
  
  } else {
    var mismatchedRows = new Object();
    let stopRowInSource = findA1RowGivenIndex(temp.sourceSheet, temp.mainCurrentIndex);
  
    var sourceRowsToCheck = temp.sourceSheet
    .getRange("A2:K" + stopRowInSource)
    .getValues();

    for (let i = 0; i < sourceRowsToCheck.length; i++) {
      // Get each row
      let sampleRowInMain = findA1RowGivenIndex(temp.mainSheet, sourceRowsToCheck[i][0]);
      let sampleInMain = temp.mainSheet.getRange("A" + sampleRowInMain + ":K" + sampleRowInMain).getValues();

      let rowIndex = "Row Index " + sourceRowsToCheck[i][0];
      let mismatchedCols = new Array();
      
      // Check each column of each row
      for (let j = 0; j < sourceRowsToCheck[0].length; j++) {
        if (sourceRowsToCheck[i][j] instanceof Date) {
          let sourceTime = sourceRowsToCheck[i][j].getTime();
          let mainTime = sampleInMain[0][j].getTime();

          if (sourceTime !== mainTime) {
            mismatchedCols.push(j+1);
            mismatchedRows[rowIndex] = mismatchedCols;
            continue;
          }

        } else if (sourceRowsToCheck[i][j] != sampleInMain[0][j]) {
          mismatchedCols.push(j+1);
          mismatchedRows[rowIndex] = mismatchedCols;
        }
      }
    }
  
    if (Object.keys(mismatchedRows).length === 0) {
      return "No mismatched rows";
    } else {
      return Object.entries(mismatchedRows);
    }
  }
}

/**
 * Get the last index for the given sheet. Last index is defined by row index with the highest number
 * @param {object} sheet - The sheet to find last index for
 * @return {int} lastIndex - The highest row index number
 */
function getLastIndex(sheet, startRow) {
  let lastSample = getLastRowInColumn(sheet, "B");
  let lastIndex = sheet.getRange("A" + lastSample).getValues();
  
  // no new run
  if (String(lastIndex) == "Row Index") {
    return 0;
  }
  
  return lastIndex;
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
  var colValues = sheet.getRange(column + "1:" + column + lastContent).getValues();
  // var colValues = colRange.getValues();
  // var lastRow = colValues.length;
  const lastRow  = lastContent - colValues.reverse().findIndex(c=>c[0]!='');
  return lastRow;
}

/**
 * Copy new samples to the MAIN_SHEET by the row index. This function will find the row index in
 * MAIN_SHEET, and add sample information to that row.
 * @param {array} sampleIndex - An array of row index for the new samples 
 */
function copyNewSamples(sampleIndex, temp) {
  for (let i = 0; i < sampleIndex.length; i++){
    let sourceRowNum = findA1RowGivenIndex(temp.sourceSheet, parseInt(sampleIndex[i]));
    let mainRowNum = findA1RowGivenIndex(temp.mainSheet, parseInt(sampleIndex[i]));

    let sourceRangeToCopy = temp.sourceSheet.getRange("B" + sourceRowNum + ":K" + sourceRowNum);
    let valuesToCopy = sourceRangeToCopy.getValues();
    let mainRangeToPaste = temp.mainSheet.getRange("B" + mainRowNum + ":K" + mainRowNum); 

    mainRangeToPaste.setValues(valuesToCopy);
  }
  
  return;
}

/**
 * Send email to me of the status for new samples and mismatched rows.
 * @param {array} updateData - an array of objects. Each object is a row in the resulting email and each
 * object contains the row name, information about new samples and information about mismatched rows.
 */
function sendEmail(updateData) {
  var htmlTemplate = HtmlService.createTemplateFromFile("emailTemplate.html");
  htmlTemplate.data = updateData;
  var htmlBody = htmlTemplate.evaluate().getContent();
  
  MailApp.sendEmail({
    to: "<email-here>",
    subject: "<email-subject-here>",
    htmlBody: htmlBody
  });
}
