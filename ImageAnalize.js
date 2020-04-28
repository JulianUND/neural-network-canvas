
var ImageAnalize = function(){
    var sizeZone = 10;
    
    function init(size){
        sizeZone = size;
    }
    
    function get(canvasId, imgClass){
        var c = document.getElementById(canvasId);
        var ctx = c.getContext("2d");
        
        if(imgClass !== ""){
            var img = document.getElementsByClassName(imgClass);
            var w = c.width = img[0].width;
            var h = c.height = img[0].height;
            var out = [];
            
            for (var i = 0; i < img.length; i++) {
                ctx.drawImage(img[i], 0, 0);
                var inputs = analize(ctx, w, h);
                var salida = parseInt(img[i].getAttribute("data-value"));
                //var main = parseInt(img[i].getAttribute("data-main"));
                out.push({in: inputs, out:[0], id: salida});
            }
            
            return out;
        }else{
            var w = c.width;
            var h = c.height;
            return analize(ctx, w, h);
        }
    }
    
    function analize(ctx, w, h){
        var incX = w / sizeZone;
        var incY = h / sizeZone;
        
        var inputs = [];
        
        var colstart = 0;
        var colstartok = false;
        
        for (var s = 0; s < w; s+=incX){
            for (var n = 0; n < h; n+=incY){
                var imgData = ctx.getImageData(s, n, incX, incY);
                var oscuro = 0;
                for (var i = 0; i < imgData.data.length; i+=4){
                    var r = imgData.data[i];
                    var g = imgData.data[i+1];
                    var b = imgData.data[i+2];
                    if(r < 100 && g < 100 && b < 100){
                        oscuro=1;
                    }
                }
                inputs.push(oscuro);
                if(oscuro === 0 && !colstartok){
                    colstart++;
                }else{
                    colstartok = true;
                }
            }
        }
        
        var count = parseInt(colstart/sizeZone);
        var temp = [];
        
        for(var n=count*sizeZone; n < inputs.length;n++){
            temp.push(inputs[n]);
        }
        var inicio = temp.length;
        for(var n=inicio; n < inputs.length;n++){
            temp.push(0);
        }        
        return temp;  
    }
    
    return {
        init : init,
        get : get,
        analize : analize
    };
};
