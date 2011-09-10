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
   (location.search || '').replace(/(?:[?&]|^)([^=]+)=([^&]*)/g, function(ig, k, v) {r[k] = v;});
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