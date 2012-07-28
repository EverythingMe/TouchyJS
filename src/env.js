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
function Doat_Env(cfg) {
    var self = this, _info, _do_platform,
        isTouch = cfg && cfg.isTouch || ('ontouchstart' in window);
    

    var _getInfo = function(uaStr) {
        // If no uaStr (user agent string) was sent (for testing purposes)
        // Get it from the browser
        uaStr = (uaStr || navigator.userAgent).toLowerCase();
        
        _info = {};
        _info.platform = _getPlatform(uaStr);
        _info.browser = _getBrowser(uaStr);
        _info.os = _getOS(uaStr);
        _info.orientation = Orientation.getNew();
        _info.screen = Screen.get(uaStr);
        _info.connection = Connection.get();
    };
    
    var _getPlatform = function(uaStr) {
        var n = '', v = '', m;
        
        m = /(iphone|ipad)|(android|htc_)|(symbian)|(webos)|(blackberry|playbook|windows phone os)/.exec(uaStr) || [,'desktop'];
        n = m[1] ||
            m[2] && 'android' ||
            m[3] && 'nokia'||
            m[4] && 'hp' ||
            m[5] && '';  

        return {
            "name": n,
            "version": v
        }
    };
    
    var _getOS = function(uaStr) {
        var n = '', v = '', m;
        
        m = /(iphone|ipad)|(android|htc_)|(symbian|webos)|(blackberry|playbook)|(windows phone os)/.exec(uaStr) || [];
        n = m[1] && 'ios' ||
            m[2] && 'android' ||
            m[3] ||
            m[4] && 'blackberry' ||
            m[5] && 'windowsphoneos';
        
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
                v = v && v[1] && v[1].replace(/-/g, '');
            break;
        }
        
        return {
            "name": n,
            "version": v
        };
    };
    
    var _getBrowser = function(uaStr) {
        var n, v = '', m;
        
        uaStr = uaStr.toLowerCase();
        
        m = /(webkit)(?:[\/]|.+fbforiphone)/.exec( uaStr ) ||
            /(opera)(?:.*version)?[ \/]([\w.]+)/.exec( uaStr ) ||
            /(msie) ([\w.]+)/.exec( uaStr ) ||
            uaStr.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( uaStr ) ||
            [];
        n = m[1] || "";

        return {
            "name": n,
            "version": v
        };
    };
    
    this.getScreen = function() {
        return Screen.get();
    };
    
    this.setScreen = function(data) {
        return Screen.set(data);
    };
    
    this.clearScreen = function(k)  {
        return Screen.clear(k);
    };
    
    this.setOrientation = function(_orientation) {
        Orientation.set(_orientation);
    };

    this.isTouch = function() {
        return isTouch;
    };

    this.isMobile = function(uaStr){
        var p = self.getInfo(uaStr).platform.name;
        return cfg && cfg.isTouch || /^(iphone|ipad|android|nokia|blackberry)$/.test(p);
    };

    this.getInfo = function() {
        if (arguments[0] || !_info){
            var uaStr = (arguments[0] === true) ? undefined : arguments[0];
            _getInfo(uaStr);
        }
        return _info;
    };

    this.addEventListener = function() {
       if (typeof arguments[0] === 'string'){
            arguments[2] = arguments[1];
            arguments[1] = arguments[0];
            arguments[0] = document;
        }
        var el = arguments[0],
            type = arguments[1],
            cb = arguments[2],
            TOUCHSTART = isTouch ? 'touchstart' : 'mousedown',
            TOUCHMOVE  = isTouch ? 'touchmove' : 'mousemove',
            TOUCHEND   = isTouch ? 'touchend' : 'mouseup';

        switch (type){
            case 'orientationchange':
                Orientation.onOrientationChange(cb);
                break;
            case 'swipeX':
                addListener(el, 'swipeX', cb);
                break;
            case 'touch':
                var startPos, movePos, enableTouchMove = false;

                // touchstart
                addListener(el, TOUCHSTART, function(e) {
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
                addListener(document, TOUCHMOVE, function(e) {
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
                addListener(document, TOUCHEND, function(e) {                                        
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
    };
    
    var Orientation = new function() {
        var self = this,
            orientation,
            classPrefix = "orientation-",
            classRegEpx = new RegExp(classPrefix+"[^\\s]+","g"),
            onChangeCallbackArr = [],
            hasOrientation = "orientation" in window;
            
        if (window.addEventListener) {
            window.addEventListener((hasOrientation)? 'orientationchange' : 'resize', set, false);
            document.addEventListener('DOMContentLoaded', set, false);
        }
        
        this.set = set;
        
        this.getCurrent = function() {
            return orientation || self.getNew();
        };
        
        this.getOtherName = function(oName) {
            return oName === "portrait" ? "landscape" : "portrait"; 
        };
        
        this.getNew = function() {
            var val = (hasOrientation)? window.orientation : self.getOrientationByWindowSize();
            return normalize(val);
        };
        
        this.getOrientationByWindowSize = function() {
            return (window.innerHeight > window.innerWidth)? 0 : 90;
        };
        
        this.onOrientationChange = function(cb) {
            onChangeCallbackArr.push(cb);
        };
        
        function set(_orientation) {
            var newOrientation = (_orientation && !(_orientation.type)) ? normalize(_orientation) : self.getNew();
            if (!orientation || newOrientation.degree !== orientation.degree){
                orientation = newOrientation;
                updateClass();       
                onOrientationChange();
            }
        }
        
        function onOrientationChange() {
            onChangeCallbackArr.forEach(function(cb){
                cb(orientation);
            });
        }
        
        function normalize(_orientation) {
            var name, degree;
            if (typeof _orientation === "String"){
                name = _orientation;
                degree =  (_orientation == "landscape") ? 90 : 0;
            }
            else{
                degree =  _orientation;
                name = (Math.abs(_orientation) == 90) ? "landscape" : "portrait";
            }
            
            return { "name": name, "degree": degree };
        }
        
        function updateClass() {            
            var className = classPrefix+orientation.name;
            if (orientation.degree == 90){
                className += " "+classPrefix+"landscape-right";
            }
            else if (orientation.degree == -90){
                className += " "+classPrefix+"landscape-left";
            }
            
            document.body.className = document.body.className.replace(classRegEpx, '') + ' ' + className;
        }
    };
    
    Orientation.onOrientationChange(function() {
        _info.orientation = Orientation.getCurrent();
        _info.screen = Screen.get();
    });
    
    var Screen = new function() {
        var self = this, screen;
            
        function get(uaStr, options){
            !uaStr && (uaStr = navigator.userAgent);
            uaStr = uaStr.toLowerCase();
            var platform = _getPlatform(uaStr).name;
            var os = _getOS(uaStr).name;
            
            var data = ["","","",""];
                
            if (/^(iphone|ipod)$/.test(platform)) {
                data = [320,416,480,267];
            }
            // desktop
            else if (platform == "desktop") {
                data = [320,416,480,267];
            }
            // Android
            else if (os == "android") {
                // Nexus S
                if (/nexus s/.test(uaStr)) {
                    data = [320,508,508,295];
                }
                else if (/gt-9000/.test(uaStr)) {
                    data = [320,508,508,320];
                }
                else if (/sonyericssonr800a/.test(uaStr)) {
                    data = [320,544,544,320];
                }
                else if (/htc desire s/.test(uaStr)) {
                    data = [320,533,533,320];
                }
            }
            // windows phone os
            else if (os == "windowsphoneos") {
                data = [295,486,"",""];
            }
            
            screen = {
                "portrait": {
                    "width": data[0],"height": data[1]
                },
                "landscape": {
                    "width": data[2],"height": data[3]
                }
            };
        }
        
        function getCurrentWidth(o) {
            var w;
            if (window.innerWidth <= window.outerWidth &&
                window.innerWidth !== screen[Orientation.getOtherName(o)].width
            ){
                w = window.innerWidth;
            }
            //alert([window.innerWidth,window.outerWidth,o,screen[Orientation.getOtherName(o)].width]);
            return w;
        }
        
        this.set = function(data) {
            // example data: {"portrait": {"height": 320}}
            for (var k in data){
                for (var j in data[k]){
                    screen[k][j] = data[k][j];
                }
            }
        };

        this.get = function(uaStr) {
            var o = Orientation.getCurrent().name;
            if (uaStr || !screen) {
                get(uaStr);
            }
            !screen[o].width && (screen[o].width = getCurrentWidth(o));
            return screen[o];
        };

        this.clear = function(key) {
            var data = {};
            data[key] = { "height": "", "width": ""};
            self.set(data);
        };
    };
    
    var Connection = new function() {
        var _this = this,
            currentIndex,
            consts = {
                SPEED_UNKNOWN: 100,
                SPEED_HIGH: 30,
                SPEED_MED: 20,
                SPEED_LOW: 10
            },
            types = [
                {
                    "name": undefined,
                    "speed": consts.SPEED_UNKNOWN
                },
                {
                    "name": "etherenet",
                    "speed": consts.SPEED_HIGH
                },
                {
                    "name": "wifi",
                    "speed": consts.SPEED_HIGH
                },
                {
                    "name": "2g",
                    "speed": consts.SPEED_LOW
                },
                {
                    "name": "3g",
                    "speed": consts.SPEED_MED
                }
            ];
        
        this.get = function() {
            return getCurrent();
        };
        
        this.set = function(index) {
             currentIndex = index || (navigator.connection && navigator.connection.type) || 0;
             return getCurrent();
        };
        
        function getCurrent() {
            return aug({}, consts, types[currentIndex]);
        }
        
        function aug() {
            var main = arguments[0];
            for (var i=1, len=arguments.length; i<len; i++){
                for (var k in arguments[i]){ main[k] = arguments[i][k] }
            };
            return main;
        }
            
        // init
        _this.set();        
    };
}
