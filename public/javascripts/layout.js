$(document).ready(function(){
	$(document).scroll(function(){
		var docScroll = $(document).scrollTop(), topOffset = 30;
		// Only change transparency if content is below navbar
		if(docScroll >= topOffset){
			$('.navbar').css({
				'background': 'rgba(255,255,255,1)',
				'-webkit-transition': 'background 0.5s',
				'-moz-transition': 'background 0.5s',
				'-o-transition': 'background 0.5s',
				'transition': 'background 0.5s'
			});
		}else{
			$('.navbar').css({
				'background': 'rgba(255,255,255,0)',
				'-webkit-transition': 'background 0.5s',
				'-moz-transition': 'background 0.5s',
				'-o-transition': 'background 0.5s',
				'transition': 'background 0.5s'
			});
		}
	});
	if($(window).height() > 740){
		$('.collapse').addClass('in');
		$('.comment-box').css('height','150px');
		$('#input-message').attr('rows','1');
		$('#input-message').parent().removeClass('col-xs-8');
		$('#input-send').parent().removeClass('col-xs-4');
		$('#input-username').css('width','20%');
		$('#input-message').css('width','65%');
		$('#input-send').css('width','10%');
		$('#input-username').css('margin-top','20px');
		$('#input-message').css('margin-top','20px');
	}
});