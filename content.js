// Does Hulu disable PiP due to FCC regulation? According to bug report below, YouTube TV team can't enable [PiP] w/o subtitles.
// If bug resolved or document PiP implemented, probably won't need this extension... Or can improve.
// - Bug report: https://bugs.chromium.org/p/chromium/issues/detail?id=854935
// - Document PiP Intent to Prototype: https://groups.google.com/a/chromium.org/g/blink-dev/c/jr2fQUh6xEI

// Receive alerts that Hulu has changed to ensure PiP and proper media controls are added and STICKY.
// TODO: Can remove background.js in favor of message receiver? I don't think so because the page stays loaded,
//       and script is not triggered again. Should test and research more though.
const getHuluMessage = async (request, sender, sendResponse) => { // async to avoid console errors.
    if (request.message === "HuluChanged") {
        // Enable PiP and add media controls
        try {
            // Make sure everything necessary is visible
            let videoPlayer = document.querySelector("#content-video-player"),
                adPlayer = document.querySelector("#ad-video-player"),
                introPlayer = document.querySelector("#intro-video-player");

            let inBrowserPip = document.body.contains(document.querySelector(".Player__container--modal"));

            if (document.body.contains(videoPlayer) ||
                document.body.contains(adPlayer) ||
                document.body.contains(introPlayer)) {

                let activePip = document.pictureInPictureElement;

                // TODO: Event listener?
                // Just check for browserPip w/in addMediaControls???
                if (inBrowserPip) {
                    // Play/pause only
                    addMediaControls(minimal = true);
                } else {
                    // Full controls
                    addMediaControls(minimal = false);
                }

                if (videoPlayer) {
                    videoPlayer.removeAttribute("disablepictureinpicture");
                    videoPlayer.onplay = (event) => {
                        if (activePip) {
                            videoPlayer.requestPictureInPicture();
                        }
                    };
                }

                if (introPlayer) {
                    introPlayer.removeAttribute("disablepictureinpicture");
                    introPlayer.onplay = (event) => {
                        if (activePip) {
                            introPlayer.requestPictureInPicture();
                        }
                    };
                }

                if (adPlayer) {
                    adPlayer.removeAttribute("disablepictureinpicture");
                    adPlayer.onplay = (event) => {
                        // Remove forward/backward seek on ads only...
                        // TODO: Relocate to addMediaControls() in some fashion
                        navigator.mediaSession.setActionHandler("seekforward", null);
                        navigator.mediaSession.setActionHandler("seekbackward", null);
                        if (activePip) {
                            // Ad player is constantly loading in data, so possible to request PiP before video ready
                            // (even when it's already playing... but whatever)
                            adPlayer.onloadedmetadata = function() {
                                adPlayer.requestPictureInPicture();
                            };
                        }
                    };
                }

                // TODO: Figure this out; never triggered...
                //       But kind of nice to leave it open so next video will start PiP.
                // let closeButton = document.querySelector(".CloseButton");
                // if (closeButton) {
                //     closeButton.onClick = (event) => {
                //         console.log("close clicked")
                //         document.exitPictureInPicture();
                //     }
                // }

                // TODO: Handle via listeners instead of checking for PiP element?
                //       Doesn't work properly as-is; after a few clicks, both buttons are treated as same element
                // let minimizeButton = document.querySelector(".PlayerButton.MinimizeButton");
                // if (minimizeButton)
                // {
                //   minimizeButton.onclick = (event) => {
                //     console.log("min click")
                //     addMediaControls(minimal=true);
                //   }
                // }
                // let maximizeButton = document.querySelector(".PlayerButton.MaximizeButton");
                // if (maximizeButton)
                // {
                //   maximizeButton.onclick = (event) => {
                //     console.log("max click")
                //     addMediaControls(minimal=false);
                //   }
                // }
            }
        } catch (error) {
            console.error(error);
        }
    }
}

// TODD: Lol. Again, attempt to remove need for background.js, or clean this and background.js up + add comments.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //avoid console errors...
    getHuluMessage(request, sender, sendResponse);
    setTimeout(function() {
        sendResponse({
            status: true
        });
    }, 1);
    return true;
});

// Enable desired media controls
// https://developer.mozilla.org/en-US/docs/Web/API/MediaSession
function addMediaControls(minimal = false) {
    try {
        // Use Hulu's buttons so video isn't out of sync w/ their player,
        //   i.e., Do not use videoPlayer.pause(), don't set videoPlayer.currentTime to seek or restart, etc.

        //TODO: Set media image and title here? The data has to be on the page...

        // All videos have play/pause...
        try {
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
            for (const [action, handler] of fullscreenHandlers) {
                try {
                    navigator.mediaSession.setActionHandler(action, handler);
                } catch (error) {
                    console.log(`The media session action "${action}" is not supported yet.`);
                }
            }
        } else {
            // null to hide
            navigator.mediaSession.setActionHandler("seekforward", null);
            navigator.mediaSession.setActionHandler("seekbackward", null);
            navigator.mediaSession.setActionHandler("nexttrack", null);
            navigator.mediaSession.setActionHandler("previoustrack", null);
        }

    } catch (error) {
        console.error(error);
    }
}
