function getMediaAssets(messageSid, accountSid, options) {
  const reqUrl =
    "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages/" + messageSid + "/Media.json";
  const response = UrlFetchApp.fetch(reqUrl, options);
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
  const numberToRetrieve = 1000;
  const hoursOffset = 0;

  var options = {
    "method": "get",
  };
  options.headers = {
    "Authorization": "Basic " + Utilities.base64Encode(ACCOUNT_SID + ":" + ACCOUNT_TOKEN),
  };
  var url =
    "https://api.twilio.com/2010-04-01/Accounts/" +
    ACCOUNT_SID +
    "/Messages.json?To=" +
    toPhoneNumber +
    "&PageSize=" +
    numberToRetrieve;
  var response = UrlFetchApp.fetch(url, options);

  // Parse any new JSON data and put it into the correct sheet page.
  var sheet = SpreadsheetApp.getActive().getSheetByName("Receive");
  // Find the first empty row / find the number of messages already added to the sheet
  const numberToRetrieve = 1000;
  const hoursOffset = 0;

  var options = {
    "method": "get",
  };
  options.headers = {
    "Authorization": "Basic " + Utilities.base64Encode(ACCOUNT_SID + ":" + ACCOUNT_TOKEN),
  };
  var url =
    "https://api.twilio.com/2010-04-01/Accounts/" +
    ACCOUNT_SID +
    "/Messages.json?To=" +
    toPhoneNumber +
    "&PageSize=" +
    numberToRetrieve;
  var response = UrlFetchApp.fetch(url, options);

  // Parse any new JSON data and put it into the correct sheet page.
  var sheet = SpreadsheetApp.getActive().getSheetByName("Receive");
  var currRow = 2; // 2 to account for non-zero indexing and the first row being filled with column info
  var startColumn = 1;
  var sidColumn = 9; // message ID column
  var dataAll = JSON.parse(response.getContentText());

  for (var i = dataAll.messages.length - 1; i >= 0; i--) {
    if (sheet.getRange(currRow, sidColumn).getValue() != dataAll.messages[i].sid) {
      sheet.insertRowBefore(currRow);
      var currColumn = startColumn;
      // populate date and time columns
      var rowDate = dataAll.messages[i].date_sent;
      var currDateTime = new Date(rowDate);
      var isAfterHours = false;
      if (isNaN(currDateTime.valueOf())) {
        currDateTime = "Not a valid date-time";
        currColumn++;
        currColumn++;
      } else {
        currDateTime = Utilities.formatDate(currDateTime, "America/Chicago", "yyyy-MM-dd HH:mm");
        var currDate = currDateTime.split(" ")[0];
        var currTime = currDateTime.split(" ")[1];
        var currHour = Number(currTime.split(":")[0]);
        if (currHour > 23 || currHour < 8) {
          isAfterHours = true;
        }
        sheet.getRange(currRow, currColumn).setValue(currDate);
        currColumn++;
        sheet.getRange(currRow, currColumn).setValue(currTime);
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
        var mediaLinks = getMediaAssets(dataAll.messages[i].sid, ACCOUNT_SID, options);
        mediaLinks = mediaLinks.join(", ");
        sheet.getRange(currRow, currColumn).setValue(mediaLinks);
      }
      currColumn++;
      if (isAfterHours) {
        sheet
          .getRange(currRow, currColumn)
          .setValue(
            "Twin Cities Mutual Aid: Thanks for your message. We are currently offline. We'll get back to you starting at 8am CT"
          );
        currColumn++;
        sheet.getRange(currRow, currColumn).setValue("READY");
      }
      sheet.getRange(currRow, sidColumn).setValue(dataAll.messages[i].sid);
    }
    currRow++;
  }
}
