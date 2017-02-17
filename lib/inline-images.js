var path = require('path');
var fs = require('fs');

module.exports = function(less) {

	var ParamStringReplacementNode = require('./param-string-replacement-node')(less);
	
    function InlineImages(options) {
        this.options = options;
        this._visitor = new less.visitors.Visitor(this);
    }

    InlineImages.prototype = {
        isReplacing: true,
        isPreEvalVisitor: true,
        run: function (root) {
            return this._visitor.visit(root);
        },
        visitRule: function (ruleNode, visitArgs) {
            this._inRule = true;
            return ruleNode;
        },
        visitRuleOut: function (ruleNode, visitArgs) {
            this._inRule = false;
        },

        // 图片大小
        _fileSize: function(path){
            try {
                var stats = fs.statSync(path);
                if(stats.isFile())
                    return stats.size;
                else
                    return false;
            }catch(e){
               return false;
            }
        },

        // 图片的路径
        _realPath: function(path){
            return path.replace(/^\//, this.options.baseDir ? this.options.baseDir + '/' : '/');
        },

        visitUrl: function (URLNode, visitArgs) {
            if (!this._inRule) {
                return URLNode;
            }
            if (URLNode.value && URLNode.value.value && URLNode.value.value.indexOf('#') === 0) {
              // Might be part of a VML url-node value like:
              // ``behavior:url(#default#VML);``
              return URLNode;
            }

            if (URLNode.value && URLNode.value.value && typeof(URLNode.value.value) === "string" ) {

                // 图片后缀匹配
                if(this.options.extensions)
                {
                    var validExtension = false;
                    for(var i in  this.options.extensions)
                    {
                        if( URLNode.value.value.match(this.options.extensions[i]) !== null )
                        {
                            this.options.debug && console.log("less-plugin-base64: " +  URLNode.value.value + " match extensions");
                            validExtension = true;
                            break;
                        }
                    }
                    if(! validExtension)
                    {
                        return URLNode;
                    }
                }

                // 图片没有在排除名单上
                if(this.options.exclude)
                {
                    for(var i in  this.options.exclude)
                    {
                        if( URLNode.value.value.match(this.options.exclude[i]) !== null )
                        {
                            this.options.debug && console.log("less-plugin-base64: " +  URLNode.value.value + " match exclude");
                            return URLNode;
                        }
                    }
                }

                // 图片大小没有超过限制
                if(this.options.maxImageSize){
                    var mSize   = parseInt(this.options.maxImageSize);
                    var size    = this._fileSize(this._realPath(URLNode.value.value));
                    if(!size || size > mSize){
                        this.options.debug && console.log("less-plugin-base64: " +  URLNode.value.value + " over maxImageSize or not a file");
                        return URLNode;
                    }
                }

                // 图片存在
                if(this._fileSize(this._realPath(URLNode.value.value)))
                    URLNode.value.value = this._realPath(URLNode.value.value)
            }

            this.options.debug && console.log("less-plugin-base64: " +  URLNode.value.value + " encode to data URI");
            return new less.tree.Call("data-uri", [new ParamStringReplacementNode(URLNode.value, this.options)], URLNode.index || 0, URLNode.currentFileInfo);
        }
    };
    return InlineImages;
};
