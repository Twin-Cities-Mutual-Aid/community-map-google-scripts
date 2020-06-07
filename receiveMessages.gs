function getMediaAssets(messageSid, accountSid, options) { 
  const reqUrl = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages/" + messageSid + "/Media.json";
  const response = UrlFetchApp.fetch(reqUrl,options);
  const assets = JSON.parse(response.getContentText()).media_list;
  
  var mediaLinks = [];
  for (var k = 0; k < assets.length; k++) {
    mediaLinks.push("https://api.twilio.com" + assets[k].uri.slice(0, assets[k].uri.length - 5));
  }
  return mediaLinks;
}

function myFunction() {
  const ACCOUNT_SID = "XXXXXXXXXXXXXXXX";
  const ACCOUNT_TOKEN = "XXXXXXXXXXXXXXXX";
  const toPhoneNumber = "+1XXXXXXXXXX";
  const numberToRetrieve = 200;
  const hoursOffset = 0;

  var options = {
    "method" : "get"
  };
  options.headers = {
    "Authorization" : "Basic " + Utilities.base64Encode(ACCOUNT_SID + ":" + ACCOUNT_TOKEN)
  };
  var url="https://api.twilio.com/2010-04-01/Accounts/" + ACCOUNT_SID + "/Messages.json?To=" + toPhoneNumber + "&PageSize=" + numberToRetrieve;
  var response = UrlFetchApp.fetch(url,options);

  // Parse any new JSON data and put it into the correct sheet page.
  var sheet = SpreadsheetApp.getActive().getSheetByName('Receive');
  // Find the first empty row / find the number of messages already added to the sheet
  var numEntries = sheet.getRange("C2:C").getValues().filter(Number).length;
  Logger.log(numEntries);
  var currRow = numEntries + 2; // add 2 to account for indexing + first row being filled with column info
  var startColumn = 1;
  var messageTextColumn = 5;
  var dataAll = JSON.parse(response.getContentText());
  
  // (length - numEntries - 1) to ignore the text messages that have already been added to the sheet
  for (var i = dataAll.messages.length - numEntries - 1; i >= 0; i--) {
    var currColumn = startColumn;
    // populate date and time columns
    rowDate = dataAll.messages[i].date_sent;
    var currDate = new Date (rowDate);
    if(isNaN(currDate.valueOf())) {
      currDate = 'Not a valid date-time';
      currColumn++;
      currColumn++;
    }
    else {
      currDate.setHours(currDate.getHours()+hoursOffset);
      sheet.getRange(currRow, currColumn).setValue(currDate);
      currColumn++;
      sheet.getRange(currRow, currColumn).setValue(currDate);
      currColumn++;
    }
    // populate phone numbers + message body columns
    sheet.getRange(currRow, currColumn).setValue(dataAll.messages[i].to);
    currColumn++;
    sheet.getRange(currRow, currColumn).setValue(dataAll.messages[i].from);
    currColumn++;
    sheet.getRange(currRow, currColumn).setValue(dataAll.messages[i].body);
    currColumn++;
    // populate image links column if media assets exist
    if (dataAll.messages[i].num_media > 0) {
      Logger.log("message with media assets: \n\n")
      Logger.log(dataAll.messages[i])
      var mediaLinks = getMediaAssets(dataAll.messages[i].sid, ACCOUNT_SID, options);
      mediaLinks = mediaLinks.join(", ");
      sheet.getRange(currRow, currColumn).setValue(mediaLinks);
      currColumn++;
    }
    currRow++;
  }
}