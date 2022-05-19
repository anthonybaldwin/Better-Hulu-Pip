// ❤ https://chrome.google.com/webstore/detail/hulu-pip/cjnnojbahbfmbhhpkcoihncbojdlhbnj
var pageLoadCheck = setInterval(addPip, 1000);

function addPip() {
    try {
        // Remove the attribute disabling PiP
        let videoPlayer = document.getElementById('content-video-player');
        videoPlayer.removeAttribute("disablepictureinpicture");

        // Does Hulu disable PiP due to FCC regulation? According to bug report below, YouTube TV team can't enable [PiP] w/o subtitles.
        // If bug resolved or document PiP implemented, probably won't need this extension... Or can improve.
        // - Bug report: https://bugs.chromium.org/p/chromium/issues/detail?id=854935
        // - Document PiP Intent to Prototype: https://groups.google.com/a/chromium.org/g/blink-dev/c/jr2fQUh6xEI

        // Enable desired media controls
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/playbackState
        const actionHandlers = [
            // Use Hulu's buttons so video isn't out of sync w/ their player,
            // i.e., Do not use videoPlayer.pause(), don't set video.currentTime to seek or restart, etc.
            [
                'play',
                async function() {
                    // Click the play button
                    await document.querySelector(".PlayButton").click();
                    navigator.mediaSession.playbackState = "playing";
                }
            ],
            [
                'pause',
                () => {
                    // Click the pause button
                    document.querySelector(".PauseButton").click();
                    navigator.mediaSession.playbackState = "paused";
                }
            ],
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

        // Set available action handlers
        for (const [action, handler] of actionHandlers) {
            try {
                navigator.mediaSession.setActionHandler(action, handler);
            } catch (error) {
                console.log(`The media session action "${action}" is not supported yet.`);
            }
        }

        // Clear interval if PiP attribute removed without errors
        clearInterval(pageLoadCheck);

    } catch (error) {
        console.error(error);
    }
}
