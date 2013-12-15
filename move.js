$(function(){
    $('#icon a img').hover(function(){
        $(this).animate({
            left:'500',
            top:'200'
        });
        }, function(){
            $(this).stop().animate({left:0},150);
        });
});
