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