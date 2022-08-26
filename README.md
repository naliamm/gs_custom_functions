# Google Sheets Custom Functions
**Background context:** In lab, we sequence a lot of samples. Some of these samples are sequenced using bulk ATAC [(Buenrostro et al., 2013)](https://www.nature.com/articles/nmeth.2688) and some are sequenced using SHARE-seq [(Ma et al., 2020)](https://www.sciencedirect.com/science/article/pii/S0092867420312538). This means that we have a lot of samples to keep track of, with the different projects that's going on and the barcodes that are being added to the samples.

Currently, a Google Sheets is being used to keep track of the samples. The custom functions shared here are used to add more features to the Google Sheets to track the samples before and after they were sequenced.

**How to use:**<br>
Add the function(s) to the Google Sheets Apps Script. To do this, click on Extensions > Apps Script.
Column A of the Google Sheets should be named "Row Index" and contains sequential numbers starting from 1. So, cell A1 would have the value "Row Index". Cell A2 would have the value 1. I probably should provide a Google Sheets template but one could change some parts of the custom functions to suit their own Sheets template. The only thing necessary is the Row Index but everything else depends on what the Sheets is being used for.

Each of the file will have its own separate script file in Apps Script, so in total, there are 4 script files on Apps Script for one spreadsheet. This spreadsheet contains multiple sheet tabs. Notably, for each type of experiment (i.e.; Bulk ATAC or SHARE-seq), there will be two sheet tabs namely the source sheet (where lab members input their samples information) and the main sheet (masterlist of all samples from previous runs until the current run).

**Note:**<br>
Make sure to install trigger for the functions onEdit() and updateMainSheet(). To do this on Apps Script, follow the instructions here: https://developers.google.com/apps-script/guides/triggers/installable

The updateMainSheet() function is a time-triggered event. The way I use this function is to notify me by email every morning of what changes have been done to the Spreadsheet. I use daily trigger that runs once between the time 8AM-9AM.
