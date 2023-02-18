const DEV_CONSOLE_STRING = "/_ui/common/apex/debug/ApexCSIPage";
const LIGHTNING_URL = "lightning.force.com";
const CLASSIC_URL = "salesforce.com";
const LIGHTNING_RECORD_RE = /(\/lightning\/r\/[A-Z,a-z]*\/)([A-Z,a-z,0-9]{18})(\/)/gm;
const CLASSIC_RECORD_RE = /(salesforce\.com\/)([A-Z,a-z,0-9]{15})$/gm;

// action for copying record id
document
  .getElementById("record-id-copy")
  .addEventListener("click", (event) => {
    copyRecordId(event);
  });

// action for navigating to a record by the record id
document
  .getElementById("record-id-button")
  .addEventListener("click", (event) => {
    goToRecord();
  });

// action for opening to the dev console
document
  .getElementById("open-dev-button")
  .addEventListener("click", (event) => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      // open the dev console in a new tab
      let splitURL = tabs[0].url.split("/");
      browser.tabs
        .create({
          url: splitURL[0] + "//" + splitURL[2] + DEV_CONSOLE_STRING,
          openerTabId: tabs[0].id,
        })
        .then(window.close());
    });
  });

document.getElementById("record-id-div").addEventListener("keyup", (event) => {
  if (event.code === "Enter") {
    goToRecord();
  }
});

function onLoad() {
  // get the current tab url and close the window if it is not an SF domain
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    let url = tabs[0].url;
    if (!url.includes(CLASSIC_URL) && !url.includes(LIGHTNING_URL)) {
      // close the window
      window.close();
    }
    // if we are not on a record page, disable to copy id button
    let re = LIGHTNING_RECORD_RE;
    if(url.includes(CLASSIC_URL)){
      re = CLASSIC_RECORD_RE;
    }
    let result = re.exec(url);
    if(!result){
      document.getElementById("record-id-copy").setAttribute("disabled",true);
    }
    
  });
}

function goToRecord() {
  // get the record id from the input box
  let recordId = document.getElementById("record-id-input").value;
  // if a record id is supplied then get the active tab and navigate to
  // the record
  if (recordId != null && recordId !== "") {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      let url = tabs[0].url;
      let splitURL = tabs[0].url.split("/");
      // create the destination url
      let destinationURL;
      if (url.includes(LIGHTNING_URL)) {
        destinationURL =
          splitURL[0] +
          "//" +
          splitURL[2] +
          "/lightning/r/" +
          recordId +
          "/view";
      } else {
        destinationURL = splitURL[0] + "//" + splitURL[2] + "/" + recordId;
      }
      // if we are in the dev console then open the destination in a new tab
      if (url.includes(DEV_CONSOLE_STRING)) {
        browser.tabs
          .create({
            url: destinationURL,
            openerTabId: tabs[0].id,
          })
          .then(window.close());
      } else {
        browser.tabs
          .update({
            url: destinationURL,
            active: true,
          })
          .then(window.close());
      }
    });
  }
}

function copyRecordId(event) {
  browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
    let url = tabs[0].url;
    let re = LIGHTNING_RECORD_RE;
    // handle if sf classic is being used
    if(url.includes(CLASSIC_URL)){
      re = CLASSIC_RECORD_RE;
    }
    let result = re.exec(url);
    // copy to clipboard
    if(result){
      navigator.clipboard.writeText(result[2]);
    }
    // set the button to disabled and change the text to copied
    event.target.setAttribute("disabled", true);
    event.target.innerHTML = "Copied";
  })

}

onLoad();
