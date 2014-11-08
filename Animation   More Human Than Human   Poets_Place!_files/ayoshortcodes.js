jQuery(document).ready(function($) {
	// Alert
	function ayoAlert() {
		if(jQuery().alert) {
			$(".ayo_alert").alert();
		}
	}

	// Tooltip
	function ayoTooltip(){
		if( jQuery().tooltip ) {
		    $( ".ayo_tooltip" ).tooltip();
		}
	}

	ayoAlert();
	ayoTooltip();

	//SkillBar
	$(window).load(function() {
		$('.ayo-progress').each(function(){
			$(this).find('.ayo-progress-bar').animate({ 
				width: $(this).attr('data-percentage') 
			}, 1500 );
		});
	});

});