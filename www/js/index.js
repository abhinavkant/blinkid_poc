// Application Constructor
function initialize() {
  document.addEventListener(
    "deviceready",
    this.onDeviceReady.bind(this),
    false
  );
}

// deviceready Event Handler
//
// Bind any cordova events here. Common events are:
// 'pause', 'resume', etc.
function onDeviceReady() {
  this.receivedEvent("deviceready");
  this.initHardware();
}

function initHardware() {
  if (typeof LineaProCDV === "undefined") {
    return;
  }
  try {
    LineaProCDV.initDT(
      function(connectionState) {
        console.log("connectionCallback, connectionState" + connectionState);
        if (connectionState === 2) {
          document.getElementById("btnScan").style.display = "inline";
        }
        document.getElementById("divLog").innerHTML =
          "Connection State = " +
          connectionState +
          "<br/>" +
          document.getElementById("divLog").innerHTML;
        log("Connection State = " + connectionState);
      },
      function() {
        console.log("cardDataCallback");
      },
      barcCallback,
      function() {
        console.log("cancelCallback");
      },
      function() {
        console.log("errorCallback");
      }
    );
  } catch (err) {
    document.getElementById("divLog").innerHTML =
      "LineaProCDV.initDT Failed" + err;
    console.error("LineaProCDV.initDT Failed", err);
  }
}

function barcCallback(data) {
  log("barcCallback");
  log("Data" + JSON.stringify(data));
  LineaProCDV.barcodeStop();
  if(data.rawCodesArr && data.rawCodesArr.length > 0) {
    var dataArray = data.rawCodesArr;
    for(var i =0; i <= dataArray.length;i++) {
        processScanedBarCode(dataArray[0]);
    }
  }
  
}

function log(msg) {
  document.getElementById("divLog").innerHTML =
    msg + "<br/>" + document.getElementById("divLog").innerHTML;
}

function onScan() {
  setTimeout(function() {
    LineaProCDV.barcodeStop();
    log(" sled timed out");
  }, 10000);
  log("LineaProCDV.barcodeStart");
  LineaProCDV.barcodeStart();
}

function processScanedBarCode(data) {
    // to scan EU driver's licences, use EudlRecognizer
    var eudlRecognizer = new cordova.plugins.BlinkID.EudlRecognizer();
    eudlRecognizer.returnFaceImage = true;
    eudlRecognizer.returnFullDocumentImage = true;

    // if you also want to obtain camera frame on which specific recognizer has
    // finished its recognition, wrap it with SuccessFrameGrabberRecognizer and use
    // the wrapper instead of original for building RecognizerCollection
    var eudlSuccessFrameGrabber = new cordova.plugins.BlinkID.SuccessFrameGrabberRecognizer(eudlRecognizer);

    // to scan US driver's licenses, use UsdlRecognizer
    var usdlRecognizer = new cordova.plugins.BlinkID.UsdlRecognizer();

    var usdlSuccessFrameGrabber = new cordova.plugins.BlinkID.SuccessFrameGrabberRecognizer(usdlRecognizer);
    
    // to scan any machine readable travel document (passports, visa's and IDs with 
    // machine readable zone), use MrtdRecognizer
    var mrtdRecognizer = new cordova.plugins.BlinkID.MrtdRecognizer();
    mrtdRecognizer.returnFullDocumentImage = true;

    var mrtdSuccessFrameGrabber = new cordova.plugins.BlinkID.SuccessFrameGrabberRecognizer(mrtdRecognizer);

    // there are lots of Recognizer objects in BlinkID - check blinkIdScanner.js for full reference

    var documentOverlaySettings = new cordova.plugins.BlinkID.DocumentOverlaySettings();

    // create RecognizerCollection from any number of recognizers that should perform recognition
    var recognizerCollection = new cordova.plugins.BlinkID.RecognizerCollection([eudlSuccessFrameGrabber, usdlSuccessFrameGrabber, mrtdSuccessFrameGrabber]);

    // package name/bundleID com.microblink.blinkid
    var licenseKeys = {
        android: 'sRwAAAAWY29tLm1pY3JvYmxpbmsuYmxpbmtpZJ9ew00uWSf86/ux5PUoKjyTpOK/Xi9t7cx7ZuiLoN86RhkY28pvSxf0MuuwpIa3oFeAFWqNOB+joH0zcxSCfOp5wSZFvatFB0TFDUubaP6X+iJQtok7/qx3Ioy503yXeyQPJG/Grr510Gh3q4n1kgy+U3ZEsYusp/UN8CdExK/+gW2UL5d3iKzqNeAonpVDPS3B70fRUcm8abLqxYyjSjZp/1Pum4Fdye7AlcGXnv3vnB2O7g4LrJ419mNaOg==',
        ios: 'sRwAAAEXY29tLnBob2VuaXgucG9jLnNjYW5uZXLaEbVreLGtRnPFycFWkUBZHc3PMvC2PLb1ASM+bp2dyHML2Kby2e1/bXWFB9dJ9PHMQt1kcZGZIe+l85dOFml5o5J6YnDeGYbi/PtjZGgrCOg00HZugUjYFf+zJxmY/sk4l7ja2kLrVPuSjBmF2Ysv5wHSlaBfkEFO7XB9Q/DAAkfEl7lku4SKCvdCmIZj8nNqiCeRXy5KQYK/rA+FoDVjwOKLflqdZtE5b5ZG3HNE4iv00mcOLPg7l1x0VAo='
    };

    cordova.plugins.BlinkID.processRawData(
        function callback(cancelled) {
            log("cordova.plugins.BlinkID.processRawData => Success");
        },
        // Register the error callback
        function errorHandler(err) {
            alert('Error: ' + err);
        },

        documentOverlaySettings, recognizerCollection, licenseKeys, data
    );
}

function scanWithCamera() {

}

// Update DOM on a Received Event
function receivedEvent(id) {
  var parentElement = document.getElementById(id);
  var listeningElement = parentElement.querySelector(".listening");
  var receivedElement = parentElement.querySelector(".received");

  listeningElement.setAttribute("style", "display:none;");
  receivedElement.setAttribute("style", "display:block;");

  console.log("Received Event: " + id);

  var el = document.getElementById("btnScan");
  el.addEventListener("click", onScan, false);
}

initialize();
