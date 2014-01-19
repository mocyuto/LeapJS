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
    thumbImg:"img#leftTop",
    openedId:"opened",
    pictFirstId:"animeTarget",
    pictSecondId:"openTarget",
    thumbId:"#rightTop",
    movieClass:"video",
    cancelBtn:"img#cancelBtn",
    lightbox:"div#lightbox",
    lightboxCancel:"div.lb-closeContainer a.lb-close"
}

var hoverCount = {
    cancel:0,
    showMovie: 0,
    showPict: 0
};

// This is how long does it wait to act event.
var waitCount = 25;

function openPicts(tags){
    $("#"+ tags.pictFirstId).attr("id", tags.pictSecondId);
    var pictId = "#" + tags.pictSecondId;
    var length = $(pictId + " *").length;
    var leftPos = 300;
    var topPos = 300;
    var stopPos = 50;
    $(function(){
        $(pictId)
            .stop(true,true)
            .animate({top:topPos + "px"});

        /*
        for(i = 0; i < length; i++) {
            $(pictId + " " + tags.thumbImg + (i + 1))
                .stop(true,true)
                .animate({left:leftPos + "px", top:topPos + "px"})
                .animate({left:stopPos + "px"});
            leftPos += 5;
            stopPos += 150;
        }*/

        $("body").css("background-color","rgba(51, 51, 51, 0.8)");
        $(tags.cancelBtn).stop(true,true).show();
    });
    $(pictId).attr("id",tags.openedId)
        .css({width:"100%", height:"150px"});
}

function closePict(tags){
    var imgId = "#" + tags.openedId;
    var length = $(imgId + " *").length;
    var leftPos = 5;
    var topPos = 5;
    $(function() {
        $("body")
            .stop(true,true)
            .css("background-color","white");
        $(tags.cancelBtn).css("display","none");
        for (i = 0; i < length; i++) {
            $(imgId + " "+ tags.thumbImg + (i + 1))
                .animate({left:leftPos + "px", top:topPos + "px"});
            if (i <4) {
                leftPos += 5;
                topPos += 5;
            }
        }
    });
    $("#"+tags.openedId)
        .animate({top:"0px",width:leftPos + "px"})
        .attr("id", tags.pictFirstId)
        .css({position:"absolute"});

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
    var leftPos = 1000;
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

/*
* @return [x,y]
* 1,0 : right
* -1.0 : left
* 0.1 : up
* 0,-1 : bottom
*/
var swiper = controller.gesture("swipe");
var tolerance = 50;
swiper.update(function(g) {
    var xTrans = g.translation()[0];
    var yTrans = g.translation()[1];
    if (Math.abs(xTrans) > tolerance || Math.abs(yTrans) > tolerance) {
        var xDir = Math.abs(xTrans) > tolerance ? (xTrans > 0 ? -1 : 1) : 0;
        var yDir = Math.abs(yTrans) > tolerance ? (yTrans < 0 ? -1 : 1) : 0;

        if (xDir===0 && yDir===1){ // swipe up
            removePopup();
        } else if (xDir===0 && yDir===-1){ // swipe down

        } else if (xDir===1 && yDir===0) { // swipe right
            scrollImages("right");
        } else if (xDir===-1 && yDir ===0){ // swipe left
            scrollImages("left");
        }
    }
});

// if popup is visible, swipe to hide.
var removePopup = function(){
    if ($(htmlTags.lightbox).css("display")!=="none"){
        $(htmlTags.lightboxCancel).click();
    }
}

var scrollImages = _.debounce(function(direction){
    var picts = "#" + htmlTags.openedId;
    if ($(picts).length !== 0) {
        if (direction === "left"){
            console.log("swipe left");
            $(picts).scrollTo({left:"+=50",top:"+=0"},"normal");
        } else if (direction === "right"){
            console.log("swipe right");
            $(picts).scrollTo({left:"-=50",top:"+=0"},"normal");
        }
    }
},200);

// Tells the controller what to do every time it sees a frame
controller.on( 'frame' , function( data ){
    // Assigning the data to the global frame object
    frame = data;
    // Clearing the drawing from the previous frame
    c.clearRect( 0 , 0 , width , height );

    for( var i=0; i < frame.hands.length; i++ ){

        // For each hand we define it
        var hand = frame.hands[i];

        // and get its position, so that it can be passed through
        // for drawing the connections
        //var handPos = leapToScene( frame , hand.palmPosition );

        // Loop through all the fingers of the hand we are on
        for( var j = 0; j < hand.fingers.length; j++ ){

            // finger touch some object or not
            var isTouch = false;

            // Define the finger we are looking at
            var finger = hand.fingers[j];

            // and get its position in Canvas
            var fingerPos = leapToScene( frame , finger.tipPosition );
            // object position
            function touchObject(tag,cancel){
                var id = tag;
                if($(id).length===0){return {};}
                return {
                    tags:{
                        /*
                        left: +$(id).css("left").slice(0,-2),
                        top: +$(id).css("top").slice(0,-2),
                         */
                        left: +$(id).offset().left,
                        top: +$(id).offset().top,
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

            // show Pict
            var pictThumb = new touchObject("#"+htmlTags.pictFirstId + " "+ htmlTags.thumbImg + "1","false");
            var showPictCount = hoverCounter(c, fingerPos, pictThumb.tags, hoverCount.showPict);
            hoverCount.showPict += showPictCount;
            if (showPictCount===1){isTouch=true;}
            if (hoverCount.showPict > waitCount ){
                console.log("hover to open");
                openPicts(htmlTags);
                hoverCount.showPict = 0;
            }

            // popup Pict
            var pictId = "#" + htmlTags.openedId;
            var length = $(pictId + " img").length;
            var popupTag = "popupPict";
            for (var k = 0; k < length; k++){
                var pict = new touchObject(pictId + " " + htmlTags.thumbImg + (k+1),"false");
                var popupPictCount = hoverCounter(c, fingerPos, pict.tags, hoverCount[popupTag+k]);
                if (popupPictCount===1){isTouch=true;}
                hoverCount[popupTag+k] += popupPictCount;
                if (hoverCount[popupTag+k] > waitCount ){
                    $(pictId+ " " + htmlTags.thumbImg + (k+1)).click();
                    hoverCount[popupTag+k] = 0;
                }
            }

            // show movie
            var movieThumb = new touchObject(htmlTags.thumbId,"false");
            var showMovieCount = hoverCounter(c, fingerPos, movieThumb.tags, hoverCount.showMovie);
            hoverCount.showMovie += showMovieCount;
            if (showMovieCount===1){isTouch=true;}
            if (hoverCount.showMovie > waitCount ){
                showMovie(htmlTags);
                hoverCount.showMovie = 0;
            }

            // cancelMovie
            var cancelBtn = new touchObject(htmlTags.cancelBtn,"true");
            var cancelCount = hoverCounter(c, fingerPos, cancelBtn.tags, hoverCount.cancel);
            hoverCount.cancel += cancelCount;
            if (cancelCount===1){isTouch=true;}
            if (hoverCount.cancel > waitCount ){
                closeMovie(htmlTags);
                closePict(htmlTags);
                hoverCount.cancel = 0;
            }
            if (!isTouch) {
                for (var cnt in hoverCount){
                    if (hoverCount.hasOwnProperty(cnt)){
                        hoverCount[cnt] = 0;
                    }
                }
            }
            /*
             finger position
             and hoverCount
             */
            var tmp = $("#"+htmlTags.openedId+" "+htmlTags.thumbImg+2).offset();
            if (tmp!==null&&false){
            $("#point").text(Math.round(fingerPos[0])+": "+tmp.left+", "
                             +Math.round(fingerPos[1])+": "+tmp.top+ ","
                            + JSON.stringify(hoverCount));
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
    if(touchObj===undefined){return 0;}
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
        canvasInstance.arc(fingerPos[0], fingerPos[1], 25, 0, Math.PI*touchCount/waitCount*2);
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
    $("#"+htmlTags.pictFirstId).click(
        function(){
            console.log("click to open");
            openPicts(htmlTags);
        }
    );
    $(htmlTags.cancelBtn).click(
        function(){
            if ($(htmlTags.cancelBtn).hasClass(htmlTags.movieClass)) {
                console.log("movie close");
                closeMovie(htmlTags);
            } else {
                console.log("picture close");
                closePict(htmlTags);
            }
        }
    );
    $(htmlTags.thumbId).click(
        function(){
            showMovie(htmlTags);
        }
    );
});

