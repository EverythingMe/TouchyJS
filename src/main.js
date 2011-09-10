// Copyright 2011 DoAT All Rights Reserved.

/**
 * @class
 * @description A global class providing tools for creating cross browser and cross platform compatible web apps with rich capabilities and UI.
 * @requires {object} jQuery If jQuery wasn't loaded in the document, a script request is sent.
 * @author ran@doat.com (Ran Ben Aharon)
 * @version: 0.671
 */
function Main(){
	var self = this,
        $document, head = document.getElementsByTagName('HEAD')[0],
		DOML, Env, Navigation, Searchbar, Scroll, Slider, Swiper, envInfo,
        cfg = {};

    if (typeof doat_config !== 'undefined'){
        cfg = aug(cfg, doat_config);
    }

    this.init = init;
    this.renderHTML = renderHTML;
    this.openLink = openLink;
    this.getSearchQuery = getSearchQuery;
    this.visible = this.focused = false;

    this.Log = typeof Logger !== "undefined" && new Logger() || null;

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
            'content': 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;'
        });
        // Hide top searchbar in iphones
        if (envInfo.platform.name === 'iphone'){
            create('META', head, {
                'name': 'apple-mobile-web-app-capable',
                'content': 'yes'
            });
        }
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

        Navigation = new Doat_Navigation();
        self.Navigation = self.Nav = Navigation;

        // Event handlers
        self.Events.focused(function(){
        	cfg.hasHost = true;
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

		$document.ready(function(){
			DOML.parse();

            Scroll.init(cfg);
            Navigation.init(cfg);

            addClass(document.body, 'doml-env-'+envInfo.platform.name);

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
			});
			self.Events.dispatchEvent('ready', {'callOnce': true});
		});

        var q = parseQuery();
        self.params = {};
		self.params.query = q['do_query'] ? decodeURIComponent(q['do_query']) : '';
		self.params.experience = q['do_experience'] ? decodeURIComponent(q['do_experience']) : '';
		self.params.platform = q['do_platform'] ? q['do_platform'] : '';
        self.params.attributes = q['do_attr'] ? JSON.parse(decodeURIComponent(q['do_attr'])) : {};
	}

    /**
     * @method getSearchQuery
     * @description Returns the original search query sent by the host
	 * @returns {String}
	 */
	function getSearchQuery(){
		return self.params.query;
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
				platform = Env.getInfo().platform;

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
            userPlatform = Env.getInfo().platform,
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
                    finalObj = urls[platform];
                    break;
                }
            }
            if (finalObj){break;}
        }
		
        if (cfg.hasHost === true) {
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
        } else {
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
										'background:	-moz-linear-gradient(' +
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
	            
	            var html = '<h2>Launching '+document.title+' app</h2>';
	            for (var i=0; i<finalObj.length; i++) {
	                var url = _normalize(finalObj[i]);
	                html += '<div class="button"><p><a href="' + url.url + '" ' + ((url.newWindow)? 'target="_blank"' : '') + '>' + url.label + '</a></p></div>';
	            }	            
	            html += '<div class="button" id="cancelButton"><p><a href="javascript://">Cancel</a></p></div>';
	            html += '<div id="shine"></div>';
	            a.innerHTML = html;	            
	            o.appendChild(a);
	            document.body.appendChild(o);
	            
            	o.querySelector('#cancelButton').addEventListener('click', function(){a.style.display = 'none';}, false);
        	}

	        a.style.display = 'block';
	        a.style.top = document.body.scrollTop + 40 + 'px';
        }
    }
}

// Instantiate object
var Doat = new Main();
if (!window.touchyjsConfig || !touchyjsConfig.manualInit){
    Doat.init();
}

	

