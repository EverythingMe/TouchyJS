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