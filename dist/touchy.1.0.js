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

(function(){


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
function create(tagName, parent, props, callback, adjacentNode) {
    var doc = parent ? parent.ownerDocument : document;
    var o = doc.createElement(tagName);
    if (props) for (var p in props) {
        if (p == 'style') {
            var styles = props[p];
            for (var s in styles) o.style.setProperty(s, styles[s]);
        } else o[p] = props[p];
    }
    if (callback && tagName == 'script'){
        var loaded = false;
        var loadFunction = function(){
            if (loaded) {
                return;
            }
            loaded=true;
            callback();
        };
        o.onload = loadFunction;
        o.onreadystatechange = function(){
            if (this.readyState == 'loaded'){
                loadFunction();
            }
        };
    }
    if (parent){
        // IE compatibility
        try {
            parent.insertBefore(o, adjacentNode);
        }
        catch(e){
            parent.insertBefore(o);
        }
    }
    return o;
}

function parseQuery() {
   var r = {};
   (location.search || '').replace(/([^=^&^?]+)=([^&]*)/g, function(ig, k, v) {r[k] = v;});
   return r;
}

function proxify(origObj,proxyObj,funkList){
    var replaceFunk = function(org,proxy,fName)
    {
        org[fName] = function()
        {
           return proxy[fName].apply(proxy,arguments);
        };
    };

    for(var v in funkList) {replaceFunk(origObj,proxyObj,funkList[v]);}
}

function unique(a) {
    if (!a) return a;
    var i=a.length, r=[], s={};
    while (i--) {
        var k = a[i];
        if (!s[k]) {
            s[k] = true;
            r.push(k);
        }
    }
    return r;
}

function aug(json1, json2){
    json1 = json1 || {};
    for (var key in json2) json1[key] = json2[key];
    return json1;
}

function addClass(el, newName){
    var curName = el.className;
    newName = curName !== '' ? ' '+newName : newName;
    el.className+= newName
}

function trim(str){
    if (str.trim){
        return str.trim();
    }
    else{
        return str.replace(/^\s+|\s+$/g, '');
    }
}

var Logger = function(){
    function getLoggerLevel(){
    	if (/http:\/\/.+\.(loc)\.flyapps\.me\//.test(location.href) || /http:\/\/loc\.flyapps\.me\//.test(location.href) || /http:\/\/.+test\.flyapps\.me\//.test(location.href)){
            return Log.DEBUG;
        }
        else if (/http:\/\/.+\.(stg|test)\.flyapps\.me\//.test(location.href)){
            return Log.INFO;
        }
        else if (/http:\/\/.+\.flyapps\.me\//.test(location.href)){
            return Log.ERROR;
        }
        return Log.DEBUG;
    }

    function getLoggerOutput(){
        var loggerOutput = parseQuery()['doatloggeroutput'];
        if (loggerOutput){
            switch (loggerOutput){
                case 'console':
                    return Log.consoleLogger;
                    break;
                case 'inline':
                    return Log.writeLogger;
                    break;
                case 'alert':
                    return Log.alertLogger;
                    break;
                case 'popup':
                    return Log.popupLogger;
                    break;
                default:
                    if (window[loggerOutput]){
                        return window[loggerOutput]
                    }
            }
        }
        return Log.consoleLogger;
    }

    return new Log(getLoggerLevel(), getLoggerOutput());
};

function addListener(){
    if (typeof arguments[0] === 'string'){
        arguments[2] = arguments[1];
        arguments[1] = arguments[0];
        arguments[0] = document;
    }
    var el = arguments[0],
        type = arguments[1],
        cb = arguments[2];

    if (typeof el.addEventListener !== 'undefined'){
      el.addEventListener(type, cb, false);
    }
    else if (el.attachEvent){
      el.attachEvent('on'+type, cb, false);
    }
}

function removeListener(){
    if (typeof arguments[0] === 'string'){
        arguments[2] = arguments[1];
        arguments[1] = arguments[0];
        arguments[0] = document;
    }
    var el = arguments[0],
        type = arguments[1],
        cb = arguments[2];

    if (typeof el.removeEventListener !== 'undefined'){
      el.removeEventListener(type, cb, false);
    }
    else if (el.detachEvent){
      el.detachEvent('on'+type, cb);
    }
}

var objectEqual = function(x, y)
{
  var p;
  for(p in y) {
      if(typeof(x[p])=='undefined') {return false;}
  }

  for(p in y) {
      if (y[p]) {
          switch(typeof(y[p])) {
              case 'object':
                  if (!y[p].equals(x[p])) { return false; } break;
              case 'function':
                  if (typeof(x[p])=='undefined' ||
                      (p != 'equals' && y[p].toString() != x[p].toString()))
                      return false;
                  break;
              default:
                  if (y[p] != x[p]) { return false; }
          }
      } else {
          if (x[p])
              return false;
      }
  }

  for(p in x) {
      if(typeof(y[p])=='undefined') {return false;}
  }

  return true;
}


/**
 * Contains the cross-domain messaging functionality for communication between an app and the host
 * @class
 * @ignore
 */
function Doat_Messenger(){
    var messageArr = [],
        attachData = {},
        authFunc = function(){
            return {
                'error': 'OK'
            };
        };

    this.bind = bind;
    this.unbind = unbind;
    this.trigger = trigger;
    this.attach = attach;
    this.setAuthFunc = setAuthFunc;

    /* window.onMessage */
    addListener(window, 'message', onMessage);

    function onMessage(originalMessage){
        var auth = authFunc(originalMessage);

        if (auth.error === 'OK'){
            var message = JSON.parse(originalMessage.data);
            message = aug(message, auth.attachData);

            var funcArr = messageArr[message['msnEventType']];
            if (funcArr){
                var meta = {
                    'source': originalMessage.source,
                    'type': message['msnEventType']
                };
                delete message['msnEventType'];
                var data = message;
                for (var i=0; i<funcArr.length; i++){
                    var func = funcArr[i];
                    func(meta ,data);
                }
            }
        }
    }

    /*function onMessage2(originalMessage){
        var m = contextParse(originalMessage);
        if (m) for (var i=0, a=messageArr[m.type], n=a?a.length:0; i<n; ++i) a[i](originalMessage.source, m.data);
    }*/

	/**
	* Defines a function to be executed on arrival of a specified message type.
	* @param {string | Array} typeArr Message type name or names.
	* @param {function} func The function to be executed on message arrival.
	*/
	function bind(typeArr, func){
        typeArr = (typeArr instanceof Array) ? typeArr : [typeArr];
        for (var idx in typeArr){
            var type=typeArr[idx];
            var a=messageArr[type];
            if (!a) messageArr[type] = a = [];
            a.push(func);
        }
    }

	/**
	* Unbinds by removing the func from messageArr[type] array
	* @param {string} type
	* @param {function} func
	*/
	function unbind(type, func){
        if (!func){
            messageArr[type] = null;
        }
        else{
            for (var a=messageArr[type], i=a?a.length-1:-1; i>=0; --i) {
                if (a[i]===func) {
                    a.splice(i, 1);
                    return;
                }
            }
        }        
	}
  /**
   * Sends a message to the dashboard.
   * @param {object Window | String | JSON Object}
   * @description
   * Starts by making the JSON data safe for stringify
   * Stringifies the JSON (cause only strings are allowed as a postMessage param)
   * Sends the message using HTML5 cross-domain messaging
   */
    function trigger(){
        if (typeof arguments[0] === 'string'){
            arguments[2] = arguments[1];
            arguments[1] = arguments[0];
            arguments[0] = window.parent;
        }
        var win = arguments[0];
        var data = arguments[2] || {};
            data['msnEventType'] = arguments[1];
            data = aug(data, attachData);

        win.postMessage(JSON.stringify(data), '*');
    }

    /**
    * Sets the obj as the attachData
    * attachData is added to the triggered data
    */
    function attach(obj){
        attachData = obj;
    }

    function setAuthFunc(func){
        authFunc = func;
    }
}

function enableMobileAnalytics(Messenger, isMobile){
    var Log = Doat.Log || new Logger()
    var gaObj = new doat_GoogleAnalytics();
    gaObj.load(Log);

    if (isMobile){
        var nativeObj = new doat_nativeAppReporter();
        nativeObj.load(Log);
    }

    // USER_ACTION, PAGE_VIEW
    Messenger.bind([Doat.Events.USER_ACTION, Doat.Events.PAGE_VIEW], actionEventsCallback);
    // TRACING
    Messenger.bind([Doat.Events.WINDOW_LOADED, Doat.Events.RENDER_END], tracingEventsCallback);
    // No result
    Messenger.bind(Doat.Events.NO_RESULTS, noresultEventCallback);
    // When starting a new search - disable RENDER_END reporting
    Messenger.bind([Doat.Events.RENDER_END, Doat.Events.NO_RESULTS], function(event, data){
        Messenger.unbind(Doat.Events.RENDER_END, tracingEventsCallback);
        if (nativeObj) {nativeObj.report(event.type);}
    });
    // USER_ACTION, PAGE_VIEW
    Messenger.bind(Doat.Events.SEARCH_ERROR, searchErrorEventsCallback);

    function noresultEventCallback(event, data){
        gaObj.report([
            '_trackEvent', // trackType
            'Tracing', // category
            event.type, // action
            data.query // label
        ]);
    }

    function searchErrorEventsCallback(event, data){
        Log.error('Error getting search results '+JSON.stringify(data));
        noresultEventCallback(event, data);
    }

    function actionEventsCallback(event, data){
        var pageUrl;
        switch (data.action){
            case 'Navigate':
                pageUrl = '/'+data['to'];
                pageUrl+= (data.title) ? '/'+data.title.replace('/', '-') : '';
                break;
            case 'Search':
            case 'PageView':
                var query = data.newQuery || data.query;
                data.page = data.page || 'search';
                pageUrl = '/'+data.page;
                pageUrl+= (query) ? '/'+query.replace('/', '-') : '';
                break;
            default:
                return false;
        }

        gaObj.report([
            '_trackPageview', // trackType
            pageUrl // page URL
        ]);

        return true;
    }


    function tracingEventsCallback(event){
        var time = -1;
        if (typeof doat_ts !== 'undefined'){
            time = new Date().getTime()-doat_ts;
        }

        gaObj.report([
            '_trackEvent', // trackType
            'Tracing', // category
            event.type, // action
            getTracingLabel(time), // label
            time // value
        ]);
    }

    function getTracingLabel(time){
        var i;
        for (i=0; i<=5; i++){
            if (time/1000<i){
                return 'under '+i+' sec';
            }
        }
        return 'over '+(i-1)+' sec';
    }
}

function doat_GoogleAnalytics(){
    var ga_account, ga_domain, Log;

    if (/loc\.flyapps\.me/.test(location.host)){
        ga_account = 'UA-16876190-2';
        ga_domain = '.loc.flyapps.me';
    }
    else if (/test\.flyapps\.me/.test(location.host)){
        ga_account = 'UA-16876190-8';
        ga_domain = '.test.flyapps.me';
    }
    else if (/stg\.flyapps\.me/.test(location.host)){
        ga_account = 'UA-16876190-7';
        ga_domain = '.stg.flyapps.me';
    }
    else if (/flyapps\.me/.test(location.host)){
        ga_account = 'UA-16876190-4';
        ga_domain = '.flyapps.me';

    }

    this.report = function(params){
        try{
            _gaq.push(params);
            var _gaq_status = (!_gaq.length) ? 'GA object' : 'temp array';
            Log.info('Pushed event to _gaq ('+_gaq_status+') -> '+JSON.stringify(params));
        }
        catch(err){
            Log.error('An error occured when performing _gaq.push ('+JSON.stringify(params)+')');
        }
    };

    this.load = function(_Log){
        Log = _Log;
        var appName = (typeof doat_appName == 'undefined') ? location.host.split('.')[0] : doat_appName;
        _gaq = (typeof _gaq !== 'undefined') ? _gaq : [];
        _gaq.push(
            ['_setAccount', ga_account],
            ['_setDomainName', ga_domain],
            ['_setCustomVar', 1, 'appname', appName]
        );
        Log.info('Loading GA for account "'+ga_account+'" under domain "'+ga_domain+'" with appname "'+appName+'"');

        create(
            'script',
            document.getElementsByTagName('HEAD')[0],
            {
                'type': 'text/javascript',
                'src': (("https:" == document.location.protocol) ? "https://ssl." : "http://www.") + 'google-analytics.com/ga.js',
                'async': 'true'
            }
        );
    };
}

function doat_nativeAppReporter(){
    var Log;

    this.load = function(_Log){
        Log = _Log;
    };

    this.report = function(eventType, time){
        var url = 'doatJS://report/'+eventType
        Log.info('Reporting to native app -> "'+url+'"');
        //location.href = url;
    };
}

/**
 * @fileoverview Javascript Logger (in the spirit of log4j)
 * This library is designed to make the writing and debugging
 * of javascript code easier, by allowing the programmer to perform
 * debug or log output at any place in their code.  This supports
 * the concept of different levels of logging (debug < info < warn < error < fatal << none)
 * as well as different log outputs.  Three log outputs are included, but you can
 * add your own.  The included log outputs are {@link Log#writeLogger},
 * {@link Log#alertLogger}, and {@link Log#popupLogger}.  For debugging on Safari,
 * the log ouput {@link Log#consoleLogger} is also included.  To turn off debugging
 * but still leave the logger calls in your script, use the log level {@link Log#NONE}.
 *
 * Example usage:
 * <pre>
 * &lt;html&gt;
 *  &lt;head&gt;
 *      &lt;script src="log4js.js" type="text/javascript"&gt;&lt;/script&gt;
 *  &lt;/head&gt;
 *  &lt;body&gt;
 *     Log4JS test...&lt;hr/&gt;
 *     &lt;script&gt;
 *        // Setup log objects
 *        //
 *        //  log object of priority debug and the popup logger
 *        var log = new Log(Log.DEBUG, Log.popupLogger);
 *        //  log object of priority warn and the alert logger
 *        var log2 = new Log(Log.WARN, Log.alertLogger);
 *        //  log object of priority debug and the console logger (Safari)
 *        var log3 = new Log(Log.DEBUG, Log.consoleLogger);
 *
 *        log.debug('foo1');     // will popup a new window and log 'foo'
 *        log.warn('bar1');      // will add a new 'bar' message to the popup
 *        log2.debug('foo2');    // will do nothing (Log object's priority threshold is WARN)
 *        log2.warn('bar2');     // will display a javascript alert with the string 'bar'
 *        log3.debug('foo3');    // will log message to Safari console or existing popup
 *        log3.warn('bar3');     // same
 *
 *        log.info(Log.dumpObject(new Array('apple','pear','orange','banana')));
 *     &lt;/script&gt;
 *  &lt;/body&gt;
 * &lt;/html&gt;
 * </pre>
 *
 * @author Marcus R Breese mailto:mbreese@users.sourceforge.net
 * @license Apache License 2.0
 * @version 0.31
 *<pre>
 **************************************************************
 *
 * Copyright 2005 Fourspaces Consulting, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 *
 * http://www.apache.org/licenses/LICENSE-2.0 
 *
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License
 *
 **************************************************************
 *
 * Changelog:
 * 0.31 Bug fix (resizeable should be resizable - Darryl Lyons)
 * 0.3  Migrated to SF.net SVN repository - test cleanups
 * 0.2  - Added consoleLogger for Safari
 *      - Changed popupLogger so that it only notifies once (or twice)
 *        that a popup blocker is active.   
 *      - Added Log.NONE level for silencing all logging
 * </pre>
 */



/**
 * Create a new logger
 * @constructor
 * @class The main Log class.  Create a new instance of this class to send all logging events.
 * @param level The cut-off logger level.  You can adjust this level in the constructor and leave all other logging events in place.  Defaults to {@link Log#WARN}.
 * @param logger The logger to use.  The logger is a function that accepts the logging events and informs the user or developer. Defaults to {@link Log#writeLogger}.
 */
function Log(level,logger,prefix) {
       var _currentLevel = Log.WARN;
       var _logger = Log.writeLogger; // default to write Logger
       var _prefix = false;
       this._isMobileBrowser = Log.isMobileBrowser();
       /**
        * Sets the current logger prefix 
        * @param {String} prefix This prefix will be prepended to all messages.
        */
       this.setPrefix = function(pre) {
           if (pre!='undefined') { _prefix = pre; }
       else { _prefix = false; }
       }
       /**
        * Sets the current logger function
        * @param logger The function that will be called when a log event needs to be displayed
        */
       this.setLogger = function(logger) {
           if (logger!='undefined') { _logger = logger; }
           if (logger === Log.writeLogger){
               var loggerWrapper = document.createElement("div");
               loggerWrapper.id = "logger";
               loggerWrapper.style.backgroundColor = "white";
               loggerWrapper.style.position = "fixed";
               loggerWrapper.style.top = "100px";
               loggerWrapper.style.left = "0";
               loggerWrapper.style.zIndex = "20";
               loggerWrapper.style.overflow = "scroll";
               loggerWrapper.style.height = "400px";
               
               document.body.appendChild(loggerWrapper);
               
               var clear = document.createElement("a");
               clear.innerHTML = "clear";
               clear.href = "javascript://";
               clear.addEventListener("click", function(){
                   loggerList.innerHTML = "";
               }, false);
               loggerWrapper.appendChild(clear);
               
               loggerList = document.createElement("ul");
               loggerWrapper.appendChild(loggerList);
           }
       }

       /**
        * Sets the current threshold log level for this Log instance.  Only events that have a priority of this level or greater are logged.
        * @param level The new threshold priority level for logging events.  This can be one of the static members {@link Log#DEBUG},  {@link Log#INFO}, {@link Log#WARN}, {@link Log#ERROR}, {@link Log#FATAL}, {@link Log#NONE}, or it can be one of the strings ["debug", "info", "warn", "error", "fatal", "none"].
        */
       this.setLevel = function(level) { 
           if (level!='undefined' && typeof level =='number') {
                   _currentLevel = level;
           } else if (level!='undefined') {
                   if (level=='debug') { _currentLevel = Log.DEBUG; }
                   else if (level=='info') { _currentLevel = Log.INFO; }
                   else if (level=='error') { _currentLevel = Log.ERROR; }
                   else if (level=='fatal') { _currentLevel = Log.FATAL; }
                   else if (level=='warn') { _currentLevel = Log.WARN; }
                   else { _currentLevel = Log.NONE; }
           }
       }

       /**
        * Gets the current prefix
    * @return current prefix
    */
       
       this.getPrefix = function() { return _prefix; }

       /**
        * Gets the current event logger function
    * @return current logger
    */
       
       this.getLogger = function() { return _logger; }

       /**
        * Gets the current threshold priority level
    * @return current level
    */
       
       this.getLevel = function() { return _currentLevel; }
       
       if (level!='undefined') { this.setLevel(level); }
       if (logger!='undefined') { this.setLogger(logger); }
       if (prefix!='undefined') { this.setPrefix(prefix); }
}
/**
 * Log an event with priority of "debug"
 * @param s the log message
 */
Log.prototype.debug     = function() { if (this.getLevel()<=Log.DEBUG) { this._log("DEBUG",this, arguments); } }
/**
 * Log an event with priority of "info"
 * @param s the log message
 */
Log.prototype.info      = function() { if (this.getLevel()<=Log.INFO ) { this._log("INFO",this, arguments); } }
/**
 * Log an event with priority of "warn"
 * @param s the log message
 */
Log.prototype.warn      = function() { if (this.getLevel()<=Log.WARN ) { this._log("WARN",this, arguments); } }
/**
 * Log an event with priority of "error"
 * @param s the log message
 */
Log.prototype.error     = function() { if (this.getLevel()<=Log.ERROR) { this._log("ERROR",this, arguments); } }
/**
 * Log an event with priority of "fatal" 
 * @param s the log message
 */
Log.prototype.fatal     = function() { if (this.getLevel()<=Log.FATAL) { this._log("FATAL",this, arguments); } }

/**
 * _log is the function that actually calling the configured logger function.
 * It is possible that this function could be extended to allow for more
 * than one logger.
 * 
 * This method is used by {@link Log#debug}, {@link Log#info}, {@link Log#warn}, {@link Log#error}, and {@link Log#fatal}
 * @private
 * @param {String} msg The message to display
 * @param level The priority level of this log event
 * @param {Log} obj The originating {@link Log} object.
 */
Log.prototype._log = function(level,obj,msgObj) {
    // INFO: 2010-12-26 14:11:42,690 in User::resetDailyVotes() (User.php:850): Reset Daily Votes for 0 Use
    var date = new Date();
    var d = "";
    d += ((date.getHours() < 10)? "0" + date.getHours() : date.getHours());
    d += ":" + ((date.getMinutes() < 10)? "0" + date.getMinutes() : date.getMinutes());
    d += ":" + ((date.getSeconds() < 10)? "0" + date.getSeconds() : date.getSeconds());
    d += "." + ((date.getMilliseconds() < 100)? ((date.getMilliseconds() < 10)? "00" + date.getMilliseconds() : "0" + date.getMilliseconds()) : date.getMilliseconds());
    
    var msgArr = [], dateStr = '('+d+')';
    if (this._isMobileBrowser){
        var msgStr = dateStr+" ";
        for (var i=0, len=msgObj.length; i<len; i++){ msgStr+= " "+msgObj[i] }
        msgArr = [msgStr];
    }
    else{
        msgArr = ['('+d+')'];
        for (i in msgObj){ msgArr.push(msgObj[i]); }
    }
    
    this.getLogger()(level,obj,msgArr);
}

Log.DEBUG       = 1;
Log.INFO        = 2;
Log.WARN        = 3;
Log.ERROR       = 4;
Log.FATAL       = 5;
Log.NONE        = 6;

/**
 * Static alert logger method.  This logger will display a javascript alert (messagebox) with the message.
 * @param {String} msg The message to display
 * @param level The priority level of this log event
 */
Log.alertLogger = function(level,obj,msgArr) { alert(level+" - "+msgArr.join(' ')); }
/**
 * Static write logger method.  This logger will print the message out to the web page using document.writeln.
 * @param {String} msg The message to display
 * @param level The priority level of this log event
 */
Log.writeLogger = function(level,obj,msgArr) { 
    var li = document.createElement("li");
    li.innerHTML = level+"&nbsp;:&nbsp;"+msgArr.join(' ');
    var firstLi = loggerList.getElementsByTagName("li")[0];
    loggerList.insertBefore(li, firstLi);
}


/**
 * Static Safari WebKit console logger method. This logger will write messages to the Safari javascript console, if available.
 * If this browser doesn't have a javascript console (IE/Moz), then it degrades gracefully to {@link Log#popupLogger}
 * @param {String} msg The message to display
 * @param level The priority level of this log event
 * @param {Log} obj The originating {@link Log} object.
 */
Log.consoleLogger = function(level,obj,msgArr) {
    if (window.console) {
        try{
            window.console[level.toLowerCase()].apply(window.console, msgArr);
        }
        catch(err){
            try{
                window.console[level.toLowerCase()](msgArr);
            }
            catch(err){
                window.console.log(level+":"+msgArr);
            }
        }
        
    } /*else {
        Log.popupLogger(msg,level,obj);
    }*/
}
 

/**
 * Static popup logger method.  This logger will popup a new window (if necessary), and add the log message to the end of a list.
 * @param {String} msg The message to display
 * @param level The priority level of this log event
 * @param {Log} obj The originating {@link Log} object.
 */
Log.popupLogger = function(level,obj,msgArr) {
    var msg = msgArr.join(' ');
       if (obj.popupBlocker) {
    return;
       }
       if (!obj._window || !obj._window.document) {
               obj._window = window.open("",'logger_popup_window','width=420,height=320,scrollbars=1,status=0,toolbars=0,resizable=1');
               if (!obj._window) { obj.popupBlocker=true; alert("You have a popup window manager blocking the log4js log popup display.\n\nThis must be disabled to properly see logged events."); return; }
           if (!obj._window.document.getElementById('loggerTable')) {
                       obj._window.document.writeln("<table width='100%' id='loggerTable'><tr><th align='left'>Level</th><th width='100%' colspan='2' align='left'>Message</th></tr></table>");
                       obj._window.document.close();
               }
       }
       var tbl = obj._window.document.getElementById("loggerTable");
       var row = tbl.insertRow(-1);

       //var cell_1 = row.insertCell(-1);
       var cell_2 = row.insertCell(-1);
       var cell_3 = row.insertCell(-1);

       /*var d = new Date();
       var h = d.getHours();
       if (h<10) { h="0"+h; }
       var m = d.getMinutes();
       if (m<10) { m="0"+m; }
       var s = d.getSeconds();
       if (s<10) { s="0"+s; }
       var date = (d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear()+"&nbsp;-&nbsp;"+h+":"+m+":"+s;*/

       /*cell_1.style.fontSize="8pt";
       cell_1.style.fontWeight="bold";
       cell_1.style.paddingRight="6px";*/
       
       cell_2.style.fontSize="8pt";
       
       cell_3.style.fontSize="8pt";
       cell_3.style.whiteSpace="nowrap";
       cell_3.style.width="100%";

       if (tbl.rows.length % 2 == 0) {
        //cell_1.style.backgroundColor="#eeeeee";
        cell_2.style.backgroundColor="#eeeeee";
        cell_3.style.backgroundColor="#eeeeee";
       }
       
       //cell_1.innerHTML=date
       cell_2.innerHTML=level;
       cell_3.innerHTML=msg;
}

/**
 * This method is a utility function that takes an object and creates a string representation of it's members.
 * @param {Object} the Object that you'd like to see
 * @return {String} a String representation of the object passed
 */
Log.dumpObject=function (obj,indent) {
    if (!indent) { indent="";}
    if (indent.length>20) { return ; } // don't go too far...
    var s="{\n";
        for (var p in obj) {
            s+=indent+p+":";
            var type=typeof(obj[p]);
            type=type.toLowerCase();
            if (type=='object') {
                s+= Log.dumpObject(obj[p],indent+"----");
            } else {
                s+= obj[p];
            }
            s+="\n";
        }
        s+=indent+"}";
        return s;
}
Log.isMobileBrowser=function (uaStr) {
    !uaStr && (uaStr = navigator.userAgent);
    uaStr = uaStr.toLowerCase();
    var m = /(iphone|ipad|android|symbian|webos|windows phone os)/.exec(uaStr) || [];
    return m[1];
}


var Doat_Extractor = function(){
    var _this = this,
        PARENT = navigator, NS = "everything", EXTRACTOR = "extractor",
        CONFIG = "extractor_config", SITES = "sites", arr;

    this.init = function() {
        // add to extractor config
        var cfg = window[CONFIG] = window[CONFIG] || {};
        arr = cfg[SITES] = cfg[SITES] || [];    
    };
    
    this.set = function(data) {
        !(data instanceof Array) && (data = [data]);
        
        // push into extractor_config.sites
        for (var i=0; i<data.length; i++) {
            arr.push(data[i]);
        }
    };
    
    this.getItems = function() {
        var items = PARENT[NS][EXTRACTOR].getItems? PARENT[NS][EXTRACTOR].getItems() : "NOT IMPLEMENTED";
        return items;
    };
    
    _this.init();
};

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
* Providing the ability to embed DOML tags inside the document HTML, parse and replace with predefined code.
* @class
*/
function Doat_DOML(){
    var imageTemplate = 'http://doatresizer.appspot.com/?url={src}&width={width}&height={height}&cache=short&crop={crop}&default={default}', 
    templates = {
        'searchbar':{
        			type: 'replace',
        			html: '<form '+
                            'id="doml-searchbar-form" '+
                            'onsubmit="Doat.Searchbar.submitFunc({onsubmit}); return false;" '+
                            '>'+                            
                                '<input type="text" '+
                                'data-defaulttext="{defaulttext}" '+
                                'onfocus="Doat.Searchbar.clearValue(\'{defaulttext}\')" '+
                                'onblur="Doat.Searchbar.fillValue(\'{defaulttext}\')" '+
                                'id="doml-searchbar-searchfield" '+
                                'name="searchfield" '+
                                'style="{style}" '+
                                'data-clearbutton={clearbutton}' +
                                '/>'+
                        '</form>'
                    },                           
        'searcharea':{
        			type: 'replace',
        			html: '<form '+
                            'id="doml-searchbar-form" '+
                            'onsubmit="Doat.Searchbar.submitFunc({onsubmit}); return false;" '+
                            '>'+                            
                                '<textarea '+                                
                                'onfocus="Doat.Searchbar.clearValue(\'{defaulttext}\')" '+
                                'onblur="Doat.Searchbar.fillValue(\'{defaulttext}\')" '+
                                'id="doml-searchbar-searchfield" '+
                                'name="searchfield" '+
                                'style="{style}" '+
                                'clearbutton={clearbutton}' +
                                '>{defaulttext}'+
                                '</textarea>'+
                        '</form>'
                    },                    
        'navigate': {type: 'replace', html: '<a href="javascript://" class="{class}" onclick="Doat.Navigation.goTo(\'{to}\')"><span>{label}</span></a>'},
        'image': {type: 'image', html: '<img src="'+imageTemplate+'" alt="{alt}" />'}
    },
    prefix = 'doml',
    keyDefaultValues = {
        'autoinit': 'false'
    };

    var regex = /\{([^}]*)\}/g;
    
    var _renderAttributes = function(DOMLTag, templateString){
      var values = {};
      return templateString ? (''+templateString).replace(regex, function(ignored, key) {
          if (!values.hasOwnProperty(key)) {
              // Don't use hasAttribute - fails in IE8
              values[key] = DOMLTag.getAttribute(key) ? DOMLTag.getAttribute(key) :
                  keyDefaultValues.hasOwnProperty(key) ? keyDefaultValues[key] : '';
          }
          return values[key];
      }) : templateString;
    };

    var replace = function(replacedEl, newHTML){
        if ($(replacedEl).replaceWith){
            $(replacedEl).replaceWith($(newHTML));
        }
        else{
            var newEl = $(newHTML)[0];
            replacedEl.parentNode.replaceChild(newEl, replacedEl);
        }
    };

    /**
    * Searches for DOML tags inside the document, replacing them with DOML UI element code and functionality.
    */
    this.parse = function(container){
        !container && (container = document.body);
        // Loop through every template in 'templates' array
        for (var suffix in templates){
            if (templates.hasOwnProperty(suffix)){// Simply a 'for each' best practice
                // Essemble tag name (e.g. 'do:header')
                var DOMLTagName = prefix+':'+suffix;

                // Get all DOML tags, within the wrapper element, that match the doTagName
                var DOMLTagsArr = container.getElementsByTagName(DOMLTagName);

                // Loop through all tags found and wrap them with the specified element
                for (var i=0; i<DOMLTagsArr.length; i++){
                    var templateHTML = _renderAttributes(DOMLTagsArr[i], templates[suffix].html);
                    replace(DOMLTagsArr[i], templateHTML);
                    i--;
                }
            }
        }
    };
    
    this.getImage = function(cfg){
        var pseudoTag = new function(cfg){
            this.getAttribute = function(key){
                return cfg[key];
            }
        }(cfg);
        return _renderAttributes(pseudoTag, imageTemplate);
    }
}


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
(function(){
    var callback, lastPosition,
        generatedCallback = 'doat_onLocationRetrieved_'+new Date().getTime(),
        Log = (typeof Doat != 'undefined' && Doat && Doat.Log) || new Logger();

    Doat_Env.prototype.getLocation = function(_callback, cfg){
        callback = _callback;
        
        if (!cfg || !cfg.testProps){
            if (cfg && cfg.request){
                Log.info('Specific params requested for location', cfg.request);
                var qs = parseQuery(), data = {}, notFoundFlag = false, foundFlag = false, 
                    arr = (cfg.request.constructor === String) ? [cfg.request] : cfg.request;
                
                for (var i=0; i<arr.length; i++){
                    var key = 'do_loc_'+arr[i];
                    if (qs[key]){
                        data[arr[i]] = decodeURIComponent(qs[key]);
                        
                        Log.info('found '+key);
                        foundFlag = true;
                    }
                    else{
                        Log.info('could not find '+arr[i]+' in querystring');
                        notFoundFlag = true;
                        if (!cfg.allowOneFound) { break; }
                    }
                }
                if (!notFoundFlag || (cfg.allowOneFound && foundFlag)){
                    Log.info('found required location data in querystring');
                    callback(normalize(data));
                    return true;
                }
                else{
                    Log.info('Couldnt find required location data in querystring');
                }
            }
            if (this.isMobile()){
                navigator.geolocation.getCurrentPosition(function(position){
                    getByCoords(position);
                },
                function(err){
                    callback(err);
                });
            }
            else{
                load(null, 'http://geoip.pidgets.com/');
            }
        }
        else if (cfg && cfg.testProps && cfg.testProps['position']){
            getByCoords(cfg.testProps['position']);
            // TODO: test location by ip
        }
    };

    window[generatedCallback] = function(data){
        data = normalize(data);
        callback(data);
    };

    function getByCoords(position){
        var yql = 'select * from geo.places where woeid in ('+
              'select place.woeid from flickr.places where lat='+
              position.coords.latitude + ' and  lon=' + position.coords.longitude + ')';
        load(yql);
        lastPosition = position;
    }

    function load(yql,url){
        if(document.getElementById('doatenvlocationdata')){
            var old = document.getElementById('doatenvlocationdata');
            old.parentNode.removeChild(old);
        }
        var src = (url) ? url+'?' : 'http://query.yahooapis.com/v1/public/yql?q='+encodeURIComponent(yql) +'&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
        src+= '&format=json&callback=' + generatedCallback;

        var head = document.getElementsByTagName('head')[0];
        var s = document.createElement('script');
        s.setAttribute('id','doatenvlocationdata');
        s.setAttribute('src',src);
        head.appendChild(s);
    }

    function normalize(data){
        var json = {};
        
        if (data){
            if (data.latitude && data.longitude){
                data.lat = data.latitude;
                data.lon = data.longitude;
            }
            if (data.lat && data.lon){
                json.position = {
                    'coords': {
                        'latitude': data.lat,
                        'longitude': data.lon
                    }
                }
            }
            
            if (data.query){ // hence YQL object
                if (data.query.results && data.query.results.place){
                    var p = data.query.results.place;
                    json['city'] = p.locality1 &&  p.locality1.content;
                    json['country'] = p.country && p.country.content;
                    json['zip'] = p.postal && p.postal.content;
                }
            }
            else if(data.country_name){ // pidgets
                json['city'] = data.city;
                json['country'] = data.country_name;
            }
            else{
                aug(json, data);
            }
        }
        
        if (!json.position && lastPosition){
            json['position'] = lastPosition;
            lastPosition = undefined;
        }

        return json;
    }
})()


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

var Doat_Events = function(){
    var self = this,
        eventArr = {};
    
    // Public Methods
    this.addEventListener = function(type, cb){
        var evt = eventArr[type];
        if (!evt){
            eventArr[type] = {
                'callbacks': [],
                'enabled': false
            };
            evt = eventArr[type];
        }
        evt['callbacks'].push(cb);

        if (evt['enabled'] && evt['callOnce']){
            call(cb);
        }
    };
    
    this.dispatchEvent = function(type, cfg){
        var evt = eventArr[type];
        if (!evt){
            eventArr[type] = {
                'callbacks': [],
                'enabled': true
            };
            evt = eventArr[type];
        }
        else{
            var len = evt['callbacks'].length;
            for (var i=0; i< len; ++i ){
                call(evt['callbacks'][i]);
            }
        }
        if (cfg){
            aug(evt, cfg);
        }
    };

    var call = function(cb){
        //try{
            cb();
        //}
        /*catch(e){
            var log = Log || Doat.Log || (Logger) ? new Logger : null;
            if (log){
                log.error(e);
            }
        }*/
    };

    // shortcuts
    this.ready = function(cb){
        self.addEventListener('ready', cb);
    };

    this.focused = function(cb){
        self.addEventListener('focused', cb);
    };

    this.blurred = function(cb){
        self.addEventListener('blurred', cb);
    };

    this.hidden = function(cb){
        self.addEventListener('hidden', cb);
    };

    this.visible = function(cb){
        self.addEventListener('visible', cb);
    };

    // CONSTS
    this.NO_RESULTS         = 'no results';
    this.RENDER_START       = 'render start';
    this.RENDER_END         = 'render end';
    this.RENDER_VISIBLE_END = 'render visible end';
    this.SEARCH_START       = 'search request';
    this.SEARCH_END         = 'search response success';
    this.SEARCH_ERROR       = 'search response error';
    this.WINDOW_LOADED      = 'window loaded';
    this.DOAT_READY         = 'doat ready';
    this.DOCUMENT_READY     = 'document ready';
    this.USER_ACTION        = 'user action';
    this.PAGE_VIEW          = 'page view';

    
    // Specific event settings
    this.ready(function(){
        eventArr['ready'].enabled = true;
    });

    this.focused(function(){
        eventArr['focused'].enabled = true;
        eventArr['visible'].enabled = eventArr['hidden'].enabled = eventArr['blurred'].enabled = false;
    });

    this.visible(function(){
        eventArr['visible'].enabled = true;
        eventArr['focused'].enabled = eventArr['hidden'].enabled = eventArr['blurred'].enabled = false;
    });

    this.hidden(function(){
        eventArr['hidden'].enabled = true;
        eventArr['focused'].enabled = eventArr['visible'].enabled = eventArr['blurred'].enabled = false;
    });

    this.blurred(function(){
        eventArr['blurred'].enabled = true;
        eventArr['focused'].enabled = eventArr['visible'].enabled = eventArr['hidden'].enabled = false;
    });
};


//fgnass.github.com/spin.js
(function(window, document, undefined) {

/**
 * Copyright (c) 2011 Felix Gnass [fgnass at neteye dot de]
 * Licensed under the MIT license
 *
 * Unfortunately uglify.js doesn't provide an option to de-duplicate strings
 * or to use string-based property access. Hence we have to manually define
 * some string constants in order to keep file-size below our 3K limit, as
 * one of the design goals was to create a script that is smaller than an
 * animated GIF.
 */

  var width = 'width',
      length = 'length',
      radius = 'radius',
      lines = 'lines',
      trail = 'trail',
      color = 'color',
      opacity = 'opacity',
      speed = 'speed',
      shadow = 'shadow',
      style = 'style',
      height = 'height',
      left = 'left',
      top = 'top',
      px = 'px',
      childNodes = 'childNodes',
      firstChild = 'firstChild',
      parentNode = 'parentNode',
      position = 'position',
      relative = 'relative',
      absolute = 'absolute',
      animation = 'animation',
      transform = 'transform',
      Origin = 'Origin',
      Timeout = 'Timeout',
      coord = 'coord',
      black = '#000',
      styleSheets = style + 'Sheets',
      prefixes = "webkit0Moz0ms0O".split(0), /* Vendor prefixes, separated by zeros */
      animations = {}, /* Animation rules keyed by their name */
      useCssAnimations;

  /**
   * 
   */
  function eachPair(args, it) {
    var end = ~~((args[length]-1)/2);
    for (var i = 1; i <= end; i++) {
      it(args[i*2-1], args[i*2]);
    }
  }

  /**
   * Utility function to create elements. If no tag name is given, a DIV is created.
   */
  function createEl(tag) {
    var el = document.createElement(tag || 'div');
    eachPair(arguments, function(prop, val) {
      el[prop] = val;
    });
    return el;
  }

  function ins(parent, child1, child2) {
    if(child2 && !child2[parentNode]) ins(parent, child2);
    parent.insertBefore(child1, child2||null);
    return parent;
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  ins(document.getElementsByTagName('head')[0], createEl(style));
  var sheet = document[styleSheets][document[styleSheets][length] - 1];

  /**
   * Creates an opacity keyframe animation rule.
   */
  function addAnimation(to, end) {
    var name = [opacity, end, ~~(to*100)].join('-'),
        dest = '{' + opacity + ':' + to + '}',
        i;

    if (!animations[name]) {
      for (i=0; i<prefixes[length]; i++) {
        try {
          sheet.insertRule('@' +
            (prefixes[i] && '-'+prefixes[i].toLowerCase() +'-' || '') +
            'keyframes ' + name + '{0%{' + opacity + ':1}' +
            end + '%' + dest + 'to' + dest + '}', sheet.cssRules[length]);
        }
        catch (err) {
        }
      }
      animations[name] = 1;
    }
    return name;
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   **/
  function vendor(el, prop) {
    var s = el[style],
        pp,
        i;

    if(s[prop] !== undefined) return prop;
    prop = prop.charAt(0).toUpperCase() + prop.slice(1);
    for(i=0; i<prefixes[length]; i++) {
      pp = prefixes[i]+prop;
      if(s[pp] !== undefined) return pp;
    }
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el) {
    eachPair(arguments, function(n, val) {
      el[style][vendor(el, n)||n] = val;
    });
    return el;
  }

  /**
   * Fills in default values. The values are passed as argument pairs rather
   * than as object in order to save some extra bytes.
   */
  function defaults(obj) {
    eachPair(arguments, function(prop, val) {
      if (obj[prop] === undefined) obj[prop] = val;
    });
    return obj;
  }

  /** The constructor */
  var Spinner = function Spinner(o) {
    this.opts = defaults(o || {},
      lines, 12,
      trail, 100,
      length, 7,
      width, 5,
      radius, 10,
      color, black,
      opacity, 1/4,
      speed, 1);
  },
  proto = Spinner.prototype = {
    spin: function(target) {
      var self = this,
          el = self.el = self[lines](self.opts);

      if (target) {
        ins(target, css(el,
          left, ~~(target.offsetWidth/2) + px,
          top, ~~(target.offsetHeight/2) + px
        ), target[firstChild]);
      }
      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var o = self.opts,
            i = 0,
            f = 20/o[speed],
            ostep = (1-o[opacity])/(f*o[trail] / 100),
            astep = f/o[lines];

        (function anim() {
          i++;
          for (var s=o[lines]; s; s--) {
            var alpha = Math.max(1-(i+s*astep)%f * ostep, o[opacity]);
            self[opacity](el, o[lines]-s, alpha, o);
          }
          self[Timeout] = self.el && window['set'+Timeout](anim, 50);
        })();
      }
      return self;
    },
    stop: function() {
      var self = this,
          el = self.el;

      window['clear'+Timeout](self[Timeout]);
      if (el && el[parentNode]) el[parentNode].removeChild(el);
      self.el = undefined;
      return self;
    }
  };
  proto[lines] = function(o) {
    var el = css(createEl(), position, relative),
        animationName = addAnimation(o[opacity], o[trail]),
        i = 0,
        seg;

    function fill(color, shadow) {
      return css(createEl(),
        position, absolute,
        width, (o[length]+o[width]) + px, 
        height, o[width] + px,
        'background', color,
        'boxShadow', shadow,
        transform + Origin, left,
        transform, 'rotate(' + ~~(360/o[lines]*i) + 'deg) translate(' + o[radius]+px +',0)',
        'borderRadius', '100em'
      );
    }
    for (; i < o[lines]; i++) {
      seg = css(createEl(),
        position, absolute, 
        top, 1+~(o[width]/2) + px,
        transform, 'translate3d(0,0,0)',
        animation, animationName + ' ' + 1/o[speed] + 's linear infinite ' + (1/o[lines]/o[speed]*i - 1/o[speed]) + 's'
      );
      if (o[shadow]) ins(seg, css(fill(black, '0 0 4px ' + black), top, 2+px));
      ins(el, ins(seg, fill(o[color], '0 0 1px rgba(0,0,0,.1)')));
    }
    return el;
  };
  proto[opacity] = function(el, i, val) {
    el[childNodes][i][style][opacity] = val;
  };

  ///////////////////////////////////////////////////////////////////////////////
  // VML rendering for IE
  ///////////////////////////////////////////////////////////////////////////////

  var behavior = 'behavior',
      URL_VML = 'url(#default#VML)',
      tag = 'group0roundrect0fill0stroke'.split(0);

  /** 
   * Check and init VML support
   */
  (function() {
    var s = css(createEl(tag[0]), behavior, URL_VML),
        i;

    if (!vendor(s, transform) && s.adj) {
      // VML support detected. Insert CSS rules for group, shape and stroke.
      for (i=0; i < tag[length]; i++) {
        sheet.addRule(tag[i], behavior + ':' + URL_VML);
      }
      proto[lines] = function() {
        var o = this.opts,
            r = o[length]+o[width],
            s = 2*r;

        function grp() {
          return css(createEl(tag[0], coord+'size', s +' '+s, coord+Origin, -r + ' ' + -r), width, s, height, s);
        }

        var g = grp(),
            margin = ~(o[length]+o[radius]+o[width])+px,
            i;

        function seg(i, dx, filter) {
          ins(g,
            ins(css(grp(), 'rotation', 360 / o[lines] * i + 'deg', left, ~~dx), 
              ins(css(createEl(tag[1], 'arcsize', 1), width, r, height, o[width], left, o[radius], top, -o[width]/2, 'filter', filter),
                createEl(tag[2], color, o[color], opacity, o[opacity]),
                createEl(tag[3], opacity, 0) // transparent stroke to fix color bleeding upon opacity change
              )
            )
          );
        }

        if (o[shadow]) {
          for (i = 1; i <= o[lines]; i++) {
            seg(i, -2, 'progid:DXImage'+transform+'.Microsoft.Blur(pixel'+radius+'=2,make'+shadow+'=1,'+shadow+opacity+'=.3)');
          }
        }
        for (i = 1; i <= o[lines]; i++) {
          seg(i);
        }
        return ins(css(createEl(),
          'margin', margin + ' 0 0 ' + margin,
          position, relative
        ), g);
      };
      proto[opacity] = function(el, i, val, o) {
        o = o[shadow] && o[lines] || 0;
        el[firstChild][childNodes][i+o][firstChild][firstChild][opacity] = val;
      };
    }
    else {
      useCssAnimations = vendor(s, animation);
    }
  })();

  window.Spinner = Spinner;

})(window, document);


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
* Providing the ability to navigate between content "pages" using a smoothe motion animation
* @class
*/
var Doat_Navigation = function(){
    var mainObj = Doat,
        classnamePrefix = 'doml_',
        isMobile = mainObj.Env.isMobile(),
        $currentElement,
        $previousElement,
        currentElementHeight,
        cfg = {},
        cbArr = {},
        CSS_PREFIX,
        ADDRESS_FIRST = true,
        isNavigating = false,
        firstPageId,
        globalOptions,
        hashArr = [],
        isCurrentFirstInHistory = false,
        currentHistoryState,
        historyEnabled;

    var b = mainObj.Env.getInfo().browser.name || mainObj.Env.getInfo().browser;
    CSS_PREFIX = b === 'webkit' ? '-webkit-' : b === 'mozilla' ? '-moz-' : '';

    var init = function(_cfg){
        _cfg && (cfg = aug(cfg, _cfg));
        
        var firstPage = document.querySelector(".doml_content");
        firstPageId = cfg.firstPageId || firstPage && firstPage.id; 
    };
    
    /**
     * Responsible for creating the motion animation between the current page and the one provided
     * @param {string | object HTMLElement} toPage The id or DOM element referencing the content wrapper ("page") to move to.
     * @param {object} [options] An object with a set of configuration property/value pairs, specifying the configuration for the navigation.<br/><br/>
     * <ul>
     * <li>onComplete -  a function to be executed when the animation is complete
     * <br />
     *       Recieves two arguments:<br />
     *      &nbsp; outElement - the DOM element that animated out
     *      &nbsp; inElement - the DOM element that animated in</li>
     * <li>
     *      direction -  The direction of the page transition animation.
     *      <br />
     *      Accepts "rtl" or "ltr"
     *      <br /><br />
     *      <em>If not specified, the direction will be determined automatically</em>
     *      </li>
     * </ul>
     * Supports "onComplete" property with a value of . <br />
     */
    var attachCallback = function(){
        var a = arguments;

        var pageId = (typeof a[0] === 'string') ? a[0] : a[0].get ? a[0].get(0).getAttribute('id') : a[0].getAttribute('id'),
            direction = a[1], // 'in'/'out'
            timing = (typeof a[2] === 'string') ? a[2].toLowerCase() : 'oncomplete', // 'onstart'/'oncomplete'
            cb = (typeof a[2] === 'string') ? a[3] : a[2];

        cbArr[pageId] = cbArr[pageId] || {};
        cbArr[pageId][timing] = cbArr[pageId][timing] || {};
        cbArr[pageId][timing][direction] = cb;
    };

    var navigate = function(toPage, options, bNoCallback){
        !options && (options = getCurrentHistoryState().urlParams);
        if (!toPage || isNavigating){return false;}
        isNavigating = true;
        
        var $nextElement = (toPage.constructor === String) ? $('.'+classnamePrefix+'content#'+toPage) : $(toPage);

        if (!bNoCallback) {
            onStart($nextElement, options);
        }
        
        if ($currentElement[0].id == $nextElement[0].id && $currentElement.css("display") == "block"){
            onComplete($nextElement, options);
            return false;
        }
        else if (options && options['transition'] == 'none'){
            var nextElCss = {
                'left': '0%',
                'display': 'block'
            };
            nextElCss[CSS_PREFIX+'transition-duration'] = '0';
            nextElCss[CSS_PREFIX+'transform'] =  'translateX(0)';
            $nextElement.css(nextElCss);

            var currElCss = {
                'display': 'none'
            };
            
            if ('outElementStyle' in  options) {
                for (var k in options['outElementStyle']) {
                    currElCss[k] = options['outElementStyle'][k];
                }
            }
                        
            $currentElement.css(currElCss);

            onComplete($nextElement, options);
        }
        else if (options && options['transition'] == 'fade'){            
            
            $currentElement.
               css('z-index', 2);
            
            if (isMobile){
                $nextElement.css(CSS_PREFIX+'transition-duration', '0');
                $nextElement.css(CSS_PREFIX+'transform', 'translateX(0)');
            }
            else{
                $nextElement.css('left', 0);
            }
            $nextElement.css('display', 'block');

            $currentElement.
               css(CSS_PREFIX+'transition', 'opacity 0.5s linear').
               css('opacity', 0);

            setTimeout(function(){
                $currentElement.
                    css('display', 'none').
                    css(CSS_PREFIX+'transition-duration', '0').
                    css({
                        'z-index': 1,
                        'opacity': 1
                    });
                 onComplete($nextElement, options);
            }, 200);
        }
        else{
            var direction = options && options.direction || determineDirection($nextElement),
                nextStart = (direction === 'rtl') ? '100%' : '-100%',
                currentEnd = (direction === 'rtl') ? '-100%' : '100%';

            if (isMobile){
                $nextElement.css(CSS_PREFIX+'transition-duration', '0');
                $nextElement.css(CSS_PREFIX+'transform', 'translateX('+nextStart+')');
            }
            else{
                $nextElement.css('left', nextStart);
            }
            $nextElement.css('display', 'block');

            setTimeout(function(){
                $nextElement.animate({'left': '0%'});
                $currentElement.animate({'left': currentEnd}, function(){
                    onComplete($nextElement, options);
                });
            }, 200);
        }

        // If muteEventReport == true, don't continue to reporting the message
        if (!options || options.muteEventReport !== true){
            var props = {
                'action': 'Navigate',
                'to': $nextElement[0].id
            };
            if (options && options.title){
                props.title = options.title.replace('/', '-');
            }
            if (options && options.id && options.id.replace){
                props.id = options.id.replace('/', '-');
            }
            if (mainObj.Messenger) {mainObj.Messenger.trigger(mainObj.Events.USER_ACTION, props)};
        }
        
        Doat.Viewport.hideAddressBar();

        return true;
    };

    var back = function(){
        if (historyEnabled){
            var isFirstPage = getCurrentHistoryState().firstPage;
            if (isFirstPage) {
                goTo(firstPageId, {"direction": "ltr"});
            } else {
                history.back();
            }
        }
        else{
            goTo($previousElement, {'muteEventReport': true});
        }
        Doat.Viewport.hideAddressBar();
    };

    var goTo = function(toPage, options, bNoCallback){
        !options && (options = {});
        if (historyEnabled) {
            toPage.constructor !== String && ( toPage = $(toPage)[0].id);

            var qs = getCurrentHistoryState().urlParams;
            
            if (options.url){
                for (var k in options.url) {
                    qs[k] = options.url[k];
                }
                delete options.url;
            }
            
            qs["topage"] = toPage;
            
            if (objectEqual(qs, encodedParseQuery())){
                return false;
            }
            
            var params = [];
            for (var k in qs){
                // Don't include topage in the url if it's the default page
                if (!(k === "topage" && qs[k] === firstPageId)) {
                    params.push(k+"="+(qs[k] || ""));    
                }
            }
            
            var url = "?"+params.join("&");
            
            aug(options, {"firstPage": false, "urlParams": qs});
            window.history.pushState(options, null, url);
        }
        navigate.apply(this, arguments);
    };
    
    var next = function(options, bNoCallback) {
        var $nextEl = $currentElement.next();
        if ($nextEl && $nextEl.hasClass("doml_content")) {
            goTo($nextEl, options, bNoCallback);
        }
    };
    
    var previous = function(options, bNoCallback) {
        var $prevEl = $currentElement.prev();
        if ($prevEl && $prevEl.hasClass("doml_content")) {
            goTo($prevEl, options, bNoCallback);
        }
    };

    var onStart = function($nextElement, options){
        var currId = $currentElement[0].id,
            nextId = $nextElement[0].id;
            
        aug(options, {
            "currentElement": $currentElement[0],
            "nextElement": $nextElement[0]
        });

        execCallback(options, ['*', 'onstart', 'in']);
        execCallback(options, [nextId, 'onstart', 'in']);
        
        if (currId != nextId) {
            execCallback(options, [currId, 'onstart', 'out']);
        }
        
        execCallback(options, options, ['onStart']);
    };
    
    var onComplete = function($nextElement, options){
        var currId = $currentElement[0].id,
            nextId = $nextElement[0].id;
            
        $previousElement = $currentElement;
        $currentElement = $nextElement;
        
        aug(options, {
            "currentElement": $currentElement[0],
            "nextElement": $previousElement[0]
        });
        
        execCallback(options, ['*', 'oncomplete', 'in']);
        execCallback(options, [nextId, 'oncomplete', 'in']);
            
        if (currId != nextId) {
            $previousElement.css('display', 'none');            
            execCallback(options, [currId, 'oncomplete', 'out']);
        }
        
        execCallback(options, options, ['onComplete']);
        
        isNavigating = false;
    };
    
    var execCallback = function(data, obj, keys){
        var flag = true;
        
        // if no obj was sent then make cbArr is the default
        if (!keys) {
            keys = obj;
            obj = cbArr;
        }
        
        if (!obj) { return false; }
        
        // check if the keys exist in the obj (obj[key1][key2][key3]...)
        for (var i=0,len=keys.length; i<len; i++){
            obj = obj[keys[i]];
            if (!obj) {
                flag = false;
                break;
            }
        }
        
        // execute callback
        flag && obj(data);
    }

    /**
     * @method determineDirection
     * @description Determines direction by the next element's current position.
     * If the element is on the left (style.left === '-100%') then the direction will be 'ltr'
     * If it's on the right ('100%') or if 'left' was never set, the direction will be 'rtl'
     * @param {object jQuery element} $el the element in question
     * @ignore
     */
    var determineDirection = function($el){
        var transformVal = getTransformValue($el);
        var condition = (transformVal && transformVal !== '' && transformVal !== 'none')
                            ? (transformVal === 'translateX(-100%)')
                                : ($el.get(0).style.left === '-100%');
        return condition ? 'ltr' : 'rtl';
    };

    var getTransformValue = function($el){
        var $value = $el.css(CSS_PREFIX+'transform'),
            value = $el[0].style[CSS_PREFIX+'transform'];

        return $value && $value !== '' && $value !== 'none' ? $value : value;
    };

    /**
     * @method setCurrent
     * @description Sets the DOM element argument as the current content wrapper "page" that is viewed.
     * When navigating to another "page", this element will be moved out.
     * @param {object HTMLElement} currentEl A DOM element to be set as the current content wrapper "page"
     * @ignore
     */
    var setCurrent = function(currentEl){
        if (currentEl.constructor === String){
            $currentElement = $('#'+currentEl);
        }
        else{
            $currentElement = $(currentEl);
        }
        !firstPageId && (firstPageId = currentEl.id);
    };

    /**
     * @method getCurrent
     * @description Gets the DOM element that is the current content wrapper "page".
     * @return {object HTMLElement} A DOM element that has been set as the current content wrapper "page"
     */
    var getCurrent = function(){
        return $currentElement[0];
    };
    
    var hasNewContentHeight = function(){
        if ($currentElement &&
            currentElementHeight !== $currentElement[0].offsetHeight){
            currentElementHeight = $currentElement[0].offsetHeight;
            return currentElementHeight;
        }

        return false;
    };

    /*
     * Callback triggered on window.popstate
     */
    var onAddressChanged = function(data) {
        if (data && data.state) {
            var state = setCurrentHistoryState(data);
            var page = state.urlParams.topage || firstPageId;
    
            navigate(page, state);    
        }
    };
    
    /*
     * Callback triggered for first browser history page
     */
    var onFirstPage = function() {
        var parsedQuery = encodedParseQuery(),
            page = parsedQuery["topage"] || firstPageId,
            options = { "transition": "none", "outElementStyle": {} };
            
         if (Doat.Env.isMobile()) {
            options["outElementStyle"][CSS_PREFIX+"transform"] = "translateX(-100%)" ;
        } else {
            options["outElementStyle"]["left"] = "-100%";
        }
            
        var state = getCurrentHistoryState();
        if (!state || state.firstPage === undefined) {
            state = {
                "firstPage": true,
                "urlParams": parsedQuery    
            };
            setCurrentHistoryState({
                "state": state
            });
            
            window.history.replaceState(state, null);
        }
        aug(options, {"firstPage": true, "urlParams": parsedQuery});
        navigate(page, options);
    };

    /*
     * Initiates the browser history logic
     */
    var initHistory = function() {
        historyEnabled = true;
        window.addEventListener("popstate", onAddressChanged, false);
        onFirstPage();
    };
    
    /*
     * returns url decoded parsed querystring
     */
    var encodedParseQuery = function(){
        var p = parseQuery();
        for (var k in p) {
            p[k] = decodeURIComponent(p[k]);
        }
        return p;
    };
    
    var getCurrentHistoryState = function(){
        var state = {};
        if (currentHistoryState){
            for (var k in currentHistoryState) {
                state[k] = currentHistoryState[k];
            }
        }
        return state;
    };
    
    var setCurrentHistoryState = function(data){
        return currentHistoryState = data && data.state;
    };

    return {
        'init': init,
        'initHistory': initHistory,
        'goTo': goTo,
        'next': next,
        'previous': previous,
        'back': back,
        'attachCallback': attachCallback,
        'bind': attachCallback,
        'setCurrent': setCurrent,
        'getCurrent': getCurrent,
        'hasNewContentHeight': hasNewContentHeight,
        'Indicator': new Doat_Progress_Indicator()
    };
};

function Doat_Progress_Indicator(){
    var mainSpinner, customSpinner, mainEl,
        default_cfg = {
            lines: 10, // The number of lines to draw
            length: 7, // The length of each line
            width: 3, // The line thickness
            radius: 7, // The radius of the inner circle
            color: '#ffffff', // #rbg or #rrggbb
            speed: 1.4, // Rounds per second
            trail: 72, // Afterglow percentage
            shadow: true, // Whether to render a shadow,
            parent: document.body
        },
        default_css = {
            'position': 'absolute',
            'left': '50%',
            'top': '50%',
            'z-index': 200
        };
        
    var initCustomSpinner = function(customSpinnerCfg){
        var cfg = {};
        for (i in default_cfg) cfg[i] = default_cfg[i];
        for (i in customSpinnerCfg) cfg[i] = customSpinnerCfg[i];
        
        customSpinner = new Spinner(cfg);
        customSpinner.spin(cfg.parent);
    };
    
    var initMainSpinner = function(){
        $mainEl = $('<span class="doml-progress-indicator" />');
        $mainEl.css(default_css);
        $(document.body).append($mainEl);
        
        mainEl = $mainEl[0];
        
        mainSpinner = new Spinner(default_cfg);
    };
    
    this.show = function(customSpinnerCfg){
        if (customSpinnerCfg){
            initCustomSpinner(customSpinnerCfg);
        }
        else{
            if (!mainSpinner){
                initMainSpinner();
            }
            mainSpinner.spin(mainEl);
        }
    };
    
    this.hide = function(){
        if (customSpinner){
            customSpinner.stop();
        }
        if (mainSpinner){
            mainSpinner.stop();    
        }        
    };
}


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
* Instantiated if a DOML:searchbar tag was found in the document during parse()
* Gives a set of properties and methods for easy access to the DOM element and value.
* In touch interfaces (tablet, mobile...) it enables the key board to display a "search" button with submition functionality.
* @class
*/
var Doat_Searchbar = function(cfg){
    var _this = this,
        inputEl, clearButton, $body, formEl,
        keyboardVisibleCallbacks = [],
        keyboardHiddenCallbacks = [],
        KEYBOARD_CLASSNAME = "doml-searchbar-keyboard-visible",
        defaultText,
        DEFAULT_TEXT_CLASSNAME = "default";

    this.clearValue = clearValue;
    this.fillValue = fillValue;
    this.setValue = setValue;
    this.getInputElement = getInputElement;
    this.submitFunc = validateSubmit;
    this.blur = blur;
    this.focus = focus;
    this.onKeyboardVisible = onKeyboardVisible;
    this.onKeyboardHidden = onKeyboardHidden;
    
    Doat.Events.ready(init);
    
    function init(){
        inputEl = document.getElementById('doml-searchbar-searchfield');
        if (inputEl){
            $body = $(document.body);
            
            formEl = document.getElementById('doml-searchbar-form');
            _this.submit = formEl.onsubmit;
             
            defaultText = inputEl.getAttribute("data-defaulttext");
            
            inputEl.addEventListener("focus", onFocus, false);
            inputEl.addEventListener("blur", onBlur, false);
            inputEl.addEventListener("touchstart", function(){
                Doat.Viewport.hideAddressBar();
            }, false);
            
            if (cfg && cfg.searchClearButton){
                addClearButton(cfg);   
            }
            
            setValue("");
            
            Doat.Nav.bind("*", "in", "onstart", function(data){
                if (!data || !data.urlParams) {
                    return;
                }
                
                var q = data.urlParams.do_query || "";
                setValue(q);
            });
        }
    }
    
    function addClearButton(cfg){
        if (getInputElement().getAttribute('data-clearbutton') !== ''){
            clearButton = new ClearButton();
            var css = cfg && cfg.css || {};
            !css['left'] && (css['left']= inputEl.offsetWidth);
            
            buttonEl = clearButton.init({
                'css': css,
                'onClick': function(){
                    setValue('', true);
                    focus();
                }
            });
            
            var form = getInputElement().parentNode;
            form.style.position = 'relative';
            form.appendChild(buttonEl);
        }
    }

    function clearValue(){
        inputEl.className = "";
        if (!defaultText){return;}
        if (getValue() === defaultText){
            setValue('', true);
        }
    }

    function fillValue(){
        if (!defaultText){return;}
        if (getValue() === ''){
            setValue(defaultText);
        }
    }
    
    function validateSubmit(submitFunc){
        Doat.Viewport.hideAddressBar();
        if (getValue() !== '' && getValue() !== defaultText){
            submitFunc && submitFunc();
        }
        blur();
    }
    
    function focus(){
        inputEl.focus();
    }
    
    function blur(){
        inputEl.blur();
    }
    
    function onKeyboardVisible(cb){
        keyboardVisibleCallbacks.push(cb);
    }
    
    function onKeyboardHidden(cb){
        keyboardHiddenCallbacks.push(cb);
    }

    /**
    * @method setValue
    * @description Sets a new value to the searchbar textfield
    * @param {string|integer} value New value to set
    */
    function setValue (value, force){
        if (!force && !value){
             value = defaultText || "";
        }
        
        if (defaultText) {
            inputEl.className = DEFAULT_TEXT_CLASSNAME;
        }
        
        inputEl.value = normalize(value);
    }

    /**
    * @method getValue
    * @description Returns the current value of the searchbar textfield
    * @return {string} Current value of the searchbar textfield
    */
    function getValue(){
        return normalize(inputEl.value);
    }

    /**
    * @method getInputElement
    * @description Returns the generated searchbar textfield
    * @return {object HTMLInputElement} input
    */
    function getInputElement(){
        return inputEl;
    }

    function onSubmit(){
        Doat.Messenger.trigger(Doat.Events.USER_ACTION,{
                'action': 'Search',
                'newQuery': getValue()
            }
        );
        blur();
    }
    
    function onFocus(){
        Doat.Viewport.hideAddressBar();
        $body.addClass(KEYBOARD_CLASSNAME);
        clearValue();
        for (var i=0,len=keyboardVisibleCallbacks.length; i<len; i++ ) {
            keyboardVisibleCallbacks[i].call(inputEl)
        }
    }
    
    function onBlur(){
        $body.removeClass(KEYBOARD_CLASSNAME);
        fillValue();
        for (var i=0,len=keyboardHiddenCallbacks.length; i<len; i++ ) {
            keyboardHiddenCallbacks[i].call(inputEl)
        }
    }
    
    function normalize(v) {
        return v.replace(/\+/g, " ");
    }
    
    
    this.getValue = function() {
        var val = getValue()
        return val !== defaultText ? val : "";
    };
};

function ClearButton(){
    var $el,
        css = {
           'position': 'absolute',
           'top': '5px',
           'cursor': 'pointer',
           'background-color': '#BBBBBB',
           'width': '16px',
           'height': '16px',
           'text-align': 'center',
           'line-height': '17px',
           'border-radius': '8px',
           '-webkitborder-radius': '8px',
           '-moz-border-radius': '8px',
           'color': 'white',
           'font-weight': 'bold',
           'font-size': '12px',
           'font-family': 'arial',
           'text-shadow': 'none',
           'leftOffset': -19
       };
    
    this.init = function(cfg){
        for (i in cfg.css) css[i] = cfg.css[i];
        css['left'] = css.left+css.leftOffset+'px';
        
        $el = $('<span/>');
        $el.addClass('doml-searchbar-clear')
           .html('X')
           .css(css)
           .click(function(e){
               e.preventDefault();
               cfg.onClick();
           });
        
        return $el[0];
    }
    
    this.show = function(){
        $el.show();
    };
        
    this.hide = function(){
        $el.hide();
    };
        
}


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
* Instantiated if a DOML:slider tag was found in the document during parse()
* @class
*/
var Doat_Slider = function(){
	var $el, isTouch, CSS_PREFIX, handle, track, preview, TOUCHSTART, TOUCHMOVE, TOUCHEND, trackWidth, currentIndex, itemPixelRange, onSelectCB;
	
	this.init = function(cfg){
		var $originalEl;
		if (cfg && cfg.id && document.getElementById(cfg.id)){
			 $originalEl= $('#'+cfg.id);
		}
		else{
			return false;
		}		
		
		if (typeof Doat !== 'undefined'){
			isTouch = Doat.Env.isMobile();
			
			var b = Doat.Env.getInfo().browser;
    		CSS_PREFIX = b === 'webkit' ? '-webkit-' : b === 'mozilla' ? '-moz-' : '';
		}
		else{
			isTouch = true;
		}
		trackWidth = cfg.trackWidth;
    	
    	onSelectCB = cfg.onSelect;
			
		TOUCHSTART = isTouch ? 'touchstart' : 'mousedown';
		TOUCHMOVE = isTouch ? 'touchmove' : 'mousemove';
		TOUCHEND = isTouch ? 'touchend' : 'mouseup';
		
		$el = $('<div class="doml-slider" />');
		$originalEl.parent().append($el);
		$el.append($originalEl);
		
		var itemArr = [];
		$originalEl.children().each(function(){
			var $tempWrap = $('<div/>');
			$(this).appendTo($tempWrap);
			itemArr.push($tempWrap.html());
		});
		itemArrLength = itemArr.length;		
		itemPixelRange = trackWidth / itemArrLength;
		
		var $wrapperEl = $('<div class="wrapper">');
		$wrapperEl.css('width', trackWidth+'px');		
		$el.append($wrapperEl);
		
    	// Event Capture
		$eventCaptureEl = $('<div class="eventCapture" />');
		$eventCaptureEl.css('width', trackWidth+'px');		
		$eventCaptureEl.bind(TOUCHSTART, onTouchStart, false);
		document.addEventListener(TOUCHEND, onTouchEnd, false);		
		$wrapperEl.append($eventCaptureEl);
		
		// Handle
		handleWrapper = new HandleWrapper();
		var $handleWrapperEl = handleWrapper.init();		
		$wrapperEl.append($handleWrapperEl);
		
		// Preview
        preview = new Preview();
        var $previewEl = preview.init(itemArr);
        $handleWrapperEl.append($previewEl);
        
        return true;
	};
	
	var onTouchStart = function(e){
    	document.addEventListener(TOUCHMOVE, onTouchMove, false);
		var pos = getPos(e);
		var newIndex = getNewIndex(pos);
		if (newIndex !== currentIndex){
			currentIndex = newIndex;
			preview.update(currentIndex);
		}
		handleWrapper.update(pos, currentIndex);	
		preview.show();
	};
	
	var onTouchMove = function(e){
		e.preventDefault(e);
		var pos = getPos(e);
	   	if (pos<=trackWidth && pos>=0){
	   		var newIndex = getNewIndex(pos);
			if (newIndex !== currentIndex){
				currentIndex = newIndex;
				preview.update(currentIndex);
			}
			handleWrapper.onTouchMove();
			handleWrapper.update(pos, currentIndex);
	   	}
	};
	
	var onTouchEnd = function(e){
		handleWrapper.onTouchEnd();
    	document.removeEventListener(TOUCHMOVE, onTouchMove);
		var pos = getSnapPos(currentIndex);
		handleWrapper.update(pos);	
		preview.hide();
		if (onSelectCB) onSelectCB(currentIndex);
	};
    	
	var getNewIndex = function(pos){
		var index = (pos / trackWidth) * itemArrLength;
		index = parseInt(index, 10);
		return index;
	};
	
	var getPos = function(e){		
		e = e.touches && e.touches[0] || e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] || e;
		return e.clientX;
	};
	
	var getSnapPos = function(index){
		return index*itemPixelRange;
	};
    
    function HandleWrapper(){
    	var $el;
    	
    	this.init = function(cfg){    	    		    		
    		$el = $('<div class="handle_wrapper"><div class="handle"/></div>');
    		
    		return $el;
    	};
    	
    	this.update = function(pos){
    		updatePosition(pos);    		
    	};
    	
    	this.onTouchMove = function(){
    		$el.addClass('dragged');
		};
    	
    	this.onTouchEnd = function(){
    		$el.removeClass('dragged');
    	};
    	
    	var updatePosition = function(left){
			$el.css(CSS_PREFIX+'transform', 'translateX('+left+'px)');
    	};
    }
    
    function Preview(){
    	var self = this;
    	var $el, $contentEl, $indicatorEl, itemArr;
    	
    	this.init = function(_itemArr){
    		itemArr = _itemArr;
    		$el = $('<div class="preview"/>');
    		$contentEl = $('<div class="content"/>');
    		$el.append($contentEl);
    		$indicatorEl = $('<span class="indicator"/>');
    		$el.append($indicatorEl);
    		self.hide();
    		
    		return $el;
    	};
    	
    	this.show = function(){
    		$el.addClass('displayed');
    	};
    	
    	this.update = function(index){
    		$contentEl.html(itemArr[index]);
    		$indicatorEl.html(index+1+' of '+itemArr.length);
    	};
    	
    	this.hide = function(){
    		$el.removeClass('displayed');
    	};
    }
};


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
* Instantiated if a DOML:swiper tag was found in the document during parse()
* @class
*/
function Doat_Swiper() {
    var $el = null, $navEl = null, $itemsEl = null, selectCallback = null;
    var current = 0, currentTabs = 0, active = false, stopAutoplayOnTouch = true, thumbsSwipe = false;
    var ITEM_WIDTH = 320, THUMB_WIDTH = 0, NUMBER_OF_VISIBLE_THUMBS = 5, NUMBER_OF_ITEMS = 0, autoplayInterval = null;
    var ANIMATION_SPEED = "0.5", AUTOPLAY_SPEED = 4000;
    var _this = this;

    this.init = function(options) {
        options = options || {};
        
        $el = options.element || null;
        $navEl = options.navElement || null;
        $itemsEl = options.itemsElement || null;
        
        selectCallback = options.onSelect || null;
        
        options.itemWidth && (ITEM_WIDTH = options.itemWidth);
        options.thumbWidth && (THUMB_WIDTH = options.thumbWidth);
        options.numVisibleThumbs && (NUMBER_OF_VISIBLE_THUMBS = options.numVisibleThumbs);

        options.animationSpeed && (ANIMATION_SPEED = options.animationSpeed);
        
        options.autoplay && (typeof options.autoplay == "number") && (AUTOPLAY_SPEED = options.autoplay);
        stopAutoplayOnTouch = (typeof options.stopAutoplayOnTouch == "boolean")? options.stopAutoplayOnTouch : true;
        thumbsSwipe = (typeof options.thumbsSwipe == "boolean")? options.thumbsSwipe : false;

        onHitStartArr = [],
        onHitEndArr = [],
        onHitStart = function(){
            onHitStartArr.forEach(function(cb){
                cb.apply(arguments);
            });
        };
        onHitEnd = function(){
            onHitEndArr.forEach(function(cb){
                cb.apply(arguments);
            });
        };
        
        options.onHitStartCallback && onHitStartArr.push(options.onHitStartCallback);
        options.onHitEndCallback && onHitEndArr.push(options.onHitEndCallback);

        NUMBER_OF_ITEMS = $itemsEl.find("li").length;
        
        initDesign();
        addNavigationEvents();

        if ($navEl) {
            var $tabs = $navEl.find("li");
            $tabs.click(function(){
                _this.setItemByThumb(this);
            });
            $($tabs[0]).addClass("active");
        }

        show();
        if (options.autoplay) {
            _this.autoplayStart();
            if (options.stopAutoplayOnFocus) {
                Doat.Events.focused(function(){
                    _this.autoplayStop();
                });
                Doat.Events.blurred(function(){
                    _this.autoplayStart();
                });
            }
        }
    };

    function addNavigationEvents() {
        var element = $itemsEl.parent().get(0);
        Doat.Env.addEventListener(element, 'touch', function(e, data){
            switch (data.type){
                case "start":
                    disableAnimation($itemsEl);
                    stopAutoplayOnTouch && _this.autoplayStop();
                    break;
                case 'move':
                    _this.move(data.delta.x);
                    break;
                case 'end':
                    if (!data['swipeEvent']) {
                        _this.showCurrentItem();
                    } else {
                        e = e.originalEvent || e;
                        e.preventDefault();
                        enableAnimation($itemsEl);
                        if (data.direction == "rtl") {
                            _this.next();
                        } else {
                            _this.prev();
                        }
                    }
                    break;
            }
        });

        if ($navEl && thumbsSwipe) {
            element = $navEl.parent().get(0);
            Doat.Env.addEventListener(element, 'touch', function(e, data){
                switch (data.type){
                    case "start":
                        disableAnimation($navEl);
                        stopAutoplayOnTouch && _this.autoplayStop();
                        break;
                    case 'move':
                        _this.moveTabs(data.delta.x);
                        break;
                    case 'end':
                        if (!data['swipeEvent']) {
                            _this.showCurrentItem(true);
                        } else {
                            e = e.originalEvent || e;
                            e.preventDefault();
                            enableAnimation($navEl);
                            if (data.direction == "rtl") {
                                _this.nextTabs();
                            } else {
                                _this.prevTabs();
                            }
                        }
                        break;
                }
            });
        }

        $(document).bind("keyup", function(e) {
            if (active) {
                switch(e.keyCode) {
                    case 36: // HOME
                         stopAutoplayOnTouch && _this.autoplayStop();
                         _this.setItem(0);
                        break;
                    case 35: // END
                         stopAutoplayOnTouch && _this.autoplayStop();
                         _this.setItem(NUMBER_OF_ITEMS-1);
                        break;
                    case 39: // RIGHT
                         stopAutoplayOnTouch && _this.autoplayStop();
                         _this.next();
                        break;
                    case 37: // LEFT
                         stopAutoplayOnTouch && _this.autoplayStop();
                         _this.prev();
                        break;
                }
            }
        });
    }

    function initDesign() {
        preventFlicker($el);
        preventFlicker($navEl);
        preventFlicker($itemsEl);

        $itemsEl.parent().css({
            "width": ITEM_WIDTH + "px",
            "overflow": "hidden"
        });
        $itemsEl.find("li").css({
            "float": "left",
            "width": ITEM_WIDTH + "px"
        });
        $itemsEl.css({
            "width": (ITEM_WIDTH*NUMBER_OF_ITEMS) + "px",
            "list-style-type": "none",
            "overflow": "hidden"
        });
        
        if ($navEl && THUMB_WIDTH !== 0) {
            $navEl.css({
                "width": (THUMB_WIDTH*NUMBER_OF_ITEMS) + "px",
                "list-style-type": "none",
                "overflow": "hidden"
            });
        }
    }
    
    this.autoplayStart = function(){
        if (autoplayInterval !== null) {
            _this.autoplayStop();
        }
        
    	autoplayInterval = setInterval(function(){
            _this.next(true);
        }, AUTOPLAY_SPEED);
    };
    
    this.autoplayStop = function(){
    	clearInterval(autoplayInterval);
        autoplayInterval = null;
    };

    this.show = function(cfg) {
    	if (cfg && cfg.delay) {
            setTimeout(show, cfg.delay);
    	} else {
            show();
    	}
    };
    this.hide = function() {
        $el.hide();
        active = false;
    };
    
    function show(){
        $el.show();
        active = true;
    }

    this.removeItem = function(item) {
        var el = (typeof item == "number")? $itemsEl.children()[item] : item;
        var i = _this.index(el);
        
        $(el).remove();
        $navEl && $($navEl.children()[i]).remove();

        NUMBER_OF_ITEMS--;
        if (current == i) {
            current--;
            if (current <= 0) {
                current = 0;
            }
        }
        _this.showCurrentItem();
    };

    this.move = function(x) {
    	$itemsEl.css({
            "-webkit-transform": "translate(" + -(current*ITEM_WIDTH-x) + "px)",
            "-moz-transform": "translate(" + -(current*ITEM_WIDTH-x) + "px)",
            "transform": "translate(" + -(current*ITEM_WIDTH-x) + "px)"
        });
    };
    this.moveTabs = function(x) {
    	$navEl && $navEl.css({
            "-webkit-transform": "translate(" + -(currentTabs*THUMB_WIDTH-x) + "px)",
            "-moz-transform": "translate(" + -(currentTabs*THUMB_WIDTH-x) + "px)",
            "transform": "translate(" + -(currentTabs*THUMB_WIDTH-x) + "px)"
        });
    };
    this.prev = function() {
        current--;
        if (current < 0) {
            current = 0;
            onHitStart();
        }
        _this.showCurrentItem();
    };
    this.next = function(bFromAutoplay) {
        current++;
        if (current == NUMBER_OF_ITEMS) {
            current = (bFromAutoplay)? 0 : NUMBER_OF_ITEMS-1;
            onHitEnd();
        }
        _this.showCurrentItem();
    };
    this.prevTabs = function() {
        currentTabs-=NUMBER_OF_VISIBLE_THUMBS;
        if (currentTabs <= 0) {
            currentTabs = 0;
        }
        _this.showCurrentItem(true);
    };
    this.nextTabs = function() {
        currentTabs+=NUMBER_OF_VISIBLE_THUMBS;
        
        if (currentTabs >= NUMBER_OF_ITEMS - NUMBER_OF_VISIBLE_THUMBS) {
            currentTabs = NUMBER_OF_ITEMS - NUMBER_OF_VISIBLE_THUMBS;
        }
        _this.showCurrentItem(true);
    };

    this.setItemByThumb = function(el) {
        _this.setItem(_this.index(el));
    };

    this.getCurrent = function() {
        return current;
    };

    this.index = function($el) {
        $el = $($el);
        var items = $el.parent().children();
        for (var i=0; i<items.length; i++) {
            if (items[i] == $el[0]) {
                return i;
            }
        }
        return -1;
    };
    
    this.setItem = function(index) {
        current = index;
        _this.showCurrentItem();
    };

    this.showCurrentItem = function(changeTabs) {
        var $elToMove = (changeTabs && $navEl)? $navEl : $itemsEl;
        var newPos = (changeTabs && $navEl)? -(currentTabs*THUMB_WIDTH) : -(current*ITEM_WIDTH);
        
        enableAnimation($elToMove);
    	$elToMove.css({
            "-webkit-transform": "translate(" + newPos + "px)",
            "-moz-transform": "translate(" + newPos + "px)",
            "transform": "translate(" + newPos + "px)"
        });
        
        selectCallback && selectCallback(current);

        $itemsEl.find(".active").removeClass("active");
        $($itemsEl.children("li")[current]).addClass("active");
        
        if ($navEl) {
            $navEl.find(".active").removeClass("active");
            $($navEl.children("li")[current]).addClass("active");
        }

        if (!changeTabs) {
            var newTabsPosition = Math.floor(current/NUMBER_OF_VISIBLE_THUMBS)*NUMBER_OF_VISIBLE_THUMBS;
            if (newTabsPosition != currentTabs) {
                currentTabs = newTabsPosition;
                _this.showCurrentItem(true);
            }
        }
    };

    function disableAnimation($el) {
        $el.css({
            "-moz-transition": "-moz-transform 0s",
            "-webkit-transition": "-webkit-transform 0s",
            "transition": "transform 0s"
        });
    }

    function enableAnimation($el) {
        $el && $el.css({
            "-moz-transition": " -moz-transform " + ANIMATION_SPEED + "s ease-out",
            "-webkit-transition": "-webkit-transform " + ANIMATION_SPEED + "s ease-out",
            "transition": "transform " + ANIMATION_SPEED + "s ease-out"
        });
    }

    function preventFlicker($el) {
        $el && $el.css({
            "-webkit-transform": "translate3d(0px, 0px, 0px) rotate(0deg) scale(1)",
            "-webkit-box-sizing": "border-box",
            "-webkit-backface-visibility": "hidden"
        });
    }
}


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
        
        MainObj = window.Doat || window.TouchyJS;
        classnamePrefix = window.Doat ? 'doml_' : 'touchyjs-';
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

function enableCssAnim(platform, browser, Log){
    Log && Log.info('platform='+platform);
    
    var supported = document.body.style.animationName,
        prefixes = ["Webkit","Moz","O","ms","Khtml"];
    
    if( !supported ) {
        for( var i = 0; i < prefixes.length; i++ ) {
            if( document.body.style[ prefixes[i] + 'AnimationName' ] !== undefined ) {
                CSS_PREFIX = '-' + prefixes[ i ].toLowerCase() + '-';
                supported = true;
                break;
            }
        }
    }
    
    if (!supported) { return false; }
    
    var transfromKeys = ['scale', 'rotate', 'skew', 'translate', 'matrix'];

    css();

    $.fn.fadeIn = function(){
        var a = normalizeArguments(arguments);
        return $(this).animate({'opacity': 1}, a.dur, a.ease, a.cb);
    };

    $.fn.fadeOut = function(){
        var a = normalizeArguments(arguments);
        return $(this).animate({'opacity': 0}, a.dur, a.ease, a.cb);
    };

    $.fn.animate = function(){
        var $el = this;
        var k, props, dur, ease, callbacks = [];
        for (var i=1; i<arguments.length; i++){
            var arg = arguments[i];
            if (typeof arg === 'function'){
                callbacks.push(arg);
            }
            else if (arg === 'fast' || arg === 'slow'){
                dur = arg;
            }
            else if (typeof arg === 'string'){
                ease = arg;
            }
            else {
                dur = arg;
            }
        }

        // CSS properties
        props = arguments[0];
        props[CSS_PREFIX+'transform'] = '';
        for (k in props){
            var val;
            if (props[k].toString().indexOf('=')!==-1){
                props[k] = getIncVal($el, k, props[k]);
            }
            if (isTransform(k)){
                props[CSS_PREFIX+'transform']+= k+'('+props[k]+')';
                delete props[k];
            }
            else if (k === 'left' || k === 'right'){
                val = (k === 'right') ? reverse(props[k]) : props[k];
                props[CSS_PREFIX+'transform']+= 'translateX('+val+')';
                delete props[k];
            }
            else if (k === 'bottom' || k === 'top'){
                val = (k === 'bottom') ? reverse(props[k]) : props[k];
                props[CSS_PREFIX+'transform']+= 'translateY('+val+')';
                delete props[k];
            }
        }

        // Duration
        dur = (dur === 'fast') ? 0.2 : (dur === 'slow') ? 0.6 : dur/1000 || 0.3;

        // Easing
        ease = (!ease || ease === 'swing') ? 'ease-in-out' : ease;

        // Callback
        if (callbacks.length > 0){
            setTimeout(function(){
                var i, len = callbacks.length;
                for (i=0; i<len; i++){
                  callbacks[i].call($el);
                }
            }, dur*1000);
        }

        // Execute CSS properties
        props[CSS_PREFIX+'transition'] = 'all '+dur+'s '+ease;
        return $el.css(props);
    }

    function isTransform(k){
        for (var i=0; i<transfromKeys.length; i++){
            if (k.indexOf(transfromKeys[i])!==-1){
                return true;
                break;
            }
        }
        return false;
    }

    function reverse(v){
        v = v.toString();
        return (v.indexOf('-') === 0) ? v.substring(1, v.length) : '-'+v;
    }

    function getIncVal(el, propName, value){
        var inc = (value.indexOf('-=')!==-1) ? -1 : 1;
        value = value.toString();
        var num = parseInt(value.substring(2, value.length), 10).toString();
        var unit = value.substring(2+num.length, value.length);
        var curValue = el.css(propName);
        curValue = (curValue && curValue !== '') ? parseInt(curValue, 10) : 0;
        var newValue = curValue+(inc*num)+unit;
        return newValue;
    }

    function css(){
        var cfg = {};

        if (platform !== 'android'){
            cfg[CSS_PREFIX+'transform'] = 'translate3d(0px, 0px, 0px) rotate(0deg) scale(1)';
            cfg[CSS_PREFIX+'box-sizing'] =  'border-box';
            cfg[CSS_PREFIX+'backface-visibility'] = 'hidden';
            Log && Log.info('Including cfg[\''+CSS_PREFIX+'transform\'] = \'translate3d(0px, 0px, 0px) rotate(0deg) scale(1)\'');
        }
        else{
            Log && Log.info('not including cfg[\''+CSS_PREFIX+'transform\'] = \'translate3d(0px, 0px, 0px) rotate(0deg) scale(1)\'');
        }
        $('.doml_content').css(cfg);
    }
}

function normalizeArguments(args){
    var val = {};
    for (var i=0; i<args.length; i++){
        var arg = args[i];
        if (typeof arg === 'function'){
            val.cb = arg;
        }
        else if (arg === 'fast' || arg === 'slow'){
            val.dur = arg;
        }
        else if (typeof arg === 'string'){
            val.ease = arg;
        }
        else {
            val.dur = arg;
        }
    }
    return val;
}


var Doat_Facebook = function() {
    var _this = this, options = {}, head = document.getElementsByTagName('head')[0], $body = $(document.body),
        $elLogin = null, $elOverlay = null, $elLoginButton = null, $elLoginButtonReal = null, $elLoginButtonLoading = null, loggedIn = false,
        textDialog = textConnect = textConnecting = null, userPermissions = null;

    var inited = false,
        cacheUserResponse = null,
        loginCallbacks = [];

    var APP_ID = null,
        CHANNEL_FILE = null,
        STORAGE_KEY_FB_USER = "isFBUser",
        OG_NAMESPACE = "",
        FB_USER_NEW = 1,
        FB_USER_RETURN = 2,
        CLASS_FACEBOOK = 'doml-facebook',
        CLASS_FACEBOOK_LOGGEDIN = 'doml-facebook-loggedin';

    var DEFAULT_TEXTS = {
    	textDialog : 'Welcome<br />Please login',
    	textConnect : 'Login with Facebook',
    	textConnecting : 'Connecting...'
    };

    this.init = function(_options, forceInit) {
        _options && (options = _options);

        if (inited || (!forceInit && !options.login && !fbUser())) {
            return;
        }

        APP_ID = options.appId;
        CHANNEL_FILE = options.channel || 'http://' + window.location.hostname + '/channel.php';

        textDialog = options.textDialog || DEFAULT_TEXTS.textDialog;
        textConnect = options.textConnect || DEFAULT_TEXTS.textConnect;
        textConnecting = options.textConnecting || DEFAULT_TEXTS.textConnecting;
        OG_NAMESPACE = options.namespace || "";

        renderCSS();
        renderHTML();

        $elLoginCancel = $("#doat-fb-login-cancel");
        $elLogin = $("#doat-fb-login");
        $elLoginButton = $elLogin.find(".button");
        $elLoginButtonLoading = $elLoginButton.find(".button-loading");
        $elLoginButtonReal = $elLoginButton.find(".button-real");

       	$elLogin.find(".content").html(textDialog);
        $elLoginButtonReal.find(".text").html(textConnect);
        $elLoginButtonLoading.find(".text").html(textConnecting);

        $elLoginButton.bind("touchstart", function(e){
            e.preventDefault();
            e.stopPropagation();
            _this.login();
        });

        $elOverlay = $('<div id="doat-fb-overlay"></div>');
        $body.append($elOverlay);
        $elOverlay.bind("touchstart", function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        $body.addClass(CLASS_FACEBOOK);

        if (options.permissions) {
            userPermissions = options.permissions;
        }

        uiInit();
        fbInit();

        inited = true;
    };

    this.forceInit = function() {
        _this.init(null, true);
    };

    function uiInit() {
        if (Storage.get(STORAGE_KEY_FB_USER) != FB_USER_RETURN) {
            $(document.body).addClass("loggedout");

            $elLoginButton.find(".button-loading").removeClass("active");
            $elLoginButton.find(".button-real").addClass("active");

            $elOverlay && $elOverlay.show();
            $elLogin.show();

            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            var top = window.innerHeight/2 + scrollTop;
            
            $elLogin.css({
                "top": top + "px",
                "margin-top": -($elLogin.height()/2+20) + "px"
            });

            $elLogin.bind("touchstart", function(e) {
                e.preventDefault();
            });

            if (Spinner) {
                var opts = {
                  "lines": 8,
                  "length": 2,
                  "width": 3,
                  "radius": 3,
                  "color": "#fff",
                  "speed": 1,
                  "trail": 60,
                  "shadow": false
                };
                loading = new Spinner(opts).spin($elLoginButtonLoading.find(".icon")[0]);
            }
        }
    }

    function fbInit() {
        var $fbroot = $('<div id="fb-root"></div>');
        $body.append($fbroot);

        var d = document, js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
        js = d.createElement('script'); js.id = id; js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        ref.parentNode.insertBefore(js, ref);
    }

    this.onFBInit = function() {
        FB.init({
            "appId"      : APP_ID,
            "channelUrl" : CHANNEL_FILE,
            "status"     : true,
            "cookie"     : true,
            "xfbml"      : false
        });

        FB.getLoginStatus(function(response) {
            loggedIn = response.status === 'connected';

            if (response.status === 'connected') {
                checkPermissions(userPermissions, cbLoginSuccess, function() { _this.login(); });
            } else {
                _this.showLogin();
            }
        });
    };
    window.fbAsyncInit = _this.onFBInit;

    this.showLogin = function() {
        Storage.set(STORAGE_KEY_FB_USER, FB_USER_NEW);

        uiInit();

        FB.Event.subscribe('auth.statusChange', function(response) {
            loggedIn = response.status === 'connected';

            if (loggedIn) {
            	cbLoginSuccess();
            } else {
                cbLoginFail();
            }
        });
    };

    this.hideLogin = function() {
        $elLogin.hide();
        $elOverlay && $elOverlay.hide();
        $(document.body).removeClass("loggedout");
        loggedIn = true;
    };

    this.login = function() {
        if (!inited) {
            _this.forceInit();
            return;
        }

        if (!Storage.get(STORAGE_KEY_FB_USER)) {
            Storage.set(STORAGE_KEY_FB_USER, FB_USER_NEW);
        }

        FB.login(function(response) {
            if (response.status !== 'connected') {
                cbLoginFail();
            } else {
            	cbLoginSuccess();
            }
        }, (userPermissions ? { "scope" : userPermissions} : null));
    };

    this.logout = function() {

    };

    this.loggedIn = function() {
        return loggedIn;
    };

    this.action = function(options) {
        var namespace = options.fb.namespace || OG_NAMESPACE;

        var link = null;

        var token = new FB_Token();
        token.init(options.fb.shortname);

        for (key in options.fb.data) {
            options.fb.data[key] = token.addToLink(options.fb.data[key]);
        }

        FB.api(
            '/me/' + namespace + ':' + options.fb.action, 'post', options.fb.data, function(response) {
                token.handleAPICallback(options, response);
            }
        );
    };

    this.share = function(options) {
    	if (!options || !options.fb || !options.app) return;

        if (!inited) {
            _this.onLogin(function(){
                _this.share(options);
            });
            _this.forceInit();
            return;
        }

        var params = {
            "method": 'feed',
            "link": options.fb.link || 'http://'+ window.location.hostname,
            "message": options.fb.message || null,
            "picture": options.fb.picture || null,
            "name": options.fb.name || null,
            "description": options.fb.description || null,
            "caption": options.fb.caption || null
        };

        var token = new FB_Token();

        token.init(options.fb.shortname);

        params.link = token.addToLink(params.link);

        FB.ui(params, function(response) {
            token.handleAPICallback(options, response);
        });
    }

    function FB_Token() {

        var token = '',
            tokenRequest = null,
            flyappsHost = 'flyapps.me';

        this.init = function(shortname) {

            var a = window.location.host.split('.');
            if (!shortname) {
                shortname = a[0];
            }

            a.splice(0, 1);

            flyappsHost = a.join(".");

            token = shortname + '-' + (new Date()).getTime();
        }

        this.addToLink = function(link) {
            if (link) {
                if (link.indexOf('?') !== -1 ) {
                        link += '&token=' + token;
                    } else {
                        link += '?token=' + token;
                    }
                    return link;
            }
            return false;
        }

        this.handleAPICallback = function(options, response) {
            if (!response || response.error) {
                options.fb.onError && options.fb.onError();
            } else {
                options.app.onSuccessInit && options.app.onSuccessInit();

                var user = null;
                var postId = null;

                if (response) {
                    postId = response.post_id;
                }

                var params = {
                            app : {
                                'id':options.app.app_id,
                                'name': options.app.app_name,
                                'link': options.app.app_link || options.fb.link,
                                'image': options.app.app_image || null
                            },

                            fb: options.fb,

                            post : {
                                'profile_id': null,
                                'profile_name': null,
                                'profile_image': null,
                                'message': null,
                                'created': null
                            }
                        };

                Doat.FB.getUser(function(response) {
                    options.app.getUser && options.app.getUser(response);

                    params.post.profile_id = response.id;
                    params.post.profile_name = response.name;
                    params.post.profile_image = 'http://graph.facebook.com/'+ response.id +'/picture';


                    if (postId) {
                        storeDB(params);

                        Doat.FB.getPostData(postId, function(data) {
                            options.app.onGetPostData && options.app.onGetPostData(data);

                            if (data.picture) {
                                params.app.image = decodeURIComponent(data.picture.match(/&src=(.+)/)[1]);
                            }

                            if (data.message) {
                                params.post.message = data.message;
                            }

                            if (data.created) {
                                params.post.created = data.created;
                            }

                            storeDB(params, function() {
                                options.fb.onSuccess && options.fb.onSuccess();
                            });
                        }, function() {
                            options.fb.onSuccess && options.fb.onSuccess();
                        });
                    } else {
                        storeDB(params, function() {
                            options.fb.onSuccess && options.fb.onSuccess();
                        });
                    }
                });
            }
        }

        function storeDB(data, callback) {
            tokenRequest && tokenRequest.abort();
            tokenRequest = $.getJSON('http://developer.'+ flyappsHost +'/facebook/updateToken.php?token='+token+'&data='+encodeURIComponent(JSON.stringify(data))+'&callback=?', function(response){
                callback && callback(response);
            });
        }
    }

    this.getUser = function(cbSuccess, cbError) {
        if (cacheUserResponse) {
            getUserCallback(cacheUserResponse, cbSuccess, cbError);
        } else {
            FB.api('/me', function(response){
                getUserCallback(response, cbSuccess, cbError);
            });
        }
    };

    function getUserCallback(response, cbSuccess, cbError) {
        cacheUserResponse = response;

        if (!response || response.error) {
            cbError && cbError(response);
        } else {
            cbSuccess && cbSuccess(response);
        }
    }

    this.getPostData = function(postId, cbSuccess, cbError) {
    	if (!postId) {
            return null;
    	}

    	FB.api(postId, 'get', function(response) {
            if (!response || response.error) {
                cbError && cbError(response);
            } else {
                cbSuccess && cbSuccess(response);
            }
        });

        return true;
    };

    function fbUser() {
    	return Storage.get(STORAGE_KEY_FB_USER);
    }

    function checkPermissions(permissions, cbSuccess, cbNoPerm) {
    	if (!permissions) {
            cbSuccess && cbSuccess();
            return;
    	}

        var queryString = 'select ' + permissions + ' from permissions where uid=me()';
        var query = FB.Data.query(queryString);

        query.wait(function(perms){
            var success = true;
            var permArray = new Array();
            permArray = permissions.split(",");

            $.each(permArray, function(index, perm){
                    if (perms[0][perm] != 1) {
                            success = false;
                            return;
                    }
            });

            if (success) {
                    cbSuccess && cbSuccess();
            } else {
                    cbNoPerm && cbNoPerm();
            }
        });
    }

    this.onLogin = function(cb) {
        loginCallbacks.push(cb);
    };

    function cbLoginSuccess() {
        Storage.set(STORAGE_KEY_FB_USER, FB_USER_RETURN);
    	$body.addClass(CLASS_FACEBOOK_LOGGEDIN);
        _this.hideLogin();

        for (var i=0; i<loginCallbacks.length; i++) {
            loginCallbacks[i]();
        }
    }
    function cbLoginFail() {

    }

    function renderCSS() {
        var CSS =
            '#doat-fb-login {' +
                'position: absolute;' +
                'left: 50%;' +
                'width: 260px;' +
                'margin: 0 0 0 -150px;' +
                'background: rgba(0, 0, 0, .8);' +
                'padding: 20px;' +
                'border-radius: 10px;' +
                'color: #fff;' +
                'text-shadow: 0 1px 3px rgba(0, 0, 0, .3);' +
                'text-align: center;' +
                'font-size: 18px;' +
                'z-index: 600;' +
                'display: none;' +
            '}' +

            '#doat-fb-login .button {' +
                'position: relative;' +
                'font-weight: bold;' +
                'margin-top: 20px;' +
                'height: 44px;' +
                'line-height: 44px;' +
                'font-size: 17px;' +
                'border: 1px solid #2e4687;' +
                'text-shadow: 0 1px 0 rgba(0, 0, 0, .5);' +
                'cursor: pointer;' +
                '-moz-box-shadow: 0 1px 0 0 #8d9fc8 inset, 0 2px 0 0 #6880b6 inset;' +
                '-webkit-box-shadow: 0 1px 0 0 #8d9fc8 inset, 0 2px 0 0 #6880b6 inset;' +
                '-ms-box-shadow: 0 1px 0 0 #8d9fc8 inset, 0 2px 0 0 #6880b6 inset;' +
                'box-shadow: 0 1px 0 0 #8d9fc8 inset, 0 2px 0 0 #6880b6 inset;' +
                'background: #485f9a;' +
                'background: -moz-linear-gradient(center top, #5670ad 0, #3c4e88 100%);' +
                'background: -webkit-gradient(linear, left top, left bottom, color-stop(0, #5670ad), color-stop(1, #3c4e88));' +
                'border-radius: 5px;' +
            '}' +

            '#doat-fb-login .button .c {' +
                'position: absolute;' +
                'top: 0;' +
                'bottom: 0;' +
                'left: 0;' +
                'right: 0;' +
                'padding-left: 45px;' +
                'opacity: 0;' +
                'pointer-events: none;' +
                '-moz-transition: all .3s linear;' +
                '-webkit-transition: all .3s linear;' +
                '-ms-transition: all .3s linear;' +
                'transition: all .3s linear;' +
            '}' +

            '#doat-fb-login .button .c.active {' +
                'opacity: 1;' +
                'pointer-events: auto;' +
            '}' +

            '#doat-fb-login .button .button-loading .text {' +
                'opacity: .5;' +
            '}' +

            '#doat-fb-login .button .icon {' +
                'position: absolute;' +
                'top: 0;' +
                'bottom: 0;' +
                'left: 0;' +
                'width: 45px;' +
                'border-right: 1px solid #2e4687;' +
                '-moz-box-shadow: -1px 1px 0 0 #8d9fc8 inset;' +
                '-webkit-box-shadow: -1px 1px 0 0 #8d9fc8 inset;' +
                '-ms-box-shadow: -1px 1px 0 0 #8d9fc8 inset;' +
                'box-shadow: -1px 1px 0 0 #8d9fc8 inset;' +
                'border-radius: 5px 0 0 5px;' +
            '}' +

            '#doat-fb-login .button .button-real .icon:before {' +
                'content: "";' +
                'position: absolute;' +
                'top: 50%;' +
                'left: 50%;' +
                'width: 32px;' +
                'height: 32px;' +
                'margin: -15px 0 0 -16px;' +
                'background-image:url(http://cdn0.flyapps.me/developer/facebook/fb.png);' +
                'background-size: 31px 32px' +
            '}' +

            '#doat-fb-login-cancel {' +
                'color: #ccc;' +
                'cursor: pointer;' +
                'font-size: 15px;' +
                'margin-top: 20px;' +
                'display: none;' +
            '}' +

            '#doat-fb-login-cancel span {' +
                'text-decoration: underline;' +
            '}' +

            '#doat-fb-overlay {' +
                'position: absolute;' +
                'height: 1000px;' +
                'top: 0;' +
                'left: 0;' +
                'right: 0;' +
                'bottom: 0;' +
                'background: rgba(0,0,0,.5);' +
                'z-index: 500;' +
                'display: none;' +
            '}';

        create('style', head, {'innerHTML': CSS});
    }

    function renderHTML() {
        var el = document.createElement('div');
        el.id = 'doat-fb-login';
        el.innerHTML =  '<div class="content"></div>'+
                        '<div class="button">'+
                                '<div class="c button-loading">'+
                                '<span class="icon"></span>'+
                                '<span class="text"></span>'+
                                '</div>'+
                                '<div class="c button-real">'+
                                '<span class="icon"></span>'+
                                '<span class="text"></span>'+
                                '</div>'+
                        '</div>'+
                        '<div class="cancel" id="doat-fb-login-cancel"></div>';

        document.body.appendChild(el);
    }

    var Storage = new function() {
        this.get = function(key) {
            var value = null;

            if ("localStorage" in window) {
                try {
                    value = localStorage[key];
                } catch(ex) {

                }
            }

            return value;
        };

        this.set = function(key, value) {
            if (!"localStorage" in window) {
                return false;
            }

            try {
                localStorage[key] = value;
            } catch(ex) {
                return false;
            }

            return true;
        };
    };
}

var Doat_Viewport = function(){
    var _this = this, _name = "Viewport",
        $container, currentSource,
        styleEl = {},
        testHeight = {
            "portrait": 560,
            "landscape": 340
        },
        minHeight = {
            "portrait": 416,
            "landscape": 250
        },
        Storage,
        STORAGE_HEIGHT_KEY = "viewport-height",
        storedHeight,
        storedHeightTTL = 86400000, // 24h
        shouldRecalculate = false;
    
        this.STORAGE = "storage";
        this.ENV = "env";
        this.DETECTED = "detected";
    
    this.init = function(cfg){
        $container = cfg.$container;
        
        logger = cfg.logger;

        Storage = cfg.Storage;
        
        storedHeight = getStoredHeight() || {};
    };
       
    this.setHeight = function(data){
        // get current orientation (portrait/landscape)
        var key = getOrientationKey();        
        !data && (data = {});
        
        if (styleEl[key]) {
            _this.hideAddressBar();
            setTimeout(_this.hideAddressBar, 1000);
            data.callback && data.callback();
            return false;
        }
        
        // if it's stored in localStorage or should be ignored (in order to retry)
        if (!storedHeight[key]){
            // get screen height from ENV
            var fixedHeight = Doat.Env.getScreen().height;
            if (fixedHeight){
                //set height and store
                setContainerHeight(fixedHeight, key, _this.ENV, data.callback);
                _this.hideAddressBar();
                setStoredHeight(key, fixedHeight);
            }
            // calculate it
            else{
                // make it as high as possible and hide the addressbar
                var $testEl = $('<div id="viewportTestElement" style="height: 2000px; width: 100%;">&#160;</div>');
                $container.append($testEl);
                
                _this.hideAddressBar();
                
                // wait for it to hide
                setTimeout(function(){
                    setDelayedHeight(key, data.callback);
                }, 2000); // minimum time it takes the browser to move the address bar up and get innerHeight right
            }
        } else {
            //set height
            setContainerHeight(storedHeight[key], key, _this.STORAGE, data.callback);
        }

        return true;
    };
    
    this.getHeight = function(){
        return {
            "value": $container.height(),
            "source": currentSource
        }
    };
    
    this.hideAddressBar = function(){
        window.setTimeout(function(){
            window.scrollTo(0, 1);
        }, 0);
    };
    
    this.shouldRecalculate = function(val){
        val && (shouldRecalculate = val);
        
        return shouldRecalculate;
    };
    
    this.getTestHeight = function(key){
        return testHeight[key];
    };
    
    function getOrientationKey(){
        return Doat.Env.getInfo().orientation.name;
    }
    
    function setDelayedHeight(key, cb){
        // make sure it's not under minimum height (happens if keyboard is up)
        if (window.innerHeight >= minHeight[key]){
            //set height and store
            setContainerHeight(window.innerHeight, key, _this.DETECTED, cb);
            setStoredHeight(key, window.innerHeight);
            _this.hideAddressBar();
        }
        else{
            setTimeout(function(){
                setDelayedHeight(key, cb);
            }, 1000);
        }
    }
    
    function setStoredHeight(key, value){
        //storedHeight[key] = value;
        //Storage.set(STORAGE_HEIGHT_KEY, JSON.stringify(storedHeight), storedHeightTTL);
    }
    
    function getStoredHeight(){
        /*var val = null;

        try {
            val = Storage.get(STORAGE_HEIGHT_KEY);
            if (val){
                val = JSON.parse(val);
            }
        } catch(ex) {
            
        }
        
        return val;*/
       return undefined;
    }
    
    function setContainerHeight(height, key, source, cb){
        var style = document.createElement("style");
        style.id = "viewport-"+key;
        var html = "";
        html += ".orientation-"+key+"{min-height:"+height+"px; position: relative; top: auto; left:auto; bottom: auto; right: auto}";
        html += ".orientation-"+key+" #viewportTestElement {display: none}";
        style.innerHTML = html;
        document.getElementsByTagName("head")[0].appendChild(style);
        
        styleEl[key] = true;
        currentSource = source;
        
        var data = {};
        data[key] = { "height": height };
        Doat.Env.setScreen(data);
        
        cb && cb(source);
    }
};


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

    window['TouchyJS'] = window['Doat'] = Doat;
})();


