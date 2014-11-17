(function () {
    var beginPath = false;
    var position = { x: null, y: null };
    var color = "#000";
    var canvas, ctx = null;


    function beginDrawLine(event) {
        canvasObj.beginDraw(event.layerX, event.layerY);
    }

    function continueDrawLine(event) {
        canvasObj.continueDraw(event.layerX, event.layerY);
    }

    function endDraw(event) {
        canvasObj.endDraw();
    }

    window.canvasObj = canvasObj = {
        createCanvas: function (id) {
            canvas = document.getElementById(id);
            ctx = canvas.getContext('2d');
            canvas.addEventListener('mousedown', beginDrawLine);
            canvas.addEventListener('mouseup', endDraw);
            canvas.addEventListener('mouseleave', endDraw);
            canvas.addEventListener('mousemove', continueDrawLine);
        },
        beginDraw: function (x, y) {
            if (!beginPath) {
                ctx.beginPath();
                position.x = x;
                position.y = y;
                beginPath = true;
                ctx.moveTo(x, y);
                ctx.lineTo(x + 1, y + 1);
                ctx.strokeStyle = color;
                ctx.stroke();
                ctx.closePath();
            }
        },
        continueDraw : function(x,y){
            if (beginPath) {
                beginPath = false;
                ctx.beginPath();
                ctx.moveTo(position.x, position.y);
                ctx.lineTo(x, y);
                position.x = x;
                position.y = y;
                ctx.strokeStyle = color;
                ctx.stroke();
                beginPath = true;
                ctx.closePath();

            }
        },
        endDraw: function () {
            beginPath = false;
            ctx.closePath();
        },
        changeColor: function (c) {
            color = "#" + c;
        },
        clearCanvas: function () {
            ctx.clearRect(0, 0, 350, 350);
        }
    }
})();


