onmessage = function (ev) { 
    setInterval(function () { 
        postMessage(""); 
    }, 30 * 60 * 1000);
};