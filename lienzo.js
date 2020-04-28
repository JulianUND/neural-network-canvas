var Lienzo = function(){
    var canvasId = "";
    var canvas, ctx, flag = false,
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0,
        dot_flag = false;

    var x = "#000", y = 5;
    
    function init(cid){
        canvasId = cid;
        
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext("2d");
                
        canvas.addEventListener("mousemove", function (e) {
            findxy('move', e);
        }, false);
        canvas.addEventListener("mousedown", function (e) {
            clear();
            findxy('down', e);
        }, false);
        canvas.addEventListener("mouseup", function (e) {
            findxy('up', e);
        }, false);
        
        canvas.addEventListener("mouseout", function (e) {
            findxy('out', e);
        }, false);
    }
    
    function clear(){
        canvas = document.getElementById(canvasId);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    function draw() {
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.strokeStyle = x;
        ctx.lineWidth = y;
        ctx.stroke();
        ctx.closePath();
    }

    function findxy(res, e) {
        var position = getPosition(canvas);
        
        if (res === 'down') {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - position.left;
            currY = e.clientY - position.top;

            flag = true;
            dot_flag = true;
            if (dot_flag) {
                ctx.beginPath();
                ctx.fillStyle = x;
                ctx.fillRect(currX, currY, 2, 2);
                ctx.closePath();
                dot_flag = false;
            }
        }
        if (res === 'up' || res === "out") {
            flag = false;
        }
        if (res === 'move') {
            if (flag) {
                prevX = currX;
                prevY = currY;
                currX = e.clientX - position.left;
                currY = e.clientY - position.top;
                draw();
            }
        }
    }
    
    function getPosition(element){
        var top = 0, left = 0;
        do {
            top += element.offsetTop  || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while(element);
        
        var doc = document.documentElement;
        left -= (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
        top -= (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
        
        return {
            top: top,
            left: left
        };
    }
    
    function generateThumbnail(callBack) {
        var thumbnailImage = new Image();

        thumbnailImage.onload = function() {
            var thumbnailCanvas = document.getElementById(canvasId);
            var ctx = thumbnailCanvas.getContext("2d");
            
            ctx.drawImage(thumbnailImage, 0, 0);
            
            callBack(true);
        };
        thumbnailImage.src = document.getElementById(canvasId).toDataURL();
    }
    
    return {
        init : init,
        clear : clear,
        draw : draw,
        findxy : findxy,
        getPosition: getPosition,
        generateThumbnail : generateThumbnail
    };
};