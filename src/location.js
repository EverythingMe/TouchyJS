(function(){
    var callback, lastPosition,
        generatedCallback = 'doat_onLocationRetrieved_'+new Date().getTime(),
        Log = (typeof Doat != 'undefined' && Doat && Doat.Log) || new Logger();

    Doat_Env.prototype.getLocation = function(_callback, cfg){
        callback = _callback;

        if (!cfg || !cfg.testProps){
            if (cfg && cfg.request){
                Log.info('Specific params requested for location', cfg.request);
                var qs = parseQuery(), data = {}, flag = true,
                    arr = (cfg.request.constructor === String) ? [cfg.request] : cfg.request;

                for (var i=0; i<arr.length; i++){
                    var key = 'do_loc_'+arr[i];
                    if (qs[key]){
                        data[arr[i]] = decodeURIComponent(qs[key]);
                        Log.info('found '+key);
                    }
                    else{
                        flag = false;
                        Log.info('could not find '+arr[i]+' in querystring');
                        break;
                    }
                }
                if (flag){
                    callback(normalize(data));
                    return true;
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
        callback(normalize(data));
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
            if (data.lat && data.lon){
                data.position = {
                    'coords': {
                        'latitude': data.lat,
                        'longitude': data.lon
                    }
                }
                delete data.lat;
                delete data.lon;
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
        
        if (lastPosition){
            json['position'] = lastPosition;
            lastPosition = undefined;
        }

        return json;
    }
})()