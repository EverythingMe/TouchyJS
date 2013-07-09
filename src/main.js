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

// Copyright 2011 DoAT All Rights Reserved.

/**
 * @class
 * @description A global class providing tools for creating cross browser and cross platform compatible web apps with rich capabilities and UI.
 * @requires {object} jQuery If jQuery wasn't loaded in the document, a script request is sent.
 * @author ran@doat.com (Ran Ben Aharon)
 * @version: 0.73
 */
function Doat_Main(){
    var self = this,
        $document, head = document.getElementsByTagName('HEAD')[0],
        Messenger, DOML, Env, Navigation, Searchbar, Scroll, Slider, Swiper, envInfo, Extractor, Storage, Viewport,
        cfg = {},
        ENABLE_ANALYTICS = (typeof doat_jsa !== 'undefined' && doat_jsa);

    if (typeof doat_config !== 'undefined'){
        cfg = aug(cfg, doat_config);
    }
    
    cfg.hasHost = /\sevme\//.test(navigator.userAgent);

    this.init = init;
    this.renderHTML = renderHTML;
    this.openLink = openLink;
    this.getSearchQuery = getSearchQuery;
    this.visible = this.focused = false;

    this.Log = new Logger();

    // Put here so that apps could attach to Events.ready() before init() executes (if jquery isn't preloaded).
    this.Events = new Doat_Events();

    // Same for Env
    Env = new Doat_Env();
    this.Env = this.Environment = Env;

    envInfo = Env.getInfo();

    // Stretches viewport in mobile browsers
    if (Env.isMobile()){
        create('META', head, {
            'name': 'viewport',
            'content': 'width=device-width initial-scale=1 minimum-scale=1 maximum-scale=1 user-scalable=0'
        });
        // Hide top searchbar in iphones
        if (envInfo.platform.name === 'iphone'){
            create('META', head, {
                'name': 'apple-mobile-web-app-capable',
                'content': 'yes'
            });
        }
        
        $(document.body).css('-webkit-text-size-adjust', 'none');
    }

    var renderTemplate = function(str, attrArr){
      if (!attrArr){return str}
      for (var key in attrArr){
        var keyRegex = new RegExp("{"+key+"}", "g");
        var value = attrArr[key];
        str = str.replace(keyRegex, value);
      }
      return str;
    };

    function init(){
        $document = $(document);

        // DOML
        DOML = new Doat_DOML();
        self.DOML = DOML;

        // Messenger
        Messenger = new Doat_Messenger();
        Messenger.setAuthFunc(function(message){
            // make sure it's from the top.window (dashboard)
            if (message.source === top.window){
                return {
                    'error': 'OK',
                    'attachData':{
                        'source': message.source
                    }
                };
            }
            else{
                return {
                    'error': 'Not authenticated',
                    'attachData':{
                        'origin': message.origin
                    }
                };
            }
        });
        self.Messenger = Messenger;
        if (ENABLE_ANALYTICS){
            this.Log.info('Analytics enabled');
            enableMobileAnalytics(Messenger, Env.isMobile());
        }
        else{
            this.Log.info('Analytics disabled');
        }
        
        Searchbar = new Doat_Searchbar({
            'searchClearButton': cfg.searchClearButton
        });
        self.Searchbar = Searchbar;

        Slider = new Doat_Slider();
        self.Slider = Slider;

        Swiper = new Doat_Swiper();
        self.Swiper = Swiper;
 
        Scroll = new Doat_Scroll();
        self.Scroll = Scroll;
		
        Navigation = new Doat_Navigation(cfg);
        self.Navigation = self.Nav = Navigation;
		
		Facebook = new Doat_Facebook();
		if (cfg.facebook) {
			Facebook.init(cfg.facebook);
		}
		self.Facebook = self.FB = Facebook;
		
		Extractor = new Doat_Extractor();
		self.Extractor = Extractor;
		
        //Storage = new Doat_Storage();
        //self.Storage = Storage;
        
        Viewport = new Doat_Viewport();
        self.Viewport = Viewport;
		
        // Event handlers
        $(window).bind('load', function(){
            Messenger.trigger(Doat.Events.WINDOW_LOADED);       
        });

        self.Events.ready(function(){
            Messenger.trigger(Doat.Events.DOAT_READY);
        });

        L10n = new L10n(cfg, self);
        self.L10n = L10n;

        self.Events.focused(function(){
            self.focused = true;
        });

        self.Events.blurred(function(){
            self.focused = false;
        });

        self.Events.visible(function(){
            self.visible = true;
        });

        self.Events.hidden(function(){
            self.visible = false;
        });

        Messenger.bind('focusState', function(meta, data){
            self.Events.dispatchEvent(data.type);
        });

        $document.ready(function(){
            Messenger.trigger(Doat.Events.DOCUMENT_READY);

            DOML.parse();
            
            //Storage.init();
            
            Viewport.init({
                "Storage": Storage,
                "$container": $(document.body),
                "logger": console
            });
            
            Viewport.setHeight();
            Viewport.hideAddressBar();
            
            Env.addEventListener("orientationchange", function(){
                Viewport.setHeight();
                Viewport.hideAddressBar();
            });
            
            Scroll.init(cfg);
            Navigation.init(cfg);

            addClass(document.body, 'doml-env-'+envInfo.platform.name);
            envInfo.browser.name && addClass(document.body, 'doml-env-browser-'+envInfo.browser.name);

            if (Env.isMobile()){
                addClass(document.body, 'doml-env-mobile');
                if (cfg.webkitAnimation !== false){
                    enableCssAnim(envInfo.platform.name, envInfo.browser.name, self.Log);
                }
            }

            $('body').bind('click', function(event){
                var el = event.target || event.originalTarget ; // All browsers || IE
                var elPath = '';

                if (el){
                    // Add tag name
                    if (el.nodeName){
                        elPath = el.nodeName;
                    }
                    // Add class name
                    if (el.className != ''){
                        elPath+= '.'+el.className;
                    }
                    // Add id
                    if (el.id != ''){
                        elPath+= '#'+el.id;
                    }
                    // Add text node
                    if (el.firstChild && el.firstChild.nodeType === 3){
                        var text = el.firstChild.nodeValue;
                        text = trim(text);
                        if (text !== ''){
                            elPath+= ' (\"'+text+'\")';
                        }
                    }
                    // Add alt
                    if (el.getAttribute('alt')  && el.getAttribute('alt') !== ''){
                        var alt = el.getAttribute('alt');
                        alt = trim(alt);
                        elPath+= ' (\"'+alt+'\")';
                    }
                }

                Messenger.trigger(Doat.Events.USER_ACTION,{
                    'action': 'Click',
                    'element': elPath
                });
            });
            
            self.Events.dispatchEvent('ready', {'callOnce': true});
            
            if (cfg.browserHistory) {
                Navigation.initHistory();
            }
        });

        var q = parseQuery();
        self.params = {
            "query": "",
            "experience": "",
            "platform": ""
        };
        for (var k in q){
            if (k.indexOf("do_") === 0){
                var key = k.substring(3, k.length); 
                self.params[key] = decodeURIComponent(q[k]).replace(/\+/g, " ");
            }
        }

        Messenger.trigger(Doat.Events.PAGE_VIEW, {
            'action': 'PageView',
            'query': self.params.query
        });
    }

    /**
     * @method getSearchQuery
     * @description Returns the original search query sent by the host
     * @returns {String}
     */
    function getSearchQuery(){
        return self.params.query || "";
    }

    /**
     * @method renderHTML
     * @description Renders an HTML string according to template and data sent. Detrmines what to return according to the running platform.
     * Possible key names:
     * <ul>
     * <li>'default'</li>
     * <li>'web'</li>
     * <li>'iphone'</li>
     * <li>'ipad'</li>
     * <li>'android'</li>
     * <li>'windowsPhone'</li>
     * <li>'symbian'</li>
     * <li>'webOS'</li>
     * </ul>
     * Possible key combinations:
     * <ul>
     * <li>default</li>
     * <li>platformName (e.g 'iphone')</li>
     * <li>platformName[,platformName] (e.g 'iphone,android', 'web,default')<li>
     * </ul>
     * @param {String/Object} templates A string containing an HTML template or an object containing key-value pairs where the key is a platform name and the value is the html template associated.
     * @param {Array} attrArr An associative array in which the keys are the replacement names in the template strings
     * @return {string}
     * @example
     * var html = Doat.renderHTML('Hi! my name is {name}.', {'name': 'Joey'});
     * // Returns 'Hi! My name is Joey.'
     *
     *
     * var html = Doat.renderHTML({'iphone': 'This is an iphone version {ver}.'}, {'ver': '4.2'});
     * // Returns 'This is an iphone version 4.2.' (if platform === 'iphone')
     * // Returns '' (if platform === 'web')
     *
     *
     * var html = Doat.renderHTML({'web': '<p class="web">{text}</p>', 'iphone,default': '<span class="mobile">{text}</span>'}, {'text': 'Just some text'});
     * // Returns '<p class="web">Just some text</p>' (if platform === 'web')
     * // Returns '<span class="mobile">Just some text</span>' (if platform === 'iphone')
     * // Returns '<span class="mobile">Just some text</span>' (if platform === 'android')
     */
     function renderHTML(templates, attrArr){
        var tmpl;
        // If a string was sent instead of an object
        if (typeof templates === 'string'){
            tmpl = templates;
        }
        // If templates was sent as an object
        else{
            var defaultTmpl = '',
                platform = Env.getInfo().platform.name;

            // Loop through all keys
            for (k in templates){
                // Split by ',' if, for example, sent "web,iphone,default"
                var splitK = k.split(',');
                // Loop through keys that were seperated by ','
                for (var i=0; i<splitK.length; i++){
                    // If the key is the current platform
                    if (splitK[i] === platform){
                        // Set the template string
                        tmpl = templates[k];
                        // Exit the loop
                        break;
                    }
                    // If the key is "default"
                    else if (splitK[i] === 'default'){
                        defaultTmpl = templates[k];
                    }
                }
                // If tmpl wasn't set (no key matched the platform) - set it with default value
                if (!tmpl) tmpl = defaultTmpl;
            }
        }
        // Eventually render the HTML template and return it
        return renderTemplate(tmpl, attrArr);
    }

    function openLink(urls, _options){
        var finalObj,
            userPlatform = Env.getInfo().platform.name,
            isMobile = Env.isMobile(),
            options = _options || {};

        function _escape(url){
            return encodeURIComponent(encodeURIComponent(url));
        }

        function _normalize(o){
            if (typeof o === 'string'){
                o = {
                    'url': o,
                    'newWindow': (!isMobile),
                    'label': ((o.indexOf("itms-apps://") !== -1 || o.indexOf("itms://") !== -1 || o.indexOf("http://itunes.apple.com") !== -1) ? "Download from App Store" : (o.indexOf("http://") !== 0 && o.indexOf("https://") !== 0) ? "Launch installed app" : o)
                }
            }
            return o;
        }

        function _getObj(arr){
            if (!arr){return arr;}

            var finalObj;
            arr = (arr instanceof Array) ? arr : [arr];
            
            if (isMobile){
                finalObj = {
                    'url': 'doatJS://OpenLink'
                };
                for (var i=0, iLen = arr.length; i<iLen; i++){
                    var o = _normalize(arr[i]);
                    if (o['newWindow'] && o.url.indexOf('http') === 0){
                        o.url = 'doatBrowser://'+o.url;
                    }
                    o.url = _escape(o.url);
                    finalObj['url']+= '/'+o.url;
                }
            }
            else{
                finalObj = _normalize(arr[0]);
            }
            return finalObj;
        }

        for (platform in urls){         
            // Split by ',' if, for example, sent "web,iphone,default"
            var splitP = platform.split(',');
            for (var i=0, iLen = splitP.length; i<iLen; i++){
                if (trim(splitP[i]) === userPlatform){
                    // if we have only one URL
                    if (typeof urls[platform] === 'string') {
                        urls[platform] = new Array(urls[platform]); 
                    }
                    finalObj = urls[platform];                 
                    break;
                }
            }            
            if (finalObj){break;}
        }               
                        
        /*if (cfg.hasHost === true) {
            finalObj = _getObj(finalObj || urls['default']);
            if (finalObj){
                if (options['debug']){
                    return finalObj['url'];
                }
                else{
                    if (!isMobile && finalObj['newWindow']){
                        window.open(finalObj['url'], '_blank', 'status=no');
                    }
                    else{
                        location.href = finalObj['url'];
                    }
                    return true;
                }
            }
        } else {   */       
            // use default if no platform is specified
            if (!finalObj) {
                finalObj = new Array(urls['default']);
            }
            
            // we have only one link - no popup should be opened
                                    
            if (finalObj.length == 1) {
                location.href = finalObj[0];
                return true;
            }
                               
            var a = document.getElementById('alertView');
            if (!a){
                var styleRules = '#doatOpenWin ul { list-style-type: none; }' +
                                '#doatOpenWin ul li { padding: 6px 0; }' +
                                '#doatOpenWin ul li a { color: #fff; text-decoration: none; font-size: 13px; }' +
                                                        
                                    '#alertView{'+
                                            'text-align: center;' +
                                            'width: 250px;' +
                                            'position: absolute;' +                                     
                                            'left: 50%;' +
                                            'margin-left: -135px;' +
                                            'border: 2px solid #fff;' +
                                            'border-radius: 20px;' +
                                            '-moz-border-radius: 20px;' +
                                            '-webkit-border-radius: 20px;' +
                                            'background:  rgba(59, 80, 119, 0.9) ;' +
                                            'box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);' +
                                            '-moz-box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);' +
                                            '-webkit-box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);' +
                                            'overflow:hidden;' +
                                            'z-index:1000;' +
                                            'padding:10px;' +
                                            'display:none;' +
                                    '}'+
                                    '#alertView div#shine {' +
                                        'position: absolute;' +
                                        'top: -1474px;' +
                                        'height: 1500px;' +
                                        'width: 1500px;' +
                                        'border-radius: 1500px;' +
                                        '-moz-border-radius: 1500px;' +
                                        '-webkit-border-radius: 1500px;' +
                                        'background: rgb(255, 255, 255);' +
                                        'left: -626px;' +
                                        'background: -webkit-gradient(' +
                                        'linear,' +
                                        'left bottom,' +
                                        'left top,' +
                                        'color-stop(0, rgba(59,81,119, 0.5)),' +
                                        'color-stop(0.06, rgba(255,255,255, 0.5))' +
                                        ');' +
                                        'background:    -moz-linear-gradient(' +
                                        'center bottom,' +
                                        'rgba(59,81,119, 0.5) 0%,' +
                                        'rgba(255,255,255, 0.5) 4%' +
                                        ');' +
                                        'opacity: 1;' +
                                        'filter: alpha(opacity = 05);' +
                                        'z-index: 5;' +
                                    '}'+
                                    '#alertView h2, #alertView p{'+
                                        'color: white;' +
                                        'margin: 0;' +
                                        'padding: 5px 10px;' +
                                        'font: 12px / 1.1em Helvetica, Arial, sans-serif;' +
                                        'position: relative;' +
                                        'z-index: 20;' +
                                    '}'+
                                    '#alertView h2{'+
                                        'text-align:center;' +
                                        'font: 18px / 1.1em Helvetica, Arial, sans-serif;' +
                                    '}'+
                                    '#alertView div.button.white{'+                                 
                                        'background: -webkit-gradient(' +
                                        'linear,' +
                                        'left bottom,' +
                                        'left top,' +
                                        'color-stop(0.13, rgb(62,73,101)),' +
                                        'color-stop(0.43, rgb(62,73,101)),' +
                                        'color-stop(1, rgb(221,222,224))' +
                                        ');' +
                                        'background: -moz-linear-gradient(' +
                                        'center bottom,' +
                                        'rgb(62,73,101) 13%,' +
                                        'rgb(62,73,101) 43%,' +
                                        'rgb(221,222,224) 100%' +
                                        ');' +               
                                    '}'+
                                    '#alertView div.button{'+
                                        'margin: 0 auto 6px;' +
                                        'display: block;' +
                                        'background: rgb(69, 90, 129);' +
                                        'border: 1px solid rgb(59, 80, 119);' +
                                        'border: 1px solid rgba(59, 80, 119, 1);' +
                                        'border-radius: 5px;' +
                                        '-moz-border-radius: 5px;' +
                                        '-webkit-border-radius: 5px;' +
                                        'background: -webkit-gradient(' +
                                        'linear,' +
                                        'left bottom,' +
                                        'left top,' +
                                        'color-stop(0.13, rgb(62,73,101)),' +
                                        'color-stop(0.43, rgb(62,73,101)),' +
                                        'color-stop(1, rgb(221,222,224))' +
                                        ');' +
                                        'background: -moz-linear-gradient(' +
                                        'center bottom,' +
                                        'rgb(62,73,101) 13%,' +
                                        'rgb(62,73,101) 43%,' +
                                        'rgb(221,222,224) 100%' +
                                        ');' +               
                                    '}'+
                                    '#alertView div.button p{'+
                                        'text-align: center;' +
                                        'margin: 0;' +
                                        'padding: 0;' +
                                    '}'+
                                    '#alertView div.button p a{' +
                                        'color: #333333;' +
                                        'color: rgba(255, 255, 255, 1);' +
                                        'text-decoration: none;' +
                                        'font: bold 14px/1.2em Helvetica, Arial, sans-serif;' +
                                        'margin: 0;' +
                                        'display: block;' +
                                        'padding: 7px 0 10px;' +
                                        'text-shadow: 0 1px 1px #5E5E5E;' +
                                        'border-radius: 5px;' +
                                        '-moz-border-radius: 5px;' +
                                        '-webkit-border-radius: 5px;' +
                                    '}'+
                                     
                                    '#alertView div.button p a:active {'+
                                        '-moz-box-shadow: 0 0 15px white;' +
                                        '-webkit-box-shadow: 0 0 15px white;' +
                                    '}';
                                    
                create('style', head, {'innerHTML': styleRules});
                                        
                var o = document.createElement("div");
                o.id = "doatOpenWin";
                var a = document.createElement("div");
                a.id = "alertView";
                
                var html = '<h2>Launching '+document.title+' app</h2><div class="links"></div>';                            
                html += '<div class="button" id="cancelButton"><p><a href="javascript://">Cancel</a></p></div>';
                html += '<div id="shine"></div>';
                a.innerHTML = html;             
                o.appendChild(a);
                document.body.appendChild(o);
                
                o.querySelector('#cancelButton').addEventListener('click', function(){a.style.display = 'none';}, false);
            }                   
            
            if (finalObj) {
                var html = '';              
                for (var i=0; i<finalObj.length; i++) {
                        var url = _normalize(finalObj[i]);
                        html += '<div class="button"><p><a href="' + url.url + '" ' + ((url.newWindow)? 'target="_blank"' : '') + '>' + url.label + '</a></p></div>';
                }   
                
                var linksContainer = document.querySelector('#alertView .links');               
                linksContainer.innerHTML = html;
                var links = linksContainer.querySelectorAll('a');
                                
                for (var x=0;x<links.length;x++) {
                    links[x].addEventListener('click',function(){a.style.display='none'},false);
                }                                                           
            }
            
            a.style.display = 'block';
            a.style.top = document.body.scrollTop + 40 + 'px';
       /* }*/
    }
}//Doat Main

// Instantiate object
var Doat = new Doat_Main();
if (!(typeof doat_config !== 'undefined' && doat_config.manualInit == true)){
    Doat.init();
}
    

