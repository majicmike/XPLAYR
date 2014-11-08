/**
 * Repost bootstrap
 * Copyright: 2013 Free Range Content Inc
 * by John Pettitt
 *
 * Add a script tag to load our main script, hide our buttons until the main script has had a chance to validate them.
 * We use this two stage approach to force the main script to the end of page loading which a) means we don't slow down
 * the page and b) means that if anybody else is loading jQuery we can use their copy and not duplicate it which is a
 * big win for most pages.
 **/

(function(d,w,undefined) {
    /* First add our real script tag */
    var script_tag = d.createElement('script');
    script_tag.setAttribute("type", "text/javascript");
    if(document.location.protocol.match(/^https/)) {
        script_tag.setAttribute("src", "https://d2q1vna75dc892.cloudfront.net/rjs/repost_main.js");
    } else {
        script_tag.setAttribute("src", "http://static.1.rp-api.com/rjs/repost_main.js");
    }
    script_tag.setAttribute("data-cfasync", "false");   //Stop cloudflare messing with us
    script_tag.setAttribute("async", "async");   //Go async
    (d.getElementsByTagName("head")[0] || d.documentElement).appendChild(script_tag);   //... and go!
    
    /* Now disable all our buttons until the main script loads */
    /* NB IE below 9 doesn't support getElementByClassName so we catch and ignore the exception */
    try {
        var tags = document.getElementsByClassName("rpuRepostUsButton");
        while(tags.length > 0) {
            var t = tags.shift();
                //Note we don't use display none becasue that cauases a re-render and possible layout change
                t.style.visibility = "hidden";  //hide until the main script re-enables it
            }
    } catch(e) { }
})(document,window);