/* 
 * Copyright 2011 DoAT. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this list of
 *      conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form must reproduce the above copyright notice, this list
 *      of conditions and the following disclaimer in the documentation and/or other materials
 *      provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY Do@ ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of DoAT.
 */

/**
* A utility for getting info detected about the platform and browser running the script.
* @class
*/
function Doat_Env(cfg){
	var self = this,
		_info,
        _do_platform,        
        orientationPrefix = "orientation-",
        orientationRegEpx = new RegExp(orientationPrefix+"[^\s]*","g"),        
        isTouch = cfg && cfg.isTouch || ('ontouchstart' in window);
    
    /*onScreenChange(function(){
        updateOrientationClassName();
        _info.screen = _getScreen();
    });*/
    window.addEventListener('orientationchange', updateOrientationClassName, false);
	window.addEventListener('load', updateOrientationClassName, false);

	var _getInfo = function(uaStr){
		// If no uaStr (user agent string) was sent (for testing purposes)
		// Get it from the browser
		uaStr = (uaStr || navigator.userAgent).toLowerCase();
		
		_info = {};
        _info.platform = _getPlatform(uaStr);
        _info.browser = _getBrowser(uaStr);
        _info.os = _getOS(uaStr);
        _info.screen = _getScreen();
	};
    
    var _getPlatform = function(uaStr){
    	var n = '', v = '', m;
    	
        m = /(iphone|ipad)|(android)|(symbian)|(webOSos)|(windows phone os)/.exec(uaStr) || [];
        n = m[1] ||
        	m[2] && '' ||
        	m[3] && 'nokia'||
        	m[4] && 'blackberry' ||
        	m[5] && '' ||
        	'desktop';  
        
        return {
        	"name": n,
        	"version": v
        }
    };
    
    var _getOS = function(uaStr){
    	var n = '', v = '', m;
    	
        m = /(iphone|ipad)|(android|symbian|webos)|(windows phone os)/.exec(uaStr) || [];
        n = m[1] && 'ios' ||
        	m[2] ||
        	m[3] && 'windowsphoneos';
        
        if (!n){
        	m = /(Win32)|(Linux)|(MacIntel)/.exec(navigator.platform) || [];
        	n = m[1] && 'windows' ||
        		m[2] ||
        		m[3] && 'mac' || '';
        }
		
		switch (n){
			case "ios":
				// ipad os 3_2 like
				// iphone os 3_0 like
				v = /os\s([\d_]+)\slike/.exec(uaStr);
				v = v[1].replace(/_/g, '.');
			break;
			case "android":
				// android 2.1-update1; en-us;
				// android 2.2; en-us;
				v = /android\s([\d\.\-]+)[^;]*;/.exec(uaStr);
				v = v[1].replace(/-/g, '');
			break;
		}
		
		return {
			"name": n,
			"version": v
		};
    };
    
    var _getBrowser = function(uaStr){
    	var n, v = '', m;
    	
    	uaStr = uaStr.toLowerCase();
    	
		m = /(webkit)[ \/]([\w.]+)/.exec( uaStr ) ||
            /(opera)(?:.*version)?[ \/]([\w.]+)/.exec( uaStr ) ||
            /(msie) ([\w.]+)/.exec( uaStr ) ||
            uaStr.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( uaStr ) ||
            [];
        n = m[1] || '';

		return {
			"name": n,
			"version": v
		};
    };
    
    var _getScreen = function(){
        var w="", h="";
        if (window.innerHeight){
            w = window.innerWidth;
            h = window.innerHeight;
        }
        else if (window.screen && window.screen.availHeight){
            w = window.screen.availWidth;
            h = window.screen.availHeight;
        }
        
        return {
            "width": w,
            "height": h
        }
    };
    
    function updateOrientationClassName(){
    	switch (window.orientation) {
			case 90:
				o = 'landscape-right';
			break;
			case -90:
				o = 'landscape-left';
			break;
			default:
				o = 'portrait';
		}
		document.body.className = document.body.className.replace(orientationRegEpx, '') + ' ' + orientationPrefix+o;
    }
    
    /*function onScreenChange(cb){
        var CHANGE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize';
        window.addEventListener(CHANGE_EV, cb, false);
    }
    
    this.onScreenChange = onScreenChange;*/

	this.isTouch = function(){
		return isTouch;
	};

	this.isMobile = function(uaStr){	    
		var p = self.getInfo(uaStr).platform.name;
        return cfg && cfg.isTouch || /^(iphone|ipad|android|symbian|webos|windowsphoneos)$/.test(p);
	};

	this.getInfo = function(){
		if (arguments[0] || !_info){
            var uaStr = (arguments[0] === true) ? undefined : arguments[0];
			_getInfo(uaStr);
		}
		return _info;
	};

    this.addEventListener = function(){
       if (typeof arguments[0] === 'string'){
            arguments[2] = arguments[1];
            arguments[1] = arguments[0];
            arguments[0] = document;
        }
        var el = arguments[0],
            type = arguments[1],
            cb = arguments[2],
            TOUCHSTART = self.isMobile() ? 'touchstart' : 'mousedown',
            TOUCHMOVE  = self.isMobile() ? 'touchmove' : 'mousemove',
            TOUCHEND   = self.isMobile() ? 'touchend' : 'mouseup';

        switch (type){
            case 'swipeX':
                addListener(el, 'swipeX', cb);
                break;
            case 'touch':
                var startPos, movePos, enableTouchMove = false;

                // touchstart
                addListener(el, TOUCHSTART, function(e){
                    e = e.originalEvent || e;  
                    //e.preventDefault(); // Meant to stop browser image dragging 
                    
                    startPos = {
                        'type': 'start',
                        'position': {
                            'x': e.touches ? e.touches[0].pageX : e.clientX,
                            'y': e.touches ? e.touches[0].pageY : e.clientY
                        }
                    };
                    cb(e, startPos);
                    
                    enableTouchMove = true;
                });

                // touchmove
                addListener(document, TOUCHMOVE, function(e){
                	if (!enableTouchMove) {return false;}
                	
                    e = e.originalEvent || e;
                    
                    movePos = {
                        'type': 'move',
                        'position': {
                            'x': e.touches ? e.touches[0].pageX : e.clientX,
                            'y': e.touches ? e.touches[0].pageY : e.clientY
                        }
                    }
                    movePos['delta'] = {
                        'x': movePos.position.x - startPos.position.x,
                        'y': movePos.position.y - startPos.position.y
                    }
                    cb(e, movePos);
                });

                // touchend
                addListener(document, TOUCHEND, function(e){                	                    
                    enableTouchMove = false;
                    
                    // If the finger didn't move (onclick) - don't fire the event
                    if (!movePos || movePos.delta.x === 0 && movePos.delta.y === 0){
                        return false;
                    }
                    
                    e = e.originalEvent || e;

                    var data = {
                        'type': 'end',
                        'position': movePos.position,
                        'delta': movePos.delta,
                        'swipeEvent': true,
                        'direction': (movePos.delta.x > 0) ? 'ltr' : 'rtl'
                    };
                   
                    cb(e, data);
                    
                    movePos = undefined;
                });
            break;
        }
    }
}