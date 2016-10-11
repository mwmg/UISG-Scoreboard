$(document).ready(function(){
	$(document).scroll(function(){
		var docScroll = $(document).scrollTop(), topOffset = 30;
		// Only change transparency if content is below navbar
		if(docScroll >= topOffset){
			$('.navbar').css({
				'background': 'rgba(255,255,255,0.8)',
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
});