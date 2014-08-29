(function(){

  this.Texture = function(options){
    requireOptions(options, [ "engine", "width", "height" ]);

    if ( !(this instanceof arguments.callee) ) return new arguments.callee(options);

    this.engine = options.engine;
    this.gl = engine.gl;
    this.width = options.width;
    this.height = options.height;
    this.offsetX = options.offsetX || 0;
    this.offsetY = options.offsetY || 0;

    this.image = options.image;

    this.storedWidth = MathUtils.nextPow2(this.width);
    this.storedHeight = MathUtils.nextPow2(this.height);
    this.unit = 0;
  }

  Texture.fromImage = function(engine, width, height, image) {
    var texture = Texture({
      engine: engine, 
      width: width, 
      height: height,
      image: image
    });

    texture.init();
    texture.bind();
    texture.create(image);    
    texture.unbind();

    return texture;
  }

  Texture.prototype = {
    init: function() {
      this.id = this.engine.gl.createTexture();
    },

    bind: function() {
      var gl = this.gl, shader = this.engine.shader;

      gl.activeTexture(gl.TEXTURE0 + this.unit);
      gl.bindTexture(gl.TEXTURE_2D, this.id);

      if (shader) return shader.uniform1i("uTexture", 0);
    },

    create: function(image) {
      var gl = this.gl;

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      if(image) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      else if(this.image) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    },

    unbind: function() {
      var gl = this.gl;
      return gl.bindTexture(gl.TEXTURE_2D, null);
    },

    destroy: function() {
      this.gl.deleteTexture(this.id);
    }
  }
})();