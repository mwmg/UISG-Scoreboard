$(document).ready(function(){
	//******** Automatic choosing of sport specific form **********
	//independent fields:
	var sport = $('#form_sport_type input:radio[name=sport]');
	//dependent fields:
	var football = $('#form_football_settings');
	var volleyball = $('#form_volleyball_settings')
	var all = football.add(volleyball);
	sport.change(function(){
		var value = this.value;
		all.addClass('hidden');
		if(value === 'football') football.removeClass('hidden');
		if(value === 'volleyball') volleyball.removeClass('hidden');
	});
	//***** Step by step form logic ************
	//credits go to thecodeplayer.com
	var current_fs, next_fs, previous_fs; //fieldsets
	var left, opacity, scale; //fieldset properties which we will animate
	var animating; //flag to prevent quick multi-click glitches
	var fields_filled = false;

	//add changed flag to fields
	$(".form_field").change(function(){
		$(this).addClass('field_changed');
		//special case for radio
		if($(this).is('input:radio')){
			$(this).parent().siblings('label.radio').each(function(){
				$(this).children('input:radio').addClass('field_changed');
			});
		}
	});
	$(".next").click(function(){
		if(animating) return false;
		animating = true;
		
		current_fs = $(this).parent();
		next_fs = $(this).parent().next();
		//check if fields are filled out
		fields_filled = true;
		current_fs.children('label').each(function(){
			if(!$(this).children('input').hasClass('field_changed')){
				fields_filled = false;
			}
		});
		console.log(fields_filled);
		if(!fields_filled){
			$(this).prev('.form_alert').text("Please fill out all fields");
			animating = false;
			return false;
		}
		$(this).prev('.form_alert').text("");
		//activate next step on progressbar using the index of next_fs
		$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
		
		//show the next fieldset
		next_fs.show(); 
		//hide the current fieldset with style
		current_fs.hide();
		animating = false;
	});
	$(".previous").click(function(){
		if(animating) return false;
		animating = true;
		
		current_fs = $(this).parent();
		previous_fs = $(this).parent().prev();
		//de-activate current step on progressbar
		$("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
		
		//show the previous fieldset
		previous_fs.show(); 
		//hide the current fieldset with style
		current_fs.hide();
		animating = false;
	});
});