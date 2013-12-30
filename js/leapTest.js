// Get the canvas DOM element 
var canvas = document.getElementById('canvas');

// Making sure we have the proper aspect ratio for our canvas
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// Create the context we will use for drawing
var c =  canvas.getContext('2d');

// Save the canvas width and canvas height
// as easily accesible variables
var width = canvas.width;
var height = canvas.height;

var controller = new Leap.Controller();

controller.on( 'frame' , function(frame){
    
    // Clears the canvas so frames don't build on each other.
    c.clearRect(0, 0, width, height);
    
    // Gets the number of fingers in each frame
    var numberOfFingers = frame.fingers.length;
    
    // Defines the font shape and size
    c.font = "400px Arial";
    
    // Tells Canvas how to align text
    c.textAlign = 'center';
      c.textBaseline = 'middle';
    
    // Tells Canvas to draw the The number of fingers,
    // at the center of the canvas
    c.fillText( numberOfFingers , width/2 , height/2 );
    
    
});

controller.connect();
