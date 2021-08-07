var fullscreen =false;
    function requestFullScreen(element) {
      let btn = document.getElementById('fullscreen-btn');
      if(!fullscreen){
        // Supports most browsers and their versions.
        var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

        if (requestMethod) { // Native full screen.
            requestMethod.call(element);
        } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{F11}");
            }
        }
        btn.classList.remove('fullscreen');
        btn.classList.add('exit-fullscreen');
      } else {
        if(document.exitFullscreen) {
          document.exitFullscreen();
        } else if(document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if(document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        
        btn.classList.remove('exit-fullscreen');
        btn.classList.add('fullscreen');
      }
      
      fullscreen = !fullscreen;
    }      
