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