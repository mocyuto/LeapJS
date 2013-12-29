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

function openPicts(pictId, length){
    pictId = "#" + pictId;
    var leftPos = 300;
    var topPos = 300;
    var stopPos = 50;
    $(function(){
        for(i = 0; i < length; i++) {
            console.log(pictId);
            $(pictId + " img#rightTop" + (i + 1))
                .stop(true,true)
                .animate({left:leftPos + "px", top:topPos + "px"})
                .animate({left:stopPos + "px"});
            leftPos += 5;
            topPos += 5;
            stopPos += 150;
        }
        $("body").css("background-color","rgba(51, 51, 51, 0.8)");
        $("img#pictBtn").stop(true,true).show();
        });
}

function closePict(startId, length){
    startId = "#" + startId;
    var leftPos = 5;
    var topPos = 5;
    $(function() {
        for (i = 0; i < length; i++) {
            $(startId + " img#rightTop" + (i + 1))
                .stop(true,true)
                .animate({left:leftPos + "px", top:topPos + "px"});
            if (i <4) {
                leftPos += 5;
                topPos += 5;
            }
        }
        $("body")
            .css("background-color","white");
        $("img#pictBtn").css("display","none");
    });
}
// Tells the controller what to do every time it sees a frame
controller.on( 'frame' , function( data ){
        // Assigning the data to the global frame object
        frame = data;
        // Clearing the drawing from the previous frame
        c.clearRect( 0 , 0 , width , height );
        for( var i = 0; i < frame.gestures.length; i++ ){
            var gesture = frame.gestures[i];
            var type = gesture.type;
            if (type == "keyTap") {
                console.log("keyTap");
                openPicts();
            }
            else if(type == "screenTap") {
                console.log("screenTap");
                $(function(){$("#animeTarget").animate({left:"0",top:"0"});
                    });
            } else if (type == "circle") {
                console.log("circle");
            } else if (type=="swipe") {
                console.log("swipe");
            }

        }

        for( var i=0; i < frame.hands.length; i++ ){

            // For each hand we define it
            var hand = frame.hands[i];

            // and get its position, so that it can be passed through
            // for drawing the connections
            //var handPos = leapToScene( frame , hand.palmPosition );

            count = 10000;
            // Loop through all the fingers of the hand we are on
            for( var j = 0; j < hand.fingers.length; j++ ){

                // Define the finger we are looking at
                var finger = hand.fingers[j];

                // and get its position in Canvas
                var fingerPos = leapToScene( frame , finger.tipPosition );

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

// http://www.jplayer.org/latest/developer-guide/#jPlayer-option-ready
function startMovie(){
    $(document).ready(function(){
        $("#videos").jPlayer({
            ready: function () {
                $(this).jPlayer("setMedia", {
                    m4v: "test.m4v"
                });
            },
            swfPath: "/js",
            supplied: "m4v"
        });
    });
}

$(function () {
    var pictId = "openTarget";
    var openedId = "opened";
    var startId = "animeTarget";
    $("#"+startId).hover(
        function(){
            $("#"+startId).attr("id",pictId);
            var len = $("#" + pictId + " *").length;
            openPicts(pictId, len);
            $("#"+pictId).attr("id",openedId);
        }
    );
    $("#pictBtn").click(
        function(){
            var len = $("#" +openedId + " *").length;
            closePict(openedId, len);
            setTimeout(function(){
                $("#"+openedId).attr("id", startId)
            },800)
    });
});


