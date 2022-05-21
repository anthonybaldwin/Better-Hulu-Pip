document.addEventListener("DOMContentLoaded", function(event) {
    pip();
});

// ❤ https://greasyfork.org/en/scripts/381317-enable-pictureinpicture-hulu/code
function pip() {
    'use strict';
    let observer = new MutationObserver(function(mutations) {
        mutations.forEach((mutation) => {
            let video = document.querySelector('#content-video-player');
            if (document.body.contains(video)) {
                addMediaControls();
                video.removeAttribute('disablepictureinpicture');
                this.disconnect;
            }
        });
    });
    observer.observe(document.querySelector('body'), {
        attributes: true,
        childList: true
    });
}

// Enable desired media controls
// https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/playbackState
function addMediaControls() {
    try {
        // Does Hulu disable PiP due to FCC regulation? According to bug report below, YouTube TV team can't enable [PiP] w/o subtitles.
        // If bug resolved or document PiP implemented, probably won't need this extension... Or can improve.
        // - Bug report: https://bugs.chromium.org/p/chromium/issues/detail?id=854935
        // - Document PiP Intent to Prototype: https://groups.google.com/a/chromium.org/g/blink-dev/c/jr2fQUh6xEI

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
            // TODO: Watch for full page vs. in-browser PiP; Hulu toggles available buttons depending
            //       Or find alt. way to restart/next eps. that doesn't confuse Hulu's player(s)
            //       Change perm to cover all available PiP pages? "https://www.hulu.com/*"
        ]

        // Set available action handlers
        for (const [action, handler] of actionHandlers) {
            try {
                navigator.mediaSession.setActionHandler(action, handler);
            } catch (error) {
                console.log(`The media session action "${action}" is not supported yet.`);
            }
        }

    } catch (error) {
        console.error(error);
    }
}
