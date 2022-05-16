var pageLoadCheck = setInterval(addPip, 3000);

function addPip() {
    try {
        let videoPlayer = document.getElementById('content-video-player');
        videoPlayer.removeAttribute("disablepictureinpicture");

        const skipTime = 10;
        const actionHandlers = [
          [
            'play',
            async function() {
              await videoPlayer.play();
              navigator.mediaSession.playbackState = "playing";
            }
          ],
          [
            'pause',
            () => {
              videoPlayer.pause();
              navigator.mediaSession.playbackState = "paused";
            }
          ],
          [
            'seekforward',
            () => {
              videoPlayer.currentTime = Math.max(videoPlayer.currentTime + skipTime, 0);
            }
          ],
          [
            'seekbackward',
            () => {
              videoPlayer.currentTime = Math.max(videoPlayer.currentTime - skipTime, 0);
            }
          ]
        ]

        for (const [action, handler] of actionHandlers) {
          try {
            navigator.mediaSession.setActionHandler(action, handler);
          }
          catch (error) {
            console.log(`The media session action "${action}" is not supported yet.`);
          }
        }

        clearInterval(pageLoadCheck);
    }
    catch (error) {
        console.error(error);
    }
}
