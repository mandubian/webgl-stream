(function(){
  this.requireOptions = function(options, requiredOptions){
    var errors = [];
    for (var i=0; i<requiredOptions.length; i++)  
      if (!(requiredOptions[i] in options))
        errors.push(requiredOptions[i]);
    
    if(errors.length) throw new Error("options [" + errors + "] required.");
  }

  this.GLUtils = {
    isWebGLSupported: function() {
      return !!GLUtils.getWebGLContext(document.createElement("canvas"));
    },

    getWebGLContext: function(canvas) {
      if (!canvas.getContext) return;
      var names = ["webgl", "experimental-webgl"];
      for (var i = 0; i < names.length; ++i) {
        try {
          var ctx = canvas.getContext(names[i]);
          if (ctx) return ctx;
        } catch(e) {}
      }
    },

    makeWebGLDebugContext: function(ctx, debug) {
      if (debug) {
        return WebGLDebugUtils.makeDebugContext(ctx, function(err, funcName, args) {
          var errorStr, x;
          args = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = args.length; _i < _len; _i++) {
              x = args[_i];
              _results.push(x);
            }
            return _results;
          })();
          errorStr = WebGLDebugUtils.glEnumToString(err);
          console.error("WebGL Error: func=%s args=%s error=%S", funcName, args, errorStr);
          if (typeof console.trace === "function") console.trace();
          throw "Aborting rendering after critical WebGL error";
        });
      }
      else return ctx;
    },

    clearColor: function(gl, color) {
      gl.clearColor(color[0], color[1], color[2], color[3]);
      return gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    },

    loadProgram: function(gl, shaders) {
      var program = gl.createProgram();
      shaders.forEach(function (shader) {
        gl.attachShader(program, shader);
      });
      gl.linkProgram(program);

      var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (!linked) {
        gl.deleteProgram(program);
        throw new Error(program+" "+gl.getProgramInfoLog(program));
      }
      return program;
    },

    loadShaderFromId: function(gl, id, shaderType) {
      if(!document.getElementById(id)) throw new Error("couldn't find shader with ID "+id);
      var shader = GLUtils.loadShader(gl, document.getElementById(id).innerHTML, shaderType);
      console.debug("Loaded Shader '%s'", id);
      return shader;
    },

    loadShader: function(gl, shaderSource, shaderType) {
      var shader = gl.createShader(shaderType);
      gl.shaderSource(shader, shaderSource);
      gl.compileShader(shader);
      var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (!compiled) {
        lastError = gl.getShaderInfoLog(shader);
        var split = lastError.split(":");
        var col = parseInt(split[1], 10);
        var line = parseInt(split[2], 10);
        var s = "";
        if (!isNaN(col)) {
          var spaces = ""; for (var i=0; i<col; ++i) spaces+=" ";
          s = "\n"+spaces+"^";
        }
        console.error(lastError+"\n"+shaderSource.split("\n")[line-1]+s);
        gl.deleteShader(shader);
        throw new Error(shader+" "+lastError);
      }
      return shader;
    }
  };

  this.MathUtils = {
    hexToVec4: function(hex) {
      var v0, v1, v2, v3, lg;
      if (hex.match(/^#/)) hex = hex.substr(1);

      a = 1.0;
      if ((lg = hex.length) === 3 || lg === 4) {
        v0 = parseInt(hex[0], 16) / 15.0;
        v1 = parseInt(hex[1], 16) / 15.0;
        v2 = parseInt(hex[2], 16) / 15.0;
        if (lg === 4) v3 = parseInt(hex[3], 16) / 15.0;
      } else {
        v0 = parseInt(hex.substr(0, 2), 16) / 255.0;
        v1 = parseInt(hex.substr(2, 2), 16) / 255.0;
        v2 = parseInt(hex.substr(4, 2), 16) / 255.0;
        if (lg > 6) v3 = parseInt(hex.substr(6, 2), 16) / 255.0;
      }
      return vec4.fromValues(v0, v1, v2, v3);
    },
    nextPow2: function(value){
      value--;
      value |= value >> 1;
      value |= value >> 2;
      value |= value >> 4;
      value |= value >> 8;
      value |= value >> 16;
      return value + 1;
    },
    deg2Rad: function(value){
      return value * Math.PI / 180;
    }
  };

  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
  // requestAnimationFrame polyfill by Erik Möller
  // fixes from Paul Irish and Tino Zijdel
  (function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function(callback, element) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
      };
 
    if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = function(id) {
          clearTimeout(id);
      };
  }());

  // Tiny Loader Lib used for Glsl.js examples https://github.com/gre/glsl.js
  function makeMultiLoader (loadf) {
    return function (urls, callback) {
      if (!(urls instanceof Array)) urls = [ urls ];
      var resources = [];
      var nb = 0;
      for (var r=0; r<urls.length; ++r) (function (url, r) {
        loadf(url, function (img) {
          resources[r] = img;
          if ((++nb) == urls.length)
            callback.apply(callback, resources);
        });
      }(urls[r], r));
    }
  }

  this.Loader = {
    text: function (url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState==4 && xhr.status==200) {
          callback(xhr.responseText);
        }
      }
      xhr.open("GET", url, true);
      xhr.send();
    },

    image: function (url, callback) {
      var img = new Image();
      img.onload = function () {
        callback(img)
      };
      img.src = url;
    },

    audio: function (urlPrefix, callback) {
      var audio = new Audio();
      var source;
      source = document.createElement('source');
      source.type = 'audio/mpeg';
      source.src = urlPrefix+'.mp3';
      audio.appendChild(source);
      source = document.createElement('source');
      source.type = 'audio/ogg';
      source.src = urlPrefix+'.ogg';
      audio.appendChild(source);
      audio.load();
      callback(audio); // Don't wait for audio load for now
    }/*,

    images: makeMultiLoader(this.image),

    texts: makeMultiLoader(this.text),

    audios: makeMultiLoader(this.audio)*/
  };

  

})();