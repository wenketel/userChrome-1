(function()
{
    // create 'Restart' menuitem
    var menuitem = document.createElement("menuitem");
    menuitem.setAttribute("label", "Restart");
    menuitem.setAttribute("class", "menuitem-iconic");
    menuitem.setAttribute("style", "list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8%2F9hAAAABGdBTUEAAK%2FINwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHsSURBVDjLtZPpTlpRFIV5Dt7AOESr1kYNThGnSomIihPoNVi5Qp3RgBgvEERpRW1BRBAcMEDUtIkdjKk4otK0Jdr2vgxZ3kA0MYoaG3%2BcX2evb529zt4sAKz%2FOawnASgCBNm5LaE7vjVDutkA4mMdLV4TkvcCuvba2Iqd1pDhWA33mQU%2B2oXVv07YfpoxuNWFuqVXoeqFCnZcgJwRm04p%2BGk3Fs9t8PyZx%2FK5Hfbf03CGLRj62g2%2BrSR0K0D%2BvZXUB1Xw%2Fou5usJWjAaU0Gz3w%2FrjHey%2FZjDLvKTD34KSyXzyBkC2JaYd4feMqyNa3OQTREQePlXjrqSq5ssj5hMjTMd66ALDKDLm0jcA0s%2BNID6JIFmvQaNXANEKX3l5x7NyqTcb7Zg8GYtCOLoXuPcbha6XV0VlU4WUzE9gPKjF2CGFbE3G3QAmafDnShETF3iKTZyIblcNza4Syi%2FdeD6USscFCJwV6Fwn8NonQak5Hy1L9TAcjkJ%2FoAG1p0a1hYdnfcnkrQCBoxyyNYLp1YCJoB7GIwqGgxGod%2FoZsQoNDiHSepNCceeAN8uF1CvGxJE25rofc%2B3blKPqQ2VUnKxIYN85yty3eWh216LeKUTOSCayVGlIH0g5S%2B1JJB%2B8Cxxt1rWkH7WNTNIPAlwA9Gm7OcXUHxUAAAAASUVORK5CYII%3D)");
    menuitem.addEventListener("command", function()
    {
        const APP_START = Components.classes['@mozilla.org/toolkit/app-startup;1'].getService(Components.interfaces.nsIAppStartup);
        APP_START.quit(APP_START.eRestart | APP_START.eAttemptQuit);
    }, false);
    // insert 'Restart' menuitem before 'File' > 'Exit'
    document.getElementById("menu_FilePopup").insertBefore(menuitem, document.getElementById("menu_FileQuitItem"));
})();