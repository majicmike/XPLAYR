// Copyright (c) 2011 Synved Ltd.
// All rights reserved
jQuery.noConflict();

var currentStep = 0;
var stripeIn = false;
var stripeTime = 0;
var stripeInterval = 0;

jQuery(document).ready(function() 
{
	if (stripefolio.encoded_json)
	{
		var json = jQuery('<div>' + stripefolio.encoded_json + '</div>').text();
		stripefolio = jQuery.parseJSON(json);
	}
	
	var stripe = jQuery('#gallery-stripe');
	
	if (stripe.size() > 0)
	{
		jQuery(document).mousemove(handleGalleryStripe);
		
		stripe.css({opacity: (stripefolio.stripe.opaque ? 1 : 0), display: 'block'});
	
		stripe.find('a').click(handleGalleryClick);
		
		stripe.find('a').mouseenter(function() {
			jQuery(this).stop().css({zIndex: '100000'}).animate({width: stripefolio.stripe.sizeZoom, height: stripefolio.stripe.sizeZoom, marginLeft: -((stripefolio.stripe.sizeZoom - stripefolio.stripe.size) / 2)}, {duration: 350, easing: 'easeOutQuad'});
		})
		.mouseleave(function() {
			jQuery(this).stop().animate({width: stripefolio.stripe.size, height: stripefolio.stripe.size, marginLeft: 0}, {duration: 350, easing: 'easeInOutQuad'}).css({zIndex: 'auto'});
		});
		
		jQuery('.gallery-stripe-scroll .scroll-bar').slider({min: 0, max: 100, step: 0.1, disabled: (gallerySlideExtra() <= 0), slide: handleGallerySlide});
	}
	
	if (jQuery.prettyLoader)
	{
		var path = stripefolio.path + '/addons/pretty-loader/prettyLoader/images/prettyLoader/ajax-loader.gif';
	
		jQuery.prettyLoader({
			loader: path,
			bind_to_ajax: false
		});
	
		jQuery.prettyLoader.hide();
	}
	
	jQuery('a.button').click(function() { return false; });
	jQuery('#breadCrumb').jBreadCrumb();
	
	if (stripefolio.options.customTooltips) 
	{
		jQuery('a[title][title!=""]:has(img[title][title!=""])').attr('title', null);	
		jQuery('#gallery-stripe img[title][title!=""]').tipsy({gravity: 's', fade: true, offset: stripefolio.stripe.sizeZoom - stripefolio.stripe.size});
		jQuery('a[title][title!=""][rel!="home"]:not(:has(img)),button[title][title!=""],img[title][title!=""]').tipsy({gravity: 's', fade: true});
	}
});

function gallerySlideInfo()
{
	var stripe = jQuery('#gallery-stripe');
	var list = stripe.find('.gallery-list-pad');
	var stripeList = stripe.find('ul');
	var width = 0;
	var loff = 0;
	
	if (stripe.attr('totalWidth'))
	{
		width = parseFloat(stripe.attr('totalWidth'));
		loff = parseFloat(stripe.attr('leftOffset'));
	}
	else
	{
		var last = stripeList.find('li:last');
		loff = stripeList.offset().left;
		width = last.offset().left + last.outerWidth() - loff;
		stripe.attr('totalWidth', width);
		stripe.attr('leftOffset', loff);
	}
	
	var extra = (width - list.outerWidth() + 10);
	
	return {width: width, extra: extra, offset: loff};
}

function gallerySlideExtra()
{
	return gallerySlideInfo().extra;
}

function handleGallerySlide(e, ui)
{
	var elem = jQuery(this);
	var stripe = jQuery('#gallery-stripe');
	var playback = stripe.find('.gallery-playback');
	var control = stripe.find('.gallery-control');
	var list = stripe.find('.gallery-list');
	var stripeList = stripe.find('ul');
	var handle = jQuery(ui.handle);
	var min = elem.slider('option', 'min');
	var max = elem.slider('option', 'max');
	var range = max - min;
	var val = ui.value;
	var rate = val * 100 / range;
	
	if (rate > 98)
	{
		return false;
	}
	
	var info = gallerySlideInfo();
	var width = info.width;
	var extra = info.extra;
	var loff = info.offset;
	
	if (extra > 0)
	{
		var factor = rate * 0.010204;
		var offset = extra * factor - loff;

		//jQuery('#stripe-info').css({display: 'block'}).html('factor: ' + factor + ' width: ' + width + ' outerWidth: ' + list.outerWidth() + ' offset: ' + offset + ' rate: ' + rate);
	
		stripeList.offset({left: -offset});
	
		return true;
	}
	
	return false;
}

function handleGalleryClick(e)
{
	var item = jQuery(this);
	var src = item.attr('href');
	
	jQuery('#gallery-stripe a').removeClass('selected');
	item.addClass('selected');
	
	if (src != null && src != '#')
	{
		ev = { };
		
		ev.clientX = e.clientX ? e.clientX + 1 : 0;
		ev.clientY = e.clientY ? e.clientY + 1 : 0;
		
		if (jQuery.prettyLoader && stripefolio.stripe.loader == 'prettyLoader')
		{
			jQuery.prettyLoader.positionLoader(ev);
		
			try 
			{
				jQuery.prettyLoader.show();
				jQuery(document).triggerHandler('mousemove');
			}
			catch (ex)
			{}
		}
	
		jQuery.ajax({
			type: 'GET',
			url: src,
		  error:function(xhr, status, errorThrown) {
				if (jQuery.prettyLoader)
				{
					jQuery.prettyLoader.hide();
				}
			},
			success: function(data, textStatus, jqXHR) {
				if (jQuery.prettyLoader)
				{
					jQuery.prettyLoader.hide();
				}
				jQuery('#gallery-pic').css({'backgroundImage': ('url(\'' + src + '\')')});
			}
		});
	}
	else
	{
		jQuery('#gallery-pic').css({'backgroundImage': 'none'});
	}
	
	e.preventDefault();
	//e.stopPropagation();
	
	return false;
}

function handleBox(box, factor, direction, options)
{
	var win = jQuery(window);
	var doc = jQuery(document);
	var docScrollX = doc.scrollLeft();
	var docScrollY = doc.scrollTop();
	var docWidth = doc.width();
	var docHeight = doc.height();
	
	var loc = box.offset();
	var x = loc.left;
	var y = loc.top;
	var width = box.outerWidth();
	var height = box.outerHeight();
	
	if (box.attr('originalX'))
	{
		x = parseFloat(box.attr('originalX'));
		y = parseFloat(box.attr('originalY'));
	}
	else
	{
		box.attr('originalX', x);
		box.attr('originalY', y);
	}
	
	switch (direction)
	{
		case 'n':
		{
			var distance = y + height;
			var offset = Math.ceil(distance * factor);
			var pos = y - offset;
			
			if (loc.top != pos)
			{
				box.offset({top: pos});
			}
			
			break;
		}
		case 's':
		{
			var distance = docHeight - y;
			var offset = Math.ceil(distance * factor);
			var pos = y + offset;
			
			if (loc.top != pos)
			{
				box.offset({top: pos});
			}
			
			break;
		}
		case 'w':
		{
			var distance = x + width;
			var offset = Math.ceil(distance * factor);
			var pos = x - offset;
			
			if (factor == 0)
			{
				pos = x;
			}
			else if (factor == 1)
			{
				pos -= 10;
			}

	//jQuery('#stripe-info').css({display: 'block'}).html('factor: ' + factor + ' distance: ' + distance + ' pos: ' + pos + ' x: ' + x + ' originalX: ' + box.attr('originalX'));

			if (loc.left != pos)
			{
				box.offset({left: pos});
			}
			
			break;
		}
		case 'e':
		{
			var distance = docWidth - x;
			var offset = Math.ceil(distance * factor);
			var pos = x + offset;
			
			if (loc.left != pos)
			{
				box.offset({left: pos});
			}
			
			break;
		}
	}
	
	//box.css({opacity: (1 - factor)});
}

function safeOpacity(box, factor)
{
	if(jQuery.browser.msie && jQuery.browser.version < 9)
	{
		if (factor < 0.6)
		{
			box.addClass('stupid-ie-bg');
		}
		else
		{
			box.removeClass('stupid-ie-bg');
		}
	}
	else
	{	
		box.stop().css({opacity: factor});
	}
}

function handleGalleryHover(e, dir)
{
	if (stripeInterval > 0)
	{
		window.clearInterval(stripeInterval);
		stripeInterval = 0;
	}
	
	stripeInterval = window.setInterval(function() {
		var doc = jQuery(document);
		var header = jQuery('#header');
		var content = jQuery('#container');
		var primary = jQuery('#primary');
		var secondary = jQuery('#secondary');
		var footer = jQuery('#footer');
		var factor = jQuery.easing.easeInOutQuad(null, stripeTime, 0, 1.0, 750);
		var step = 0;
		var last = 0;
		factor = normalizeFactor(factor);
		
		if (stripeTime <= 0)
		{
			factor = 0;
		}
		else if (stripeTime >= 750)
		{
			factor = 1;
		}
		
		if (dir == 'in')
		{
			step = 50;
			last = 750;
		}
		else if (dir == 'out')
		{
			step = -50;
			last = 0;
		}
			
		//jQuery('#stripe-info').css({display: 'block'}).html('factor: ' + factor + 'stripeTime: ' + stripeTime);
		
		if (header.size() > 0)
			handleBox(header, factor, 'n');
		if (content.size() > 0)
			handleBox(content, factor, 'w');
		if (primary.size() > 0)
			handleBox(primary, factor, 'e');
		if (secondary.size() > 0)
			handleBox(secondary, factor, 'e');
		if (footer.size() > 0)
			handleBox(footer, factor, 's');

		if (factor > 0)
		{
			doc.find('body').css({overflowX: 'hidden'});
		}
		else
		{
			doc.find('body').css({overflowX: 'auto'});
		}
		
		if (stripeTime == last)
		{
			window.clearInterval(stripeInterval);
			stripeInterval = 0;
		}
		
		stripeTime += step;
	}, 50);
}

function normalizeFactor(factor)
{
	factor = Math.floor(factor * 100) / 100;
	
	if (factor < 0)
	{
		factor = 0;
	}
	else if (factor > 1)
	{
		factor = 1;
	}
	
	return factor;
}

function handleGalleryStripe(e)
{
	var win = jQuery(window);
	var doc = jQuery(document);
	var tile = jQuery('#bg-tile');
	var wrapper = jQuery('#wrapper');
	var header = jQuery('#header');
	var content = jQuery('#container');
	var primary = jQuery('#primary');
	var secondary = jQuery('#secondary');
	var footer = jQuery('#footer');
	var stripe = jQuery('#gallery-stripe');
	var stripeList = stripe.find('ul');
	
	var docScrollX = doc.scrollLeft();
	var docScrollY = doc.scrollTop();
	var docWidth = doc.width();
	var docHeight = doc.height();
	var middleX = win.width() / 2;
	var middleY = win.height() / 2;
	
	var mouseX = e.pageX - docScrollX;
	var mouseY = e.pageY - docScrollY;
	
	var stripeLoc = stripe.offset();
	var stripeX = stripeLoc.left - docScrollX;
	var stripeY = stripeLoc.top - docScrollY;
	
	var maxDistance = 10;
	var maxSteps = 50;
	var stripeDistance = stripeY - middleY;
	var mouseDistance = stripeY - mouseY;
	var rangeDistance = stripeDistance - maxDistance;
	var stepDistance = rangeDistance / maxSteps;
	
	var step = maxSteps;
	
	if (mouseDistance >= maxDistance)
	{
		step = maxSteps - Math.floor(mouseDistance / stepDistance);
	}
	
	step = Math.max(Math.min(step, maxSteps), 0);
	
	if (step == currentStep)
	{
		return true;
	}
	
	currentStep = step;
	
	var factor = normalizeFactor((1 / maxSteps) * step);

	if (currentStep == 0)
	{
		factor = 0;
	}
	else if (currentStep == maxSteps)
	{
		factor = 1;
	}
	
	stripe.stop().css({opacity: (stripefolio.stripe.opaque ? 1 : factor)});
	//safeOpacity(tile, 1 - factor);
	
	var hide = stripefolio.options.hide;
	var fade = hide == 'fade' | hide == 'fade_move';
	var move = hide == 'move' | hide == 'fade_move';
	
	if (factor == 1)
	{
		wrapper.addClass('wipe-out');
	}
	else
	{
		wrapper.removeClass('wipe-out');
	}

	if (stripefolio.options.hideMode == 'while_moving')
	{
		if (fade)
		{
			safeOpacity(wrapper, 1 - factor);
		}
	
		if (move)
		{
			factor = (factor - 0.4) * 1.666666;
			factor = normalizeFactor(factor);
			
			if (currentStep == 0)
			{
				factor = 0;
			}
			else if (currentStep == maxSteps)
			{
				factor = 1;
			}
	
	//jQuery('#stripe-info').css({display: 'block'}).html('factor: ' + factor + ' mouseDistance: ' + mouseDistance + ' currentStep: ' + currentStep);

			if (header.size() > 0)
				handleBox(header, factor, 'n');
			if (content.size() > 0)
				handleBox(content, factor, 'w');
			if (primary.size() > 0)
				handleBox(primary, factor, 'e');
			if (secondary.size() > 0)
				handleBox(secondary, factor, 'e');
			if (footer.size() > 0)
				handleBox(footer, factor, 's');
	
			if (factor > 0)
			{
				doc.find('body').css({overflowX: 'hidden'});
			}
			else
			{
				doc.find('body').css({overflowX: 'auto'});
			}
		}
	}
	else if (stripefolio.options.hideMode == 'over_stripe')
	{
		if (factor >= 1)
		{
			if (stripeIn == false)
			{
				stripeIn = true;
				
				if (fade)
				{
					wrapper.stop().animate({opacity: 0}, {duration: 1250, easing: 'easeInOutQuad'});
				}
				
				if (move)
				{
					handleGalleryHover(e, 'in');
				}
			}
		}
		else
		{
			if (stripeIn == true)
			{
				stripeIn = false;
				
				if (fade)
				{
					wrapper.stop().animate({opacity: 1}, {duration: 1250, easing: 'easeInOutQuad'});
				}
				
				if (move)
				{
					handleGalleryHover(e, 'out');
				}
			}
		}
	}
	
	//jQuery('#stripe-info').css({display: 'block'}).html('factor: ' + factor + ' mouseDistance: ' + mouseDistance + ' middleY: ' + middleY);
	
	return true;
}
