const SHARE_MAIN = SpreadsheetApp
.openByUrl("<url-here>")
.getSheetByName("<sheet-name-here>");

const SHARE_SOURCE = SpreadsheetApp
.openByUrl("<url-here>")
.getSheetByName("<sheet-name-here>");

const shareSeq = new DataType("SHARE-seq", SHARE_SOURCE, SHARE_MAIN);
const sheetsToUpdate = [shareSeq];

function updateMainSheet() {
  let updateData = [];

  for (let i = 0; i < sheetsToUpdate.length; i++) {
    updateData[i] = {};
    updateData[i].dataName = sheetsToUpdate[i].dataName;
//     Logger.log("Updating " + updateData[i].dataName); 

    // No new run
    if (sheetsToUpdate[i].sourceCurrentIndex == 0) {
    //TODO: draft email body, take into account sheet for each iteration
      updateData[i].newSamples = "No new run";
      updateData[i].mismatchedRows = "NA";
      continue;
    
    // New run, no new samples added
    } else if (sheetsToUpdate[i].sourceCurrentIndex == sheetsToUpdate[i].mainCurrentIndex) {
      let mismatchedRows = findMismatchedRows(sheetsToUpdate[i]);
      updateData[i].newSamples = "No new samples added";
      updateData[i].mismatchedRows = mismatchedRows;      
      continue;
      
    // New run, new samples added
    } else {
      const numNewSamples = sheetsToUpdate[i].sourceCurrentIndex - sheetsToUpdate[i].mainCurrentIndex;
      updateData[i].newSamples = numNewSamples + " new samples added";
      let mismatchedRows = findMismatchedRows(sheetsToUpdate[i]);
      updateData[i].mismatchedRows = mismatchedRows;

      // Copy first samples of a new run, do not have mismatched rows
      if (sheetsToUpdate[i].sourceFirstIndex == sheetsToUpdate[i].mainCurrentIndex + 1) {
          copyNewSamples(sheetsToUpdate[i].sourceSamples, sheetsToUpdate[i]);
          updateData[i].mismatchedRows = "First samples of a new run do not have mismatched rows";
          continue;
        
      // Copy subsequent samples of a new run 
      } else {
        let newSamples = sheetsToUpdate[i]
        .sourceSamples
        .filter(samples => !sheetsToUpdate[i].mainSamples.includes(samples));
        copyNewSamples(newSamples,sheetsToUpdate[i]);
        continue;
      }
    }
  }

//   Logger.log(updateData);
  sendEmail(updateData);
  return;
}
