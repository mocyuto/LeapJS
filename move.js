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

function openPicts(){
    $(function(){
            $("#animeTarget img#rightTop1")
                .stop(true,true)
                .animate({left:"300px", top:"300px"})
                .animate({left:"50px"});
            $("#animeTarget img#rightTop2")
                .stop(true,true)
                .animate({left:"305px", top:"305px"})
                .animate({left:"200px"});
            $("#animeTarget img#rightTop3")
                .stop(true,true)
                .animate({left:"310px",top:"310px"})
                .animate({left:"350px"});
        }, function(){$("#animeTarget")
                   .stop(true,true)
                   .animate({left:"20px",top:"300px"});
        });
}

function movePicts(){
    $(function() {$("div img#rightTop2").animate({left:"20px",top:"300px"});
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

$(function () {
        $("#animeTarget").hover(
                                function(){
                                    openPicts();
                                }
                                );
    });


