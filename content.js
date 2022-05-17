var pageLoadCheck = setInterval(addPip, 1000);

function addPip() {
    try {
        let videoPlayer = document.getElementById('content-video-player');
        videoPlayer.removeAttribute("disablepictureinpicture");

        // Hopefully one of these resolved someday for PiP subtitles:
        // - Chrome spec suggestion: https://groups.google.com/a/chromium.org/g/blink-dev/c/jr2fQUh6xEI
        // - Bug report: https://bugs.chromium.org/p/chromium/issues/detail?id=854935
        // let videoContainer = document.getElementById('dash-player-container');

        const actionHandlers = [
            // Use Hulu's buttons so video isn't out of sync w/ their player
            [
                'play',
                async function() {
                    await document.querySelector(".PlayButton").click();
                    navigator.mediaSession.playbackState = "playing";
                }
            ],
            [
                'pause',
                () => {
                    document.querySelector(".PauseButton").click();
                    navigator.mediaSession.playbackState = "paused";
                }
            ],
            [
                'seekforward',
                () => {
                    document.querySelector(".FastForwardButton").click();
                }
            ],
            [
                'seekbackward',
                () => {
                    document.querySelector(".RewindButton").click();
                }
            ],
            [
                'nexttrack', //next episode
                () => {
                    document.querySelector(".UpNextButton").click();
                }
            ],
            [
                'previoustrack', //start over
                () => {
                    document.querySelector("div[aria-label='START OVER']").click();
                }
            ]
        ]

        for (const [action, handler] of actionHandlers) {
            try {
                navigator.mediaSession.setActionHandler(action, handler);
            } catch (e) {
                console.log(`The media session action "${action}" is not supported yet.`);
            }
        }

        clearInterval(pageLoadCheck);

    } catch (e) {
        console.error(e);
    }
}
