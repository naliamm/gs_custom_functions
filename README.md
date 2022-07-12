# Google Sheets Custom Functions
**Background context:** In lab, we sequence a lot of samples. Some of these samples are sequenced using bulk ATAC [(Buenrostro et al., 2013)](https://www.nature.com/articles/nmeth.2688) and some are sequenced using SHARE-seq [(Ma et al., 2020)](https://www.sciencedirect.com/science/article/pii/S0092867420312538). This means that we have a lot of samples to keep track of, with the different projects that's going on and the barcodes that are being added to the samples.

Currently, a Google Sheets is being used to keep track of the samples. The custom functions shared here are used to add more features to the Google Sheets to track the samples before and after they were sequenced.

**How to use:**<br>
Add the function(s) to the Google Sheets Apps Script. To do this, click on Extensions > Apps Script.
Column A of the Google Sheets should be named "Row Index" and contains sequential numbers starting from 1. So, cell A1 would have the value "Row Index". Cell A2 would have the value 1. I probably should provide a Google Sheets template but one could change some parts of the custom functions to suit their own Sheets template. The only thing necessary is the Row Index but everything else depends on what the Sheets is being used for.

**Custom functions:**<br>
1) `highlightDuplicate()`<br>
Highlight cells with similar barcodes in the same sequencing run. This does not avoid samples to be barcoded with the same sequences but it will notify user that two samples have the same barcodes. In lab, we have an additional measure to make sure each person uses specific barcodes that are unique only to them, so there is little change of using the same barcode for two different samples. So in theory, hopefully we will never have to see this function runs, but in the event that barcodes are being used >1 in the same run, we have a way to catch that.<br>
2) `emailNewSamplesAdded()`<br>
This function was created to keep track of samples in the masterlist and those in the input Google Sheets. The email part is just to notify me if there have been new samples added and if there are any changes to the previous samples. Perhaps one could use other methods of notification, but it's easier for me to use email because once I get to my desk every morning, I will have received an email of the changes made to the masterlist.
For this function, I'm using it to send me an email update every morning. To do this on Apps Script, follow the instructions here: https://developers.google.com/apps-script/guides/triggers/installable
