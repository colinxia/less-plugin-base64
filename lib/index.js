var getInlineImages = require("./inline-images");

var lessPlugin = function(options){
   this.options = options || {};
}

lessPlugin.prototype = {
    install: function(less, pluginManager) {
        var InlineImages = getInlineImages(less);
        pluginManager.addVisitor(new InlineImages(this.options));
    }
};

module.exports = lessPlugin
