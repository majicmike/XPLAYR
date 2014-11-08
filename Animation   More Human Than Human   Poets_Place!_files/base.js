// Copyright (c) 2011 Synved Ltd.
// All rights reserved

function synved_shortcode_apply_all(context) 
{
	if (context == undefined || context == null)
		context = document;
		
	jQuery('.noselect', context).unselectable();
	
	jQuery('.synved-section-list', context).each(function() {
		var sections = jQuery(this);
		
		sections.find('h4.section-title a').each(function() {
			var tab = this;
			if (tab.href != '' && tab.href[0] != '#') {
				var hash = jQuery.param.fragment(tab.href);
				tab.href = '#' + hash;
			}
		});
	});
	
	jQuery('.synved-section-list', context).removeClass('synved-section-list-nojs').accordion({ autoHeight: false, navigation : true });
	
	jQuery('.synved-tab-list.synved-content-dynamic', context).each(function() {
		var tabs = jQuery(this);
		
		tabs.find('li.tab-title a').each(function() {
			var tab = this;
			var hash = jQuery.param.fragment(tab.href);
			var args = { synved_dynamic_load : true };
			var url = jQuery.param.querystring(tab.href, args);
			jQuery.data(tab, 'synved-tab-link', url);
			tab.href = '#' + hash;
		});
	}).removeClass('synved-content-dynamic');
	
	jQuery('.synved-tab-list', context).each(function() {
		var tabs = jQuery(this);
		
		tabs.find('li.tab-title').removeClass('ui-tabs-selected ui-tabs-active ui-state-active');
		
		tabs.find('li.tab-title a').each(function() {
			var tab = this;
			if (tab.href != '' && tab.href[0] != '#') {
				var hash = jQuery.param.fragment(tab.href);
				tab.href = '#' + hash;
			}
		});
	});
	
	jQuery('.synved-tab-list', context).removeClass('synved-tab-list-nojs').tabs({
    select: function(event, ui) {
    	var url = jQuery.data(ui.tab, 'synved-tab-link');
    	var loaded = jQuery.data(ui.panel, 'synved-tab-loaded');
    	
    	if (!loaded && url)
    	{
    		jQuery(ui.panel).load(url);
    		
    		jQuery.data(ui.panel, 'synved-tab-loaded', true);
    	}
    	
    	return true;
    }
	}).each(function () {
		var tabs = jQuery(this);
		
		if (tabs.hasClass('synved-content-scrollable'))
		{
			var nav = tabs.find('.ui-tabs-nav');
			var height = nav.find('.tab-title').height();
			
//			nav.css({
//				overflowY: 'visible',
//				overflowX: 'auto',
//				height: height + 2,
//			});
		}
	});
	
	jQuery('.synved-button', context).each(function() { 
		var btn = jQuery(this);
		var info = btn.next('.button-info');
		var icon = info.find('.icon').html();
		var icon2 = info.find('.icon2').html();
		
		if (icon) icon = 'ui-icon-' + icon;
		if (icon2) icon2 = 'ui-icon-' + icon2;
		
		btn.button({ icons: {primary: icon, secondary: icon2} });
	});
	
	jQuery('a.synved-button', context).click(function() { return false; });
}

