/**
 * Repost.us publisher side code
 * Copright 2011 Free Range Content Inc.
 * Author John Pettitt
 */

var _rpu = _rpu || {};

(function(window, document, undefined) {
    var jQuery, //Local jQuery
    ec = encodeURIComponent,
	repostUsEnable = false,
	curateUsEnable = false,
	curateUsQuoteEnable = false,
	repostUsCopyEnable = true,
	hostInfo = null,
	apikey = null,
	pageURLs = [],
	debugMode = false,
	hash = document.location.hash,
	sliderTimeout = null,
	myURL = null,
	wpPlugin = 'wpPlugVer=',
	w = window,
	d = document,
	lastclick = {},
	headElement = document.getElementsByTagName("head")[0],
	//Setup for scaling if needed
	styleElement = document.createElement("style"),
	canonical, stylesheet;

    //Make an empty style sheet object for later
    styleElement.setAttribute("type", "text/css");
    headElement.appendChild(styleElement);
    stylesheet = styleElement.sheet;
    _rpu.jQueryLoaded = jqLoadDone;

    if (window.repostUsLoaded === true) {
	return;
    }
    window.repostUsLoaded = true;

    if (hash && hash.match(/rpudebug/)) {
	debugMode = true;
    }

    //Find Jquery, hopefully we already have it (everybody should use Jquery :-)
    //We need 1.7 or higher
    if (window._rpuQuery !== undefined) {
	jQuery = window._rpuQuery;
	//Woot! we already have the right jQuery
	repostUs(); //go 4 it
    } else if (window.jQuery === undefined || !/^1\.(7|8)/.test(window.jQuery.fn.jquery)) {
	if (document.location.protocol == 'https:') {
	    require("https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js", jqLoadDone, "rpuQuery"); //Thanks Google!)
	} else {
	    require("http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js", jqLoadDone, "rpuQuery"); //Thanks Google!)
	}
    } else {
	var script_tag = d.getElementById('rpuQuery'); //Is it ours?
	if (script_tag != undefined) {
	    script_tag.rpu_callBacks.push(jqLoadDone); //Even if we have jquery ours is loading so use it
	} else {


	    jQuery = window.jQuery;
	    window._rpuQuery = jQuery;
	    //Woot! we already have the right jQuery
	    repostUs(); //go 4 it
	}
    }

    function deblog(msg) {
	try {
	    console.log(msg);
	} catch (e) {
	    // newer opera browsers support posting erros to their consoles
	    try {
		opera.postError(msg);
	    } catch (e) {}
	}
    }

    //Load complete handler for jq - restores users jQ and $ and hides ours

    function jqLoadDone() {
	if (jQuery === undefined) { //for some reason IE9 is calling this twice so we protect it
	    if (window._rpuQuery === undefined) {
		jQuery = window.jQuery.noConflict(true);
		window._rpuQuery = jQuery;
	    } else {
		jQuery = window._rpuQuery;
	    }
	    repostUs(); //go 4 it
	}
    }


    //Loader for JS files we need


    function require(jsfile, callback, id) {
	var script_tag;

	script_tag = d.getElementById(id);
	if (!script_tag) {
	    script_tag = d.createElement('script');
	    script_tag.setAttribute("type", "text/javascript");
	    script_tag.setAttribute("src", jsfile);
	    script_tag.setAttribute("id", id);
	    script_tag.setAttribute("data-cfasync", "false");

	    script_tag.rpu_callBacks = [];
	    script_tag.rpu_callBacks.push(callback);
	    if (typeof callback == 'function') {
		script_tag.onload = doCallBacks;
		script_tag.onreadystatechange = function() { // IE
		    if (this.readyState == 'complete' || this.readyState == 'loaded') {
			doCallBacks();
		    }
		};
	    }

	    (d.getElementsByTagName("head")[0] || d.documentElement).appendChild(script_tag);



	} else {
	    script_tag.rpu_callBacks.push(callback);
	}

	function doCallBacks() {
	    while (script_tag.rpu_callBacks.length) {
		(script_tag.rpu_callBacks.shift())();
	    }
	}
    };


    function repostUs() {
	//Everything afteR this is in the jQuery ready() Closure
	jQuery(document).ready(function($) {


	    //Catch the copy function

	    function bindCopy() {
		var wPos = { top: 0, left: 0 };
		$('body').click(function(e) {
		    lastclick = {
			"top": e.pageY,
			"left": e.pageX
		    };
		    return true;
		});
		$('body').mousedown(function(e) {
		    wPos.top = e.pageY;
		    wPos.left = e.pageX;
		});
		
		if(readCookie("rpuNoPopup") !== null) {
		    return;
		}
		
		if (!repostUsCopyEnable && !curateUsQuoteEnable) {
		    return; // bail if we're not enabled.
		}
		
		$('body').bind('mousedown', function(evt) {
		    var s = userSelection();
		    if(s.length < 20 && $("#_rpuTooltip").is(":visible")) {
			closeSlider();
		    }
		});
		
		$('body').bind('copy', function(evt) {
		    closeSlider();
		});
		
		
		$('body').bind('mouseup', function(evt) {
		    var s = userSelection(),
			wc = wordCount(s),
			sliderContent = null,
			ownerButton = null,
			scope = null,
			selNodes, selOffset = {}, hostInfo, wcRepost, wcCurate, wcTweet, target;
			
			
		    if(s.length < 20) {
			if($("#_rpuTooltip").is(":visible")) {
			    closeSlider();
			}
			return true;
		    }
		    
		    if (!curateUsQuoteEnable) {
			return true; // bail if we're not enabled.
		    }

		    _rpu.activeButton = null; //We're not in a button

		    //Set up listner
		    $.receiveMessage(function(e) {
			var param = e.data.split('&'),
			    options = {};
			    
			if(e.origin != findHost()) return true;
			while (param.length > 0) {
			    try {
				var v = param.shift().split("=");
				options[v[0]] = v[1];
			    } catch (e) {}
			}
			try { //Wrap in try/catch so other peoples messages don't screw us
			    switch (options.req) {
			    case 'rpuOptOut':
				if (!document.location.host.toString().match(/rp-api\.com/))
				    setCookie('rpuNoPopup',1,365);
				break;
			    case 'rpuOptIn':
				if (!document.location.host.toString().match(/rp-api\.com/))
				    setCookie('rpuNoPopup',1,-1);
				break;
			    case 'rpuCloseMe':
				$('#_rpuTooltip').removeAttr('style').empty().hide();
				break;
			    case 'rpuSetSize': //Set size according to request
				if(options.w < $('#rpuIframe').width()) options.w = $('#rpuIframe').width();
				if(options.h < $('#rpuIframe').height()) options.h = $('#rpuIframe').height(); 
				$('#rpuIframe').css({ width: options.w, height: options.h});
				break;
			    case 'rpuSizeMe':  //super size for FB dialog.
				var pos = $('#rpuIframe').offset();
				$("#_rpuTooltip").css({
				    left: 0, top: 0, width: "100%", height: "100%"
				    });
				$('#rpuIframe').css({ width: "100%", height: "100%"});
				break;
			    }
			} catch (e) { }
			return true;
		    });

		    //Find our quote and who owns it.
		    selNodes = findSelNodes();
		    ownerButton = findButton(selNodes.start);
		    scope = $(ownerButton).closest("._rpuButtonScope");
		    if (scope.length) {
			hostInfo = $(scope).data('hostInfo');
		    }
		    if ($('link[rel=canonical]').size()) {
			target = $('link[rel=canonical]').attr('href');
		    } else {
			target = hostInfo.url;
		    }
		    if (!selNodes.start || hostInfo == undefined) {
			return true;
		    } else {
			if (selNodes.start.nodeName == '#text') {
			    selNodes.start = selNodes.start.parentNode;
			}
			if (selNodes.end.nodeName == '#text') {
			    selNodes.end = selNodes.end.parentNode;
			}
		    }

		    //We can only detect viewport if we're not framed - if we're not we make sure the popup is visible - this is mostly an IE thing becasue we don't
		    //know the selection start/end elements
		    wPos.top = evt.pageY - 30;
		    wPos.left = Math.max(
				    $(selNodes.end).offset().left + $(selNodes.end).width(),
				    $(selNodes.start).offset().left + $(selNodes.start).width()
				    );
				    

		    //Bail if we're not doing popups
		    if (!hostInfo || hostInfo.nopopup === true)  {
			return true;
		    }

		    // Hand all the info to the popup
		    if(repostUsEnable) {
			var frameInfo, furl, ftop, args = {
			    pageHash: hostInfo.pageHash,
			    repostUs: hostInfo.repostUs,
			    title: hostInfo.title,
			    url: target,
			    v: hostInfo.shortname,
			    tgt: hostInfo.url,
			    srcFrame: document.location.href.toString(),
			    s: s,
			    hid: hostInfo.id,
			    pid: hostInfo.pid
			}
			furl = findHost(false) + "/repost/templates/v6/repost-dialog.html?" + $.param(args); //#TODO language support
			doIframe(furl, wPos, 196, 226);
			return true;
		    }

		    //Nothing to do so bail
		    return true;

		    
		});
	    }

	//    function openSlider(sliderContent) {
	//	var leftPos, topPos;
	//	//leftPos = ($(window).width()/2) - ($('#rpuIframe').width() /2);
	//	//topPos = ($(window).height()/2) - ($('#rpuIframe').height() /2) + $(window).scrollTop();
	//	////$('#rpuIframe').animate({right:'0px'},300,'swing');
	//	//$('#rpuIframe').css({'left':leftPos+'px'});
	//	//$('body, #rpuMask').bind('click', closeSlider);
	//    }

	    function closeSlider() {
		if(!$("#_rpuTooltip").is(":visible")) {
		    return;
		}
		$('#_rpuTooltip').removeAttr('style').empty().hide();
		$('body').unbind('click', closeSlider);
	    }

	    // Figure out where we came from

	    function findHost(cdn) {
		//find out where we came from
		var hash = document.location.hash,
		    src = $('script[src*="rjs/repostus.js"]').attr('src'),
		    proto = document.location.protocol,
		    h;

		//Allow debug override withe #myhost= fragment but
		//debug hosts can only have alphanumeric and dashes and must be .local for security reasons
		if (hash && hash.match(/myhost=[^\.&]*/)) {
		    _rpu.host = "http://" + hash.replace(/#myhost=([-\w]*)/, '$1') + ".local";
		    cdn = false;
		}
		if (!('host' in _rpu)) {
		    if (src === undefined) {
			src = $('script[src*="curateus.js"]').attr('src');
		    }
		    if (src === undefined) {
			src = 'http://1.rp-api.com/';
		    }
		    if (src.match(/^\/\w/)) {
			src = document.location.host;
		    }
		    if (!proto.match(/^http/)) { //Must be http or https
			proto = "http:";
		    }
		    h = src.replace(/^\w*:?\/\/([^/]+).*/, "$1");
		    _rpu.host = proto + "//" + h.replace(/^static\./, ""); //Strip any static prefix (added back as needed later)
		}
		if (cdn && proto.match(/http:/) && !_rpu.host.match(/\.local$|^http:\/\/[-\w]*$/)) { //only static if not https and not .local or no dots
		    return _rpu.host.replace(/\/\//, "//static.");
		} else {
		    return _rpu.host;
		}

	    }

	    //how many words did they copy

	    function wordCount(s) {
		var m = s.match(/[^\s]+/g);
		if (m) {
		    return m.length;
		} else {
		    return 0;
		}
	    }

	    function userSelection() {
		//Assign to vars so closure complier can make them small
		var windowSelection = window.getSelection,
		    documentGetSelection = document.getSelection,
		    documentSelection = document.selection;

		return selection = (windowSelection ? windowSelection() : (documentGetSelection) ? documentGetSelection() : (documentSelection ? documentSelection.createRange().text : 0)) + ""; //force to string
	    }


	    function findButton(node) {
		var article = $(node).closest("._rpuButtonScope");
		if (article.length) {
		    return $(article).data('button');
		}
		return undefined;
	    }

	    function findSelNodes() {
		var windowSelection = window.getSelection,
		    documentGetSelection = document.getSelection,
		    documentSelection = document.selection,
		    nodes = {};

		if (windowSelection) {
		    var v = windowSelection();
		    nodes.start = v.anchorNode;
		    nodes.end = v.focusNode;
		} else if (documentSelection && documentSelection.type == 'Text') {
		    nodes.start = documentSelection.createRange().parentElement();
		    nodes.end = nodes.start;
		}

		if (nodes.start == undefined) {
		    nodes.start = nodes.end = $('body')[0]; //robustness - should never happen but ther seem to be race condition in selections
		}
		return nodes;
	    }



	    function getSyndicationInfo(callback, params, scope) {
		$.getJSON(findHost(false) + "/repost/hostinfo.php?jsoncallback=?&"+ params.join("&"), function(data, textStatus) {
		    (callback)(data);
		});
	    }

	    function setCookie(name, value, days) {
		if (days) {
		    var date = new Date();
		    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		    var expires = "; expires=" + date.toGMTString();
		} else
		var expires = "";
		document.cookie = name + "=" + escape(value) + expires + "; path=/";
	    }

	    function readCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
		    var c = ca[i];
		    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		    if (c.indexOf(nameEQ) == 0) return unescape(c.substring(nameEQ.length, c.length));
		}
		return null;
	    }

	    //enable buttons

	    function doButtons() {
		var targetCount = 0,
		    repostTargets = [],
		    canonical = document.location.href.toString();
		
		if ($('link[rel=canonical]').size() > 0) {
		    canonical = $('link[rel=canonical]').attr('href');
		    if (canonical.match(/http:\/\/[^\/]*http:\/|^\//) || canonical === undefined) { //ignore broken canonical headers
			canonical = document.location.href.toString();
		   }	
		}

		if (repostUsEnable) {
		    $('a.rpuRepostUsButton,a.rpuRepostButton').show().attr('_target', 'blank');
		}
		if (curateUsEnable) {
		    $('a.ClipThisButton,a.cuCurateUsButton').show().attr('_target', 'blank');
		}



		bindCopy(); //always bing copy but don't do anyting in the vent if we're not enablemd
		//If we're enabled for on-page embed then attach to button click and do that


		//  Use display:none no it doen't render before the stylesheet loads
		$('head').append("<link href=\"" + findHost(true) + "/rjs/tooltip.css?1\"  rel=\"stylesheet\" type=\"text/css\" media=\"all\">");
		$('body').prepend('<div id="_rpuTooltip" style="display:none;">' + '</div>');

		if (!_rpu.multiButton) {
		    $("._rpuPreview").show(); //Show previerws on single article pages only
		}



		$('#rpuIframeClose').live('click', function(e) {
		    $('#_rpuTooltip').removeAttr('style').empty().hide();
		});

		$('#_rpuTooltip a._rpuGet').live('click', buttonClick);


		$('#_rpuTooltip a._rpuPreview').live('click', function(e) {
		    var hostInfo = $('#_rpuTooltip').data('hostInfo');
		    $(this).attr('href', 'http://www.repost.us/article-preview/hash/' + hostInfo.pageHash)+"/";
		});

		//unbind other peoples crap then add our stuff 		
		$('a.rpuRepostUsButton,a.rpuRepostButton').unbind().live('click', buttonClick).each(function() {
		    var tgt = $(this).attr('href'),
			opts = $.param({
			    'surl': tgt,
			    'url': document.location.href
			}),
			clickURL = "http://1.rp-api.com/repost/preview.php?" + opts,
			hostInfo = $(this).closest('._rpuButtonScope').data('hostInfo');

		    if (!$(this).attr('href').match(/\?/)) {
			$(this).attr('href',$(this).attr('href') + "?url=" + canonical);
		    }
		    //Some stats programs simulate clicks and since we don't want the actual click to happen we remove the href to fool them.
		    $(this).attr('rpuRef', $(this).attr('href'));
		    $(this).attr('href', 'javascript:void();');
		    


		});
		
		function buttonClick(e) {
		    var hostInfo = $(this).closest("._rpuButtonScope, #_rpuTooltip").data('hostInfo');
			
		    if (hostInfo.buttonImg) {
			logButton('DIRECT',  hostInfo,true);
		    } else {
			logButton('DIRECT', hostInfo,true);
		    }
		    $(this).attr('href',hostInfo.preview + "/article-preview/hash/"+hostInfo.pageHash+"/");
		    $(this).attr('target',"_blank");
		    return true;
		}


	    }

	    

	    function doIframe(furl, pos, height, width) {
		var fleft = pos.left;
		    ftop = Math.max(pos.top , 10);

		var wh = $(window).height();
		var st = $(window).scrollTop();


		$('#rpuIframe').remove(); //In case for some wird reason the old one didn't go away
		if (_rpu.activeButton == null) {
		    
		    $('#_rpuTooltip').css({
			'z-index': '9999999',
			'top': +ftop + 'px',
			'left': +fleft + 'px',
			'position': 'absolute'
		    }).show();
		} //else {
		//$('#_rpuTooltip').prepend('<div id="rpuIframeClose"></div>');
		$('#_rpuTooltip').append('<iframe src="' + furl + '" id="rpuIframe" allowtransparency="true" scrolling="no" width="' + width + '"  frameborder="0" style="border:none;height:' + height + 'px;z-index:9999998;background:transparent;padding:0;margin:0;">');
		//}
		deblog('iFrame created ' + furl);
	    }

	    function findBaseName() {
		return document.location.protocol + "//" + document.location.host;
	    }

	    function logButton(e, h, sync) {
		if(sync === true)
		    $.ajaxSetup({async: false});
		try {
		    var opt = {
			hash: h.pageHash,
			pid: h.pid,
			hid: h.id,
			event: e
		    }
		    $.getJSON(findHost(false) + "/repost/log_button.php?jsoncallback=?",opt, function(d) {
			return true; //don't care
		    });
		} catch (e) {

		}
		if(sync === true)
		    $.ajaxSetup({async: true});
	    }

	    function showAlert(msg) {
		$('head').append('<link rel="stylesheet" href="' + findHost(true) + '/rjs/rpuError.css" type="text/css" media="screen">');
		$('body').prepend('<div class="rpu-alert-box">' + '<div id="rpu-message">' + msg + '<div id="rpu-small">(This admin notice is not visible to your readers.)</div>' + '</div><div id="rpu-triangle"></div><div id="rpu-notice"><img src="' + findHost(true) + '/rjs/images/status-red.png" alt="Attention!" width="24" height="24"><br>Repost.Us<br>Error</div></div>');
		$('.rpu-alert-box').click(function() {
		    $(".rpu-alert-box").remove();
		});
	    }

	    //Add in text links


	    function addLinks(hostInfo, scope) {
		var loops = 0,
		    termdone = [],
		    hid = "",
		    txt = $(hostInfo.autolink.contentSelector, scope).text();
		if (!hostInfo.autolink.allowExternal) {
		    hid = "&p=" + hostInfo.id;
		}
		if (!("style" in hostInfo.autolink)) {
		    hostInfo.autolink.style = "";
		}
		$.getJSON("http://1.rp-api.com/market_ajax/search.php?jsoncallback=?&th=none&mlt=" + hostInfo.pid + hid, function(data) {
		    if (data.response && 'docs' in data.response) {
			var meanMatch = 0;
			//find match value range
			for (var i in data.debug.explain) {
			    meanMatch += data.debug.explain[i].value;
			}
			meanMatch = meanMatch / data.response.docs.length;
			//Loop results
			for (var i = 0; i < data.response.docs.length; i++) {
			    var r = data.response.docs[i],
				dt = new Date;
			    r.autoLinkCount = 0;
			    if (data.debug.explain[r.id].value < meanMatch * 1.1) continue;
			    for (var j = 0; j < r.concept_facet.length; j++) {
				var t = r.concept_facet[j];
				if (termdone[t] == true) continue; //only link each term once and only link 2 word terms
				tagIt(t);
			    }
			    for (var j = 0; j < r.entity_facet.length; j++) {
				var t = r.entity_facet[j].replace(/.*: /, "");
				if (termdone[t] == true) continue; //only link each term once and only link 2 word terms
				tagIt(t);
			    }
			    for (var j = 0; j < r.tag_facet.length; j++) {
				var t = r.tag_facet[j];
				if (termdone[t] == true) continue; //only link each term once 
				tagIt(t);
			    }
			    deblog("Done " + r.id + " " + loops + " loops in " + elapsed(dt));
			}
		    }

		    function tagIt(t) {
			var mexp;
			t = t.replace(/[^\w\s]+/, "");
			mexp = new RegExp("(\\s+)(" + t + ")(\\s+\\w+)", "i");
			if (!txt.match(mexp)) return;

			$(hostInfo.autolink.contentSelector + " p", scope).each(function() {
			    var d = $(this).data('counts'),
				para = this;

			    if (!d) return;
			    $(this).contents().each(function() {
				var txt;
				if (this.nodeType != 3 || termdone[t]) return;
				txt = this.data.toString();
				if (r.autoLinkCount < 4 && d.lc < Math.ceil(d.wc / hostInfo.autolink.maxlinks) && !$(para).hasClass("rpuAutoLink-" + r.id) && txt.match(mexp)) {
				    //Yep got a match
				    var target, link;
				    r.url_display_s.match(/^http/i) ? target = r.url_display_s : target = "http://www.repost.us/article-preview/#!hash=" + r.hash_display_s;
				    link = txt.replace(mexp, '$1<a class="rpuAutoLink" style="' + hostInfo.autolink.style + '" title="' + r.title + ' (AutoLink)"  href="' + target + '">$2</a>$3');
				    d.lc++;
				    termdone[t] = true;
				    $(this).replaceWith(link);
				    $(para).addClass("rpuAutoLink-" + r.id);
				    r.autoLinkCount++;
				    deblog("Linked " + r.id + " to " + t + " autoLinkCount:" + r.autoLinkCount);
				}
				loops++;
			    }).end().data('counts', d);
			});
			termdone[t] = true;
		    } /* log click on auto generated link */
		    $('a.rpuAutoLink', scope).live('click', function(e) {
			var link, tgt, anchor = this;
			link = $(this).attr('href'), tgt = $(this).attr('target'), url = findHost(false) + '/repost/outclick.php?hid=' + hostInfo.id + '&ref=' + encodeURIComponent(document.location.href.toString()) + "&target=" + encodeURIComponent(link);

			$(this).unbind(e); //don't fire second time
			$.ajax({
			    type: 'GET',
			    url: url,
			    dataType: 'text',
			    success: function(d) {
				//document.location.href = link;
			    },
			    error: function(x, t, m) {
				//document.location.href = link;
			    },
			    //it's happier with a null error function
			    data: {},
			    async: false,
			    timeout: 250 //250ms max
			});
			return true; //And bubble;
		    });
		});



		//Setup some data while we wait for json
		$(hostInfo.autolink.contentSelector + " p", scope).each(function() {
		    var wc = wordCount($(this).text()),
			lc = $('a', this).size();
		    $(this).data('counts', {
			'wc': wc,
			'lc': lc
		    });
		});

		//wordcount helper


		function wordCount(s) {
		    var m = s.match(/[^\s]+/g);
		    if (m) {
			return m.length;
		    } else {
			return 0;
		    }
		}


		function elapsed(ds) {
		    var de = new Date;
		    return (de.getTime() - ds.getTime()) + "ms";
		}

	    }
	    //Meat start here
	    //Basic setup stuff
	    //Now see if we should even be here
	    if ($('a.ClipThisButton,a.cuCurateUsButton,a.rpuRepostButton,a.rpuRepostUsButton,a.rpurepostusbutton').length == 0) { //Blogger lowercases class names!!
		$('body').addClass('_rpuButtonScope').data('button', null);
		//return; //no buttons so bail
	    }


	    apikey = "apikey=" + $('meta[name=RepostUsAPIKey]').attr('content');

	    if (apikey == 'apikey=undefined') {
		var k = $('a.ClipThisButton').attr('href');
		if (k !== undefined) {
		    apikey = "apikey=" + k.replace(/.*\/simple\/clipthis\/([^\/\?]*).*/, "$1");
		} else {
		    k = $('script[src*="rjs/repostus.js"]').attr('src');
		    if (k.match(/\?/)) {
			apikey = "apikey=" + k.replace(/.*\?/, "");
		    }
		}
	    }

	    // Squarspace magic
	    $(".journal-entry-wrapper").each(function() {
		var scope = this,
		    url = $("h2.title a", this).attr('href');
		if (url.match(/^\//)) {
		    url = findBaseName() + url;
		}
		$('a.ClipThisButton,a.cuCurateUsButton,a.rpuRepostButton,a.rpuRepostUsButton,a.rpurepostusbutton', this).each(function() {
		    var tgt = $(this).attr('href');
		    if (!tgt.match(/\?url=.+/)) {
			$(this).attr('href', tgt + "?url=" + ec(url));
		    }
		    $(scope).addClass('_rpuButtonScope').data('button', this);
		});
		wpPlugin = "wpPlugVer=" + "squareSpace";
	    });
	    _rpu.multiButton = false;
	    $('a.ClipThisButton,a.cuCurateUsButton,a.rpuRepostButton,a.rpuRepostUsButton,a.rpurepostusbutton').each(function() {
		var href = $(this).attr('href'),
		    urls, scope = this;

		if ($(scope).closest('._rpuButtonScope').size() == 0) {
		    while ('parentNode' in scope && scope.parentNode) {
			var buttons = $(scope.parentNode).find('a.rpuRepostButton,a.rpuRepostUsButton,a.rpurepostusbutton'),
			    bUrl = {};
			if (buttons.length > 1) {
			    var uniqueButtons = 0;
			    $(buttons).each(function() {
				var href = $(this).attr('href');
				if (!(href in bUrl)) uniqueButtons++;
				bUrl[$(this).attr('href')] = 1;
			    });

			    if (uniqueButtons > 1) { //differing buttons scope limit found.
				$(scope).addClass('_rpuButtonScope').data('button', this);
				break;
			    }
			}
			scope = scope.parentNode; //Step up
		    }
		}
		//Check for the single button case;
		if (!scope.parentNode) {
		    $('body').addClass('_rpuButtonScope').data('button', this);
		}
		try {
		    var bsrc = $(this).find('img').attr('src');
		    if (Math.random() < 0.5 && bsrc == "http://secure.repost.us/images/button-hrz-tny.png") {
			$(this).find('img').attr('src', findHost(true) + "/buttons/button-hrz-tny-embed.png");
		    }
		    //24 and 2.5 plugin fix
		    if (bsrc.match(/wp-content\/plugins\/repostus$/)) {
			$(this).find('img').attr('src', findHost(true) + "/buttons/button-hrz-tny-embed.png");
		    }
		} catch (e) {

		}

	    });


	    if ($('meta[name="rpuPlugin"]').size() > 0) {
		wpPlugin = "wpPlugVer=" + $('meta[name="rpuPlugin"]').attr('content');
	    }

	    if ($("_rpuButtonScope").size() == 1) {
		canonical = $('link[rel=canonical]').attr('href');
		if (canonical.match(/http:\/\/[^\/]*http:\/|^\//) || canonical === undefined) { //ignore broken canonical headers
		    canonical = document.location.href.toString();
		}
	    }

	    $('._rpuButtonScope').each(function() {
		var href,
		    myUrl, scope = this;
		if ($(this).data('button') != null) {
		    href = $($(this).data('button')).attr('href');
		} else {
		    href = "#";
		}
		

		href.match(/url=/) ? myURL = "url=" + ec(href) : myURL = "url=" + ec(document.location.href); //if we have a url param use it
		typeof canonical != 'undefined' ? canonical = "canonical=" + ec(canonical) : canonical = "canonical=";
		
		//hide buttons on posts that have an embed in them to avoid clutter;
		if($(".rpuArticle",this).size() > 0) {
		    $("a.rpuRepostButton,a.rpuRepostUsButton,a.rpurepostusbutton",this).hide();
		} else {
		    getSyndicationInfo(function(data) {
			if (data.pageStatus != 'NOLICENSE' && data.available != false && (data.status == 'LIVE' || data.status == 'BETA' || (data.status == 'TESTING' && debugMode))) {
			    repostUsEnable = true;
			    repostUsCopyEnable = true;
			    if (window.rpuButtonGlue == "addThis") {
				var $button = $(scope).find('div.rpuRepostUsButtonWrap:first a.rpuRepostUsButton');
				$button.css({ "padding":"0 6px", "margin-top": "-1px", "display": "inline-block", "float": "left"});
				$button.find('img').css("vertical-align","baseline");
				$(scope).find(".addthis_toolbox").each(function() {
				    if ($(this).find('.addthis_counter').size() > 0) {
					$(this).find('.addthis_counter').before($button.clone());
				    } else {
					$(this).append($button.clone());
				    }
				});
				$button.remove();
			    }
			    $(scope).find('a.rpuRepostButton,a.rpuRepostUsButton,a.rpurepostusbutton').each(function() {
				logButton('SHOW', data);
				$(this).show().css("visibility","visible");
			    });
			} else {
			    $('a.rpuRepostUsButton,a.rpuRepostButton,a.rpurepostusbutton',scope).hide();
			}
			if (data.limit_mode > 0) {
			    if (data.limit_mode == 2) curateUsQuoteEnable = true;
			    curateUsEnable = true;
			} else {
			    $('.ClipThisButton,.cuCurateButton',scope).hide();
			}
			$.data(scope, 'hostInfo', data);
			if ('autolink' in data && !document.location.host.toString().match(/rp-api\.com$/)) {
			    addLinks(data, scope);
			}
			if (data.status == 'ERROR' && (data.forceMessage || debugMode || $('#wpadminbar').size() > 0)) {
			    showAlert(data.message);
			}
			
		    }, Array(apikey, myURL, wpPlugin, canonical),scope);
		}
	    });


	    doButtons();
	    msgInit();
	});

	function msgInit() {
	    (function($) {
		// A few vars used in non-awesome browsers.
		var interval_id, last_hash, cache_bust = 1,




		    // A var used in awesome browsers.
		    rm_callback,



		    // A few convenient shortcuts.
		    window = this,
		    FALSE = !1,




		    // Reused internal strings.
		    postMessage = 'postMessage',
		    addEventListener = 'addEventListener',


		    p_receiveMessage,



		    // I couldn't get window.postMessage to actually work in Opera 9.64!
		    has_postMessage = window[postMessage]; //&& !$.browser.opera;
		// Method: jQuery.postMessage
		// 
		// This method will call window.postMessage if available, setting the
		// targetOrigin parameter to the base of the target_url parameter for maximum
		// security in browsers that support it. If window.postMessage is not available,
		// the target window's location.hash will be used to pass the message. If an
		// object is passed as the message param, it will be serialized into a string
		// using the jQuery.param method.
		// 
		// Usage:
		// 
		// > jQuery.postMessage( message, target_url [, target ] );
		// 
		// Arguments:
		// 
		//  message - (String) A message to be passed to the other frame.
		//  message - (Object) An object to be serialized into a params string, using
		//    the jQuery.param method.
		//  target_url - (String) The URL of the other frame this window is
		//    attempting to communicate with. This must be the exact URL (including
		//    any query string) of the other window for this script to work in
		//    browsers that don't support window.postMessage.
		//  target - (Object) A reference to the other frame this window is
		//    attempting to communicate with. If omitted, defaults to `parent`.
		// 
		// Returns:
		// 
		//  Nothing.
		$[postMessage] = function(message, target_url, target) {
		    if (!target_url) {
			return;
		    }

		    // Serialize the message if not a string. Note that this is the only real
		    // jQuery dependency for this script. If removed, this script could be
		    // written as very basic JavaScript.
		    message = typeof message === 'string' ? message : $.param(message);

		    // Default to parent if unspecified.
		    target = target || parent;

		    if (has_postMessage) {
			// The browser supports window.postMessage, so call it with a targetOrigin
			// set appropriately, based on the target_url parameter.
			target[postMessage](message, target_url.replace(/([^:]+:\/\/[^\/]+).*/, '$1'));

		    } else if (target_url) {
			// The browser does not support window.postMessage, so set the location
			// of the target to target_url#message. A bit ugly, but it works! A cache
			// bust parameter is added to ensure that repeat messages trigger the
			// callback.
			target.location = target_url.replace(/#.*$/, '') + '#' + (+new Date) + (cache_bust++) + '&' + message;
		    }
		};

		// Method: jQuery.receiveMessage
		// 
		// Register a single callback for either a window.postMessage call, if
		// supported, or if unsupported, for any change in the current window
		// location.hash. If window.postMessage is supported and source_origin is
		// specified, the source window will be checked against this for maximum
		// security. If window.postMessage is unsupported, a polling loop will be
		// started to watch for changes to the location.hash.
		// 
		// Note that for simplicity's sake, only a single callback can be registered
		// at one time. Passing no params will unbind this event (or stop the polling
		// loop), and calling this method a second time with another callback will
		// unbind the event (or stop the polling loop) first, before binding the new
		// callback.
		// 
		// Also note that if window.postMessage is available, the optional
		// source_origin param will be used to test the event.origin property. From
		// the MDC window.postMessage docs: This string is the concatenation of the
		// protocol and "://", the host name if one exists, and ":" followed by a port
		// number if a port is present and differs from the default port for the given
		// protocol. Examples of typical origins are https://example.org (implying
		// port 443), http://example.net (implying port 80), and http://example.com:8080.
		// 
		// Usage:
		// 
		// > jQuery.receiveMessage( callback [, source_origin ] [, delay ] );
		// 
		// Arguments:
		// 
		//  callback - (Function) This callback will execute whenever a <jQuery.postMessage>
		//    message is received, provided the source_origin matches. If callback is
		//    omitted, any existing receiveMessage event bind or polling loop will be
		//    canceled.
		//  source_origin - (String) If window.postMessage is available and this value
		//    is not equal to the event.origin property, the callback will not be
		//    called.
		//  source_origin - (Function) If window.postMessage is available and this
		//    function returns false when passed the event.origin property, the
		//    callback will not be called.
		//  delay - (Number) An optional zero-or-greater delay in milliseconds at
		//    which the polling loop will execute (for browser that don't support
		//    window.postMessage). If omitted, defaults to 100.
		// 
		// Returns:
		// 
		//  Nothing!
		$.receiveMessage = p_receiveMessage = function(callback, source_origin, delay) {
		    if (has_postMessage) {
			// Since the browser supports window.postMessage, the callback will be
			// bound to the actual event associated with window.postMessage.
			if (callback) {
			    // Unbind an existing callback if it exists.
			    rm_callback && p_receiveMessage();

			    // Bind the callback. A reference to the callback is stored for ease of
			    // unbinding.
			    rm_callback = function(e) {
				if ((typeof source_origin === 'string' && e.origin !== source_origin) || ($.isFunction(source_origin) && source_origin(e.origin) === FALSE)) {
				    return FALSE;
				}
				callback(e);
			    };
			}

			if (window[addEventListener]) {
			    window[callback ? addEventListener : 'removeEventListener']('message', rm_callback, FALSE);
			} else {
			    window[callback ? 'attachEvent' : 'detachEvent']('onmessage', rm_callback);
			}

		    } else {
			// Since the browser sucks, a polling loop will be started, and the
			// callback will be called whenever the location.hash changes.
			interval_id && clearInterval(interval_id);
			interval_id = null;

			if (callback) {
			    delay = typeof source_origin === 'number' ? source_origin : typeof delay === 'number' ? delay : 100;

			    interval_id = setInterval(function() {
				var hash = document.location.hash,
				    re = /^#?\d+&/;
				if (hash !== last_hash && re.test(hash)) {
				    last_hash = hash;
				    callback({
					data: hash.replace(re, '')
				    });
				}
			    }, delay);
			}
		    }
		};

	    })(jQuery);
	}
    }

})(window, document);