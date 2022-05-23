// Receive alerts that Hulu has changed to ensure PiP and proper media controls are added and STICKY
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // setTimeout(function() {
  //
  // }, 1000);
  console.log("too many changes crashes chrome? what is happening here?");
  sendResponse({status: true});
  if (request.message === 'HuluChanged') {
      // Enable PiP and add media controls
      try {
          // Make sure everything necessary is visible
          let video = document.querySelector('#content-video-player');
          let inBrowserPip = document.querySelector(".Player__container--modal");
          //let fastForwardButton = document.querySelector(".FastForwardButton");
          if (document.body.contains(video)) {
              console.log("Video");
              if (video.getAttribute("src")) {
                  if (document.body.contains(inBrowserPip)) {
                      // Partial media controls
                      console.log("Partial");
                      addMediaControls(minimal = true);
                  } else {
                      // Full media controls
                      console.log("Full");
                      addMediaControls(minimal = false);
                  }
                  // Remove the PiP disabler
                  console.log("Bye");
                  video.removeAttribute('disablepictureinpicture');
              }
          }
      } catch (error) {
          console.log(error);
      }
  }
  return true;
});

// Enable desired media controls
// https://developer.mozilla.org/en-US/docs/Web/API/MediaSession
function addMediaControls(minimal = false) {
    try {
        // Does Hulu disable PiP due to FCC regulation? According to bug report below, YouTube TV team can't enable [PiP] w/o subtitles.
        // If bug resolved or document PiP implemented, probably won't need this extension... Or can improve.
        // - Bug report: https://bugs.chromium.org/p/chromium/issues/detail?id=854935
        // - Document PiP Intent to Prototype: https://groups.google.com/a/chromium.org/g/blink-dev/c/jr2fQUh6xEI

        // Use Hulu's buttons so video isn't out of sync w/ their player,
        //   i.e., Do not use video.pause(), don't set video.currentTime to seek or restart, etc.

        // All videos have play/pause...
        try {
            console.log("Play/pause");
            navigator.mediaSession.setActionHandler("play", function() {
                // Click the play button
                document.querySelector(".PlayButton").click();
            });
            navigator.mediaSession.setActionHandler("pause", function() {
                // Click the pause button
                document.querySelector(".PauseButton").click();
            });
        } catch (error) {
            console.error(error);
        }

        // Only full page videos have these controls
        const fullscreenHandlers = [
            [
                'seekforward',
                () => {
                    // Click the seek forward [10 secs] button
                    document.querySelector(".FastForwardButton").click();
                }
            ],
            [
                'seekbackward',
                () => {
                    // Click the seek backward [10 secs] button
                    document.querySelector(".RewindButton").click();
                }
            ],
            [
                'nexttrack',
                () => {
                    // Click the next episode button
                    document.querySelector(".UpNextButton").click();
                }
            ],
            [
                'previoustrack',
                () => {
                    // Click the restart episode button
                    document.querySelector("div[aria-label='START OVER']").click();
                }
            ]
        ]

        // Set the extra media handlers if we're not watching via in-browser PiP
        if (minimal === false) {
            console.log("Rewind, etc.");
            for (const [action, handler] of fullscreenHandlers) {
                try {
                    navigator.mediaSession.setActionHandler(action, handler);
                } catch (error) {
                    console.log(`The media session action "${action}" is not supported yet.`);
                }
            }
        }
        else
        {
            console.log("null controls");
            // null to hide?
            // https://www.w3.org/TR/mediasession/#:~:text=When%20the%20update,the%20handler.
            navigator.mediaSession.setActionHandler("seekforward", null);
            navigator.mediaSession.setActionHandler("seekbackward", null);
            navigator.mediaSession.setActionHandler("nexttrack", null);
            navigator.mediaSession.setActionHandler("previoustrack", null);
        }

    } catch (error) {
        console.error(error);
    }
}
