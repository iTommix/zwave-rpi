(function($) {

    $.widget("zwave.slideButton", {

        options: {
            state: undefined,
            on: undefined,
            off: undefined
        },

        _create: function() {
            this.element.hide();
            this.outer = $('<div style="height: 200px;width: 50px;background-color: #565656;position: relative;border-radius: 10px;float: left;margin-left: 60px;">');
            this.top = $('<div style="width: 50px;height: 100px;position: absolute;border-radius: 10px;">');
            this.bottom = $('<div style="width: 50px;height: 100px;position: absolute;border-radius: 10px;top: 100px">');
            this.handle = $('<div style="background-color: yellow;width: 44px;height: 94px;position: absolute;z-index: 50;top: 0px;border-radius: 10px;margin: 3px;">');
            
            this.outer.append(this.top);
            this.outer.append(this.bottom);
            this.outer.append(this.handle);
            this.outer.insertAfter(this.element);
            if(typeof this.options.state == "undefined") {
                this.options.state = "on";
            }
            
            this.handle.css("top", (this.options.state=="on" ? "0%" : "50%")).css("background-color", (this.options.state=="on" ? "yellow" : "#ddd"));
            
            var self = this;
            this.top.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                if(typeof self.options.on === 'function') self.options.on.call(this);
                self.switch_on();
                return false;
            });
            this.bottom.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                if(typeof self.options.off === 'function') self.options.off.call(this);
                self.switch_off();
                return false;
            });
        },
        
        switch_off: function() {
            this.handle.animate({
                top: "50%",
                backgroundColor: "#ddd"
            },500, function() {
                
            });
            
        },
        
        switch_on: function(){
            this.handle.animate({
                top: "0%",
                backgroundColor: "yellow"
            },500, function() {
                
            });
        }
    });
})(jQuery);