// Get the canvas DOM element
var canvas = document.getElementById('canvas');

// Making sure we have the proper aspect ratio for our canvas
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// Create the context we will use for drawing
var c =  canvas.getContext('2d');

/*

 The leapToScene function takes a position in leap space
 and converts it to the space in the canvas.

 It does this by using the interaction box, in order to
 make sure that every part of the canvas is accesible
 in the interaction area of the leap

 */
function leapToScene( frame , leapPos ){

    // Gets the interaction box of the current frame
    var iBox = frame.interactionBox;

    // Gets the left border and top border of the box
    // In order to convert the position to the proper
    // location for the canvas
    var left = iBox.center[0] - iBox.size[0]/2;
    var top = iBox.center[1] + iBox.size[1]/2;

    // Takes our leap coordinates, and changes them so
    // that the origin is in the top left corner
    var x = leapPos[0] - left;
    var y = leapPos[1] - top;

    // Divides the position by the size of the box
    // so that x and y values will range from 0 to 1
    // as they lay within the interaction box
    x /= iBox.size[0];
    y /= iBox.size[1];

    // Uses the height and width of the canvas to scale
    // the x and y coordinates in a way that they
    // take up the entire canvas
    x *= width;
    y *= height;

    // Returns the values, making sure to negate the sign
    // of the y coordinate, because the y basis in canvas
    // points down instead of up
    return [ x , -y ];

}

// Save the canvas width and canvas height
// as easily accesible variables
var width = canvas.width;
var height = canvas.height;

// Creating a global Frame variable that we can access
// throughout the program
var frame;

// Creates our Leap Controller
var controller = new Leap.Controller({enableGestures:true});

// html tags
var htmlTags = {
    pictId:"openTarget",
    thumbImg:"img#leftTop",
    openedId:"opened",
    startId:"animeTarget",
    thumbId:"#rightTop",
    movieClass:"video",
    cancelBtn:"img#cancelBtn"
}

function openPicts(tags){
    var pictId = "#" + tags.pictId;
    var length = $(pictId + " *").length;
    var leftPos = 300;
    var topPos = 300;
    var stopPos = 50;
    $(function(){
        for(i = 0; i < length; i++) {
            $(pictId + " " + tags.thumbImg + (i + 1))
                .stop(true,true)
                .animate({left:leftPos + "px", top:topPos + "px"})
                .animate({left:stopPos + "px"});
            leftPos += 5;
            topPos += 5;
            stopPos += 150;
        }
        $("body").css("background-color","rgba(51, 51, 51, 0.8)");
        $(tags.cancelBtn).stop(true,true).show();
        });
}

function closePict(tags){
    var startId = "#" + tags.startId;
    var length = $("#" + tags.openedId + " *").length;
    var leftPos = 5;
    var topPos = 5;
    $(function() {
        $("body")
            .stop(true,true)
            .css("background-color","white");
        $(tags.cancelBtn).css("display","none");
        for (i = 0; i < length; i++) {
            $(startId + " "+ tags.thumbImg + (i + 1))
                .animate({left:leftPos + "px", top:topPos + "px"});
            if (i <4) {
                leftPos += 5;
                topPos += 5;
            }
        }
    });
}

function showMovie(tags){
    var leftPos = 300;
    var topPos = 300;
    $(function(){
        $(tags.thumbId)
            .stop(true,true)
            .animate({left:leftPos, top:topPos,width:"300",height:"300"});
        setTimeout(
            function() {
                $(tags.cancelBtn)
                    .stop(true,true)
                    .addClass(tags.movieClass)
                    .css({left:leftPos+640,top:100})
                    .show();
                $(tags.thumbId).css("display","none");
                $("video").css({visibility:"visible"});
                var video = $('video').get(0);
                video.currentTime = 0;
                video.play();
            },500);
        $("body").css("background-color","rgba(51, 51, 51, 0.8)");
    });
}

function closeMovie(tags) {
    var leftPos = 940;
    var topPos = 10;
    $(function() {
        $("body")
            .stop(true,true)
            .css("background-color","white");
        $(tags.cancelBtn)
            .css("display","none")
            .removeClass(tags.movieClass);
        $("video").css("visibility","hidden");
        $(tags.thumbId)
            .show()
            .animate({left:leftPos, top:topPos,width:"100",height:"100"});
    });
}

var hoverCount = {
    cancelMovie:0,
    cancelPict: 0,
    showMovie: 0,
    showPict: 0
}
// Tells the controller what to do every time it sees a frame
controller.on( 'frame' , function( data ){
    // Assigning the data to the global frame object
    frame = data;
    // Clearing the drawing from the previous frame
    c.clearRect( 0 , 0 , width , height );
    /*
    for( var i = 0; i < frame.gestures.length; i++ ){
        console.log("2");
        var gesture = frame.gestures[i];
        var type = gesture.type;
        if (type === "keyTap") {
            console.log("keyTap");
            showMovie("#rightTop","movie","img#cancelBtn");
        }
        else if(type === "screenTap") {
            console.log("screenTap");
            $(function(){$("#animeTarget").animate({left:"0",top:"0"});
                        });
        } else if (type === "circle") {
            console.log("circle");
        } else if (type==="swipe") {
            console.log("swipe");
        }

    }
     */

    for( var i=0; i < frame.hands.length; i++ ){

        // For each hand we define it
        var hand = frame.hands[i];

        // and get its position, so that it can be passed through
        // for drawing the connections
        //var handPos = leapToScene( frame , hand.palmPosition );

        // Loop through all the fingers of the hand we are on
        for( var j = 0; j < hand.fingers.length; j++ ){

            // Define the finger we are looking at
            var finger = hand.fingers[j];

            // and get its position in Canvas
            var fingerPos = leapToScene( frame , finger.tipPosition );
            // cancelBtn position
            function touchObject(tag,cancel){
                var id = tag;
                return {
                    tags:{
                        left: +$(id).css("left").slice(0,-2),
                        top: +$(id).css("top").slice(0,-2),
                        width: +$(id).width(),
                        height:+$(id).height(),
                        status: function(){
                            var display = $(id).css("display");
                            if (display.length === 0){
                                if ($(id).css("visibility")==="hidden"&&!cancel
                                   ||$(id).css("visibility")==="visible"&&cancel){return true;}
                                else {return false;}
                            } else {
                                if (display==="none"&&!cancel
                                   ||display!=="none"&&cancel){return true;}
                                else {return false;}
                            }
                        }
                    }
                };
            }
            var cancelBtn = new touchObject(htmlTags.cancelBtn,"true");
            var movieThumb = new touchObject(htmlTags.thumbId,"false");
            $("#point").text(Math.round(fingerPos[0])+": "+cancelBtn.tags.left+", "
                             +Math.round(fingerPos[1])+": "+ cancelBtn.tags.top);

            // show movie
            hoverCount.showMovie += hoverCounter(c, fingerPos, movieThumb.tags, hoverCount.showMovie);
            if (hoverCount.showMovie === 0) {
                for (var cnt in hoverCount){
                    hoverCount.cnt = 0;
                }
            } else if (hoverCount.showMovie > 50 ){
                showMovie(htmlTags);
                hoverCount.showMovie = 0;
            }

            // cancelMovie
            hoverCount.cancelMovie += hoverCounter(c, fingerPos, cancelBtn.tags, hoverCount.cancelMovie);
            if (hoverCount.cancelMovie === 0) {
                for (var cnt in hoverCount){
                    cnt = 0;
                }
            } else if (hoverCount.cancelMovie > 50 ){
                closeMovie(htmlTags);
                hoverCount.cancelMovie = 0;
            }

            /*
             Draw the Finger
             */

            // Setting up the style for the stroke
            c.strokeStyle = "#39AECF";
            c.lineWidth = 5;
            // Creating the path for the finger circle
            c.beginPath();
            // Draw a full circle of radius 6 at the finger position
            c.arc(fingerPos[0], fingerPos[1], 20, 0, Math.PI*2);
            c.closePath();
            c.stroke();
        }
    }
});
controller.connect();

function hoverCounter(canvasInstance, fingerPos, touchObj, touchCount){
    if (touchObj.left < fingerPos[0]
        && fingerPos[0] < touchObj.left + touchObj.width
        && touchObj.top < fingerPos[1]
        && fingerPos[1] + 0 < touchObj.top + touchObj.height
        && touchObj.status()) {
        canvasInstance.strokeStyle = "#000";
        canvasInstance.lineWidth = 5;
        // Creating the path for the finger circle
        canvasInstance.beginPath();
        // Draw a full circle of radius 6 at the finger position
        canvasInstance.arc(fingerPos[0], fingerPos[1], 25, 0, Math.PI*touchCount/25);
        canvasInstance.stroke();
        return 1;
    }
    return 0;
}
// http://www.jplayer.org/latest/developer-guide/#jPlayer-option-ready
// did not use this function
function startMovie(){
    $(document).ready(function(){
        $("#videos").jPlayer({
            ready: function () {
                $(this).jPlayer("setMedia", {
                    m4v: "test.m4v",
                    ogv: "test.ogg",
                    webmv: "test.webm"
                });
            },
            swfPath: "../video",
            supplied: "m4v, ogv, webmv"
        });
        $("#inspector").jPlayerInspector({jPlayer:$("#jquery_jplayer_1")});
    });
}

$(function () {
    $("#"+htmlTags.startId).click(
        function(){
            $("#"+htmlTags.startId).attr("id",htmlTags.pictId);
            openPicts(htmlTags);
            $("#"+htmlTags.pictId).attr("id",htmlTags.openedId);
        }
    );
    $(htmlTags.cancelBtn).click(
        function(){
            if ($(htmlTags.cancelBtn).hasClass(htmlTags.movieClass)) {
                closeMovie(htmlTags);
            } else {
                closePict(htmlTags);
                $("#"+htmlTags.openedId).attr("id", htmlTags.startId);
            }
        }
    );
    $(htmlTags.thumbId).click(
        function(){
            showMovie(htmlTags);
        }
    );
});

