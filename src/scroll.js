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
* @class Scroll
* @description Provides the fixed positioning for header with scrolling content.
* When multiple content containers are present, Scroll makes only the first visible and enables use of MainObj.Nav
*/
function Doat_Scroll(){
    var self = this,
        MainObj,
        classnamePrefix,
        contentClassName,
        headerClassName,
        contentInnerClassName,
        iscrollArr = [],
        $container,
        $header,
        head = document.getElementsByTagName('head')[0],
        //iScrollConfig = {onBeforeScrollStart: null, vScrollbar: true, hScroll: false},      
        iScrollConfig = {vScrollbar: true, hScroll: false, useTransform: false},        
        cfg;
        
    //window.addEventListener('orientationchange', calculate, false);

    var isElementExists = function(){
        var _elements = $('.'+contentClassName);
        return (_elements.length > 0);
    };

    var fixElementsPositions = function(){
        if (hasFixedPositioning()){
            MainObj.Log && MainObj.Log.info(MainObj.Env.getInfo().platform+' '+MainObj.Env.getInfo().version+' has fixed positioning so using position: fixed');
            
            $header.css({
                'position': 'fixed',
                'top': 0,
                'left': 0,
                'width': '100%',
                'z-index': 2
            });

           $contents.css({
                'top': $header.get(0).offsetHeight+'px',
                'height': 'auto',
                'z-index': 1
            });
        }
        else{
            MainObj.Log && MainObj.Log.info(MainObj.Env.getInfo().platform+' '+MainObj.Env.getInfo().version+' has NO fixed positioning so using iScroll');
            
            if (iscrollArr.length == 0){
                document.body.addEventListener('touchmove', function(e){
                    //e.preventDefault();
                }, false);
            }

            for (var i=0, len=$contents.length; i<len; i++){
                var el = $contents[i];          
                var $el = $(el);                
               
                var id = el.getAttribute('id');
                if (iscrollArr[id]){
                    iscrollArr[id].refresh.call(iscrollArr[id]);
                }
                else if(!(cfg.disableIScroll && cfg.disableIScroll[id])){
                    $el.css({
                        'visibility': 'hidden',
                        'display': 'block'
                    });
                    
                    var config = {};
                    for (k in iScrollConfig) config[k] = iScrollConfig[k];       
                    
                    var $innerEl = $(el).children('*');
                    var hasInnerEl = $innerEl.length === 1;
                    if (!hasInnerEl){
                        var innerEl = document.createElement("div");
                        innerEl.className = classnamePrefix+'created';
                        innerEl.style.width = '100%';
                        for (var i=0, len=el.children.length; i<len; i++){
                            alert(el.children[i]);
                            innerEl.appendChild(el.children[i]);
                        }
                        el.appendChild(innerEl);
                    }
                    else{
                        $innerEl[0].style.width = '100%';                        
                    }
                    
                    if (cfg.pullToRefresh === id) {                                              
                        
                        var pullDownContainer = 'touchy-pulldown',
                            pullDownIconClass = 'touchy-pulldown-icon',
                            pullDownFlipClass = 'touchy-pulldown-flip',
                            pullDownLoadingClass = 'touchy-pulldown-loading',
                            pullDownLabelClass = 'touchy-pulldown-label',
                            pullDownLabelText = {'pull':'Pull down to refresh...',
                                                 'release':'Release to refresh...',
                                                 'loading':'Loading...'};                            
                        
                        var css = '#'+pullDownContainer+' {'+                        
                                  '     background:#000000;'+
                                  '     height:40px;'+
                                  '     line-height:40px;'+
                                  '     padding:5px 10px;'+                                  
                                  '     font-weight:bold;'+
                                  '     font-size:14px;'+
                                  '     color:#888888;'+
                                  '     visibility:hidden'+
                                  '}'+                        
                                  '#'+pullDownContainer+' .'+pullDownIconClass+' {'+
                                  '     display:block; float:left;'+
                                  '     width:40px; height:40px;'+                                                        
                                  '     background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAACgCAMAAACsXRuGAAAAt1BMVEX////FxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcU7SVrkAAAAPHRSTlMAAPONxyCMRvCjM2n59gzeD/xssVo52Akwh6sDpeTbckJLZroqfhUnRernVxifG9XDgb2ZzzxjeLThEmBcLCjmAAACDklEQVR4Xu2Y124yQQyFM9sh9BJafgik956/7fs/V4RCwiITbMdjCSGfKy4On7THnuLZ8yGTyRWUr1W54NgNIC4Dbm+VrQ+tbQxoQAMa0IAGnO4vtR44WBquCcBuJadrSslwQucNaBm2qbyHEQ3YqNN4l3fUKpdpMV7Q26ZF4T3S+5AU49OIA8RjvLpxDCAeY/PIcYB4jKf8tTzcxDt2fGBt/D3v19kPgK5fRQLkAt0MCZANdIdIgGxg7WBjgHygO1kTY/NVMla8QeBvJwHCGP84CRDG+PefBAhjrHTlo9n/InDiY9a7XfLazgewd//Jqze8AN15sAiw7Gu87XwAW/7m5ec5b+j8AXsveT6uSYAwxmrf7xNBZ+aYQJPJZDLh+20aRlkWhen8twdgnCyO0SCJfQDjUv6lUuwBmOQFJXJgGhSBQSoGhvmKQnFNo1VgBD3MmmarwAx6WDWFQOhh1RR+MvSwagqLwqw7/ndW3UkfCD2bhJcAephAvJGYn4y3OrMouIfZNriH19i4h7v0cI9ww4ce4ZEEPTt6/uJ+UdS4H28G1C9qV9yPLyjUL1vyuB/dlLh+dNtE/dpA+SdrF0XeNsqNLV96+puDfPvaaukfUvJjVP+gl19F9C9L8uuc/oVTfiXWv7TLxwr9wUc+msmHR/3xVj6A6z8RSBej/jMLp+76T1X6j2m7eP6aTO9STHV4CXebKAAAAABJRU5ErkJggg%3D%3D); 0 0 no-repeat;'+
                                  '     -webkit-background-size:40px 80px; background-size:40px 80px;'+
                                  '     -webkit-transition-property:-webkit-transform;'+
                                  '     -webkit-transition-duration:250ms;'+
                                  '     -webkit-transform:rotate(0deg) translateZ(0);'+  
                                  '}'+                                
                                  '#'+pullDownContainer+'.'+pullDownFlipClass+' .'+pullDownIconClass+' {'+
                                  '     -webkit-transform:rotate(-180deg) translateZ(0);'+
                                  '}'+                                                  
                                  '#'+pullDownContainer+'.'+pullDownLoadingClass+' .'+pullDownIconClass+' {'+
                                  '     background-position:0 100%;'+
                                  '     -webkit-transform:rotate(0deg) translateZ(0);'+
                                  '     -webkit-transition-duration:0ms;'+                     
                                  '     -webkit-animation-name:'+pullDownLoadingClass+';'+
                                  '     -webkit-animation-duration:2s;'+
                                  '     -webkit-animation-iteration-count:infinite;'+
                                  '     -webkit-animation-timing-function:linear;'+
                                  '}'+                             
                                  '@-webkit-keyframes '+pullDownLoadingClass+' {'+
                                  '     from { -webkit-transform:rotate(0deg) translateZ(0); }'+
                                  '     to { -webkit-transform:rotate(360deg) translateZ(0); }'+
                                  '}';
                        
                        create('style',head,{
                             type:'text/css',
                             innerHTML: css
                        });
                        
                        var html = '<div id="'+pullDownContainer+'">'+
                                   '    <span class="'+pullDownIconClass+'"></span>'+
                                   '    <span class="'+pullDownLabelClass+'">'+pullDownLabelText.pull+'</span>'+
                                   '</div>';  
                                   
                        $innerEl.prepend(html);
                        
                        $pullDownElement = $('#'+pullDownContainer);
                        $pullDownLabelClass = $pullDownElement.find('.'+pullDownLabelClass);
                        
                        pullDownOffset = $pullDownElement[0].offsetHeight; 
                        
                        var extraConfig = {
                          "onRefresh" : function() { 
                                $pullDownElement.css('visibility','visible');  
                                $pullDownElement.removeAttr('class');
                                $pullDownLabelClass.html(pullDownLabelText.pull);                                                                                                          
                          },
                          "onScrollMove" : function() {                            
                                if (this.y > 5 && !$pullDownElement.hasClass(pullDownFlipClass)) {
                                    $pullDownElement.addClass(pullDownFlipClass);
                                    $pullDownLabelClass.html(pullDownLabelText.release);
                                    this.minScrollY = 0;
                                } else if (this.y < 5 && $pullDownElement.hasClass(pullDownFlipClass)) {
                                     $pullDownElement.removeAttr('class');
                                    $pullDownLabelClass.html(pullDownLabelText.pull);
                                    this.minScrollY = -pullDownOffset;
                                }
                          },
                          "onScrollEnd" : function() {                               
                              if ($pullDownElement.hasClass(pullDownFlipClass)) {
                                  $pullDownElement.removeAttr('class');                                  
                                  //$pullDownElement.addClass(pullDownLoadingClass);
                                  $pullDownLabelClass.html(pullDownLabelText.loading);
                                  if (doat_config.pullToRefreshCB) {
                                      doat_config.pullToRefreshCB();
                                  } 
                                  iscrollArr[id].refresh.call(iscrollArr[id]);
                                  $pullDownElement.parent().css('-webkit-transform','translate3d(0px, -'+pullDownOffset+'px, 0px) scale(1)');
                                  //callback
                                  // myScroll.refresh();
                              }
                          },
                          "topOffset" : pullDownOffset,
                          "useTransition": true,
                          "useTransform": true         
                        };
                          
                        for (k in extraConfig) config[k] = extraConfig[k];                         
                    }                    
                    
                    iscrollArr[id] = new iScroll(id, config);
                    //iscrollArr[id] = {refresh:function(){}, scrollTo: function(){}};
                    
                    $el.bind('touchstart', {'id': id}, function(e){
                        var id = e.data.id;
                        iscrollArr[id].refresh.call(iscrollArr[id]);
                    });
                    
                    $el.css({
                        'display': 'none',
                        'visibility': 'visible'
                    });
                }
            };
        }
    };

    this.init = function(_cfg){
        cfg = _cfg;
        $container = $(document.body);
        
        MainObj = window.TouchyJS;
        classnamePrefix = 'tml_';
        contentClassName = classnamePrefix+'content';
        headerClassName = classnamePrefix+'header';
        contentInnerClassName = classnamePrefix+'scrollable';
        $contents = $container.children('.'+contentClassName);
        
        MainObj.Env.addEventListener("orientationChange", calculate);
        
        if ($contents.length > 0){
            calculate($contents);
            
            var displayContentIndex = cfg.displayContent || 0,
                currentContent = $contents[displayContentIndex];
            $(currentContent).css('display', 'block');
            MainObj.Nav.setCurrent(currentContent);
            
            //window.addEventListener('load', hideAddressBar, false);
            //window.addEventListener('DOMContentLoaded', hideAddressBar, false);
        }
    };
    
    function hideAddressBar(){
        document.body.removeEventListener('touchstart', hideAddressBar);
        var currentContent = MainObj.Nav.getCurrent();
        $(currentContent).css('height', window.screen && window.screen.availHeight+'px' || '1000px');
             
        window.scrollTo(0,0);
        
        setTimeout(function(){
            self.refreshAll();    
        }, 1000);
    }

    function calculate($contents){
        $contents = $contents && $contents.length ? $contents : $container.children('.'+contentClassName);
        
        $header = $header || $container.children('.'+headerClassName);
        var headerHeight = $header.length ? $header[0].offsetHeight : 0,
            contentHeight = window.innerHeight
                      - parseInt($container.css('margin-top'), 10)
                      - parseInt($container.css('margin-bottom'), 10)
                      - headerHeight;

        $contents.css({
            'width': '100%',
            'position': 'absolute',
            'top': headerHeight+'px'
        });
        
        if (cfg.fixedPositioning){
            fixElementsPositions(cfg.fixedPositioning === 'capableOnly');
        }
    }

    /**
     * @method refresh
     * @description Recalculates header/content heights. Use this when either elements have changed height.
     * @example
     * header.style.height = "40px";
     * MainObj.Scroll.refresh();
     */
    this.refresh = function(id, height){
        id = id || MainObj.Nav.getCurrent().getAttribute('id');
                
        if (height) {
            $("#" + id).children("*").css("height", height + "px");
        }

        if (iscrollArr[id]) {
            iscrollArr[id].refresh();
        }
    };
    
    this.refreshAll = function(){
        calculate();
    };
    
    this.scrollTo = function(y){
        var currentEl = MainObj.Nav.getCurrent(),
            id = currentEl.getAttribute('id');
        
        if (iscrollArr[id]){
            iscrollArr[id].scrollTo(0, y, 0);   
        }   
        else{
            currentEl.scrollTop = y;
        }   
    };

    this.disable = function(){
        var currentEl = MainObj.Nav.getCurrent(),
            id = currentEl.getAttribute('id');

        if (iscrollArr[id]){
            iscrollArr[id].disable();
        }
    };

    this.enable = function(){
        var currentEl = MainObj.Nav.getCurrent(),
            id = currentEl.getAttribute('id');

        if (iscrollArr[id]){
            iscrollArr[id].enable();
        }
    };
    
    /**
    * @method hasFixedPosition
    * @description Returns if the current browser has position:fixed enabled 
    * Returns true for iOS5+, Android2.2+ and all non-mobile devices
    * @return {boolean}
    */
    var hasFixedPositioning = function(){       
        if (!MainObj.Env.isMobile()){
            return true;
        }
        
        var i = MainObj.Env.getInfo();
            p = i.platform,
            v = i.version;          
            
        if (p === 'iphone' || p === 'ipad'){
            return isVersionOrHigher(v, '5');
        }
        else if (p === 'android'){
            return isVersionOrHigher(v, '2.2');
        }
        
        return false;
    };
    
    function isVersionOrHigher(v1, v2) {
        var v1parts = v1.split('.');
        var v2parts = v2.split('.');
        
        for (var i = 0; i < v1parts.length; ++i) {
            if (v2parts.length == i) {
                return true;
            }
            
            if (v1parts[i] == v2parts[i]) {
                continue;
            }
            else if (parseInt(v1parts[i], 10) > parseInt(v2parts[i], 10)) {
                return true;
            }
            else {
                return false;
            }
        }
        
        if (v1parts.length != v2parts.length) {
            return false;
        }
        
        return true;
    }
}
