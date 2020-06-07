function sendSms(to, body) {
  const ACCOUNT_SID = "XXXXXXXXXXXXXXXX";
  const ACCOUNT_TOKEN = "XXXXXXXXXXXXXXXX";
  const fromPhoneNumber = "+1XXXXXXXXXX";
  
  var messages_url = "https://api.twilio.com/2010-04-01/Accounts/" + ACCOUNT_SID + "/Messages.json";

  var payload = {
    "To": to,
    "Body" : body,
    "From" : fromPhoneNumber
  };

  var options = {
    "method" : "post",
    "payload" : payload
  };

  options.headers = { 
    "Authorization" : "Basic " + Utilities.base64Encode(ACCOUNT_SID +":"+ ACCOUNT_TOKEN)
  };

  UrlFetchApp.fetch(messages_url, options);
}
 
function sendResponses() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('Receive');
  var startRow = 2; // start after column title row
  var responseColumn = 7; // response body column
  var sendColumn = 8; // whether to send / if already been sent
  
  var numEntries = sheet.getRange("C2:C").getValues().filter(Number).length;
  var endRow = numEntries + 2; // offset for column headers + no zero indexing
  for (var i = 2; i < endRow; i++) {
    var currRow = sheet.getRange(i, 1, 1, 8).getValues()[0]; // get the entire current row as an array
    Logger.log(currRow);
    var responseMessage = sheet.getRange(i, responseColumn).getDisplayValue();
    var readyToSend = sheet.getRange(i, sendColumn).getDisplayValue();
    if (responseMessage != "" && readyToSend === "READY") {
      try {
        response_data = sendSms(currRow[3], currRow[6]); // indexes based off of zero-indexed row array
        status = "SENT";
      } catch(err) {
        Logger.log(err);
        status = "ERROR";
      }
      sheet.getRange(i, sendColumn).setValue(status);
    }
  }
}