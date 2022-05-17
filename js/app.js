// replace these values with those generated in your TokBox Account
var apiKey = '47454541';
var sessionId = '1_MX40NzQ1NDU0MX5-MTY1MTA1MjY5NjA3NX56QWxOaFQ1RmFLSjVCdWZKd0lmdzA2SFJ-fg';
var token = 'T1==cGFydG5lcl9pZD00NzQ1NDU0MSZzaWc9MjJlY2IwMGVjYjU2NWFlZGI4NDMwMDhiZmViMzdmZTlhMzVmN2FjYTpzZXNzaW9uX2lkPTFfTVg0ME56UTFORFUwTVg1LU1UWTBOVGMwT1RRMU16WTJPSDQ0Ym5oUk1FOW5TR1F5YXpGb1V6RlFOM3BqTmpacGFsbC1mZyZjcmVhdGVfdGltZT0xNjQ1NzQ5NDcyJm5vbmNlPTAuMjIzODY4ODE3NjMxMzI4Mzgmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTY0ODM0MTQ2OSZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ==';

//alert(token);

// create canvas on which DeepAR will render
var deepARCanvas = document.createElement('canvas');

// Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1572422
// canvas.captureStream causes an error if getContext not called before. Chrome does not need the line below.
var canvasContext = deepARCanvas.getContext('webgl'); 
var mediaStream = deepARCanvas.captureStream(25);
var videoTracks = mediaStream.getVideoTracks();

// start DeepAR
startDeepAR(deepARCanvas);

// start video call
initializeSession(videoTracks[0]);


// Handling all of our errors here by alerting them
function handleError(error) {
  console.log('handle error', error);
  if (error) {
    alert(error.message);
  }
}


function initializeSession(videoSource) {
  var session = OT.initSession(apiKey, sessionId);

  // Create a publisher
  var publisher = OT.initPublisher('publisher', {
    insertMode: 'append',
    width: '100%',
    height: '100%',
    videoSource: videoSource
  }, handleError);

  // Connect to the session
  session.connect(token, function(error) {
    // If the connection is successful, publish to the session
    if (error) {
      console.log("SESSION CONNECT ERROR", error)
      handleError(error);
    } else {
      console.log("SESSION CONNECT SUCCESS")
      session.publish(publisher, handleError);
    }
  });
  session.on('streamCreated', function(event) {
    console.log("STREAM CREATED", event)
    session.subscribe(event.stream, 'subscriber', {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    }, handleError);
  });
}

function startDeepAR(canvas) {

  var deepAR = DeepAR({ 
    canvasWidth: 640, 
    canvasHeight: 480,
    licenseKey: 'af41f3db1a418eb9dc8f339c05fe8408a7ea9c152f16dc4f1dff13d16974c4cda2c4a2f15ef854cc',
    libPath: './../deepar',
    segmentationInfoZip: 'segmentation.zip',
    canvas: canvas,
    numberOfFaces: 1,
    onInitialize: function() {
      // start video immediately after the initalization, mirror = true
      deepAR.startVideo(true);

      deepAR.switchEffect(0, 'slot', './effects/aviators', function() {
        // effect loaded
      });
  
    }
  });


  deepAR.downloadFaceTrackingModel('./deepar/models-68-extreme.bin');

  var filterIndex1 = 0;
  var filterIndex2 = 0;
  var filterIndex3 = 0;
  var filters1 = ['./effects/lion','./effects/background_segmentation'];
  var filters2 = ['./effects/aviators','./effects/background_segmentation'];
  var filters3 = ['./effects/background_segmentation','./effects/background_blur'];
  var changeFilterButton1 = document.getElementById('change-filter-button1');
  var changeFilterButton2 = document.getElementById('change-filter-button2');
  var changeFilterButton3 = document.getElementById('change-filter-button3');
  changeFilterButton1.onclick = function() {
    filterIndex1 = (filterIndex1 + 1) % filters1.length;
    deepAR.switchEffect(0, 'slot', filters1[filterIndex1]);
  }

    changeFilterButton2.onclick = function() {
    filterIndex2 = (filterIndex2 + 1) % filters2.length;
    deepAR.switchEffect(0, 'slot', filters2[filterIndex2]);
  }
	
	  changeFilterButton3.onclick = function() {
    filterIndex3 = (filterIndex3 + 1) % filters3.length;
    deepAR.switchEffect(0, 'slot', filters3[filterIndex3]);
  }

  // Because we have to use a canvas to render to and then stream to the
  // Vonage publisher, changing tabs has to pause the video streaming otherwise it will cause a crash
  // by pausing the 'window.requestAnimationFrame', more can be seen in the documentation:
  // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
  var visible = true;
  document.addEventListener("visibilitychange", function (event) {
    visible = !visible;
    // pause and resume are not required, but it will pause the calls to 'window.requestAnimationFrame' 
    // and the entire rendering loop, which should improve general performance and battery life
    if (!visible) {
      deepAR.pause()
      deepAR.stopVideo();
    } else {
      deepAR.resume();
      deepAR.startVideo(true)
    }
  })
}



