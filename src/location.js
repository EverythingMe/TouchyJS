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
