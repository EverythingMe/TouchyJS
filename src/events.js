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
