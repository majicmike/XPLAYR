(function(window, $) {

	$('#content .post').each(function(i, element) {
		var $post = $(element);
		var topOffset = $post.find('.entry-title').height() <= 40 ? 5 : 0;
		$('<div/>')
			.addClass('clipboardEmbedButton')
			.css({ position: 'relative', top: topOffset, 'margin-right': 10 })
			.attr('data-start', '#content .post:eq(' + i + ')')
			.attr('data-title', $post.find('.entry-title').text())
			.prependTo($(element).find('.entry-title'));
	});

}(window, jQuery));