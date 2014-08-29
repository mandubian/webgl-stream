(function(){
  
  this.Buffer = function(name, size, data, type, elementType){
    this.name = name;
    this.size = size;
    this.data = new Float32Array(data);
    
    this.uploaded = false;
    this.id = null;
    this.stride = 0;
    this.offset = 0;

    this.type = type;
    this.elementType = elementType;
  }

  this.VBO = function(options){
    requireOptions(options, ["engine", "drawMode", "size"])
    if ( !(this instanceof arguments.callee) ) return new arguments.callee(options);

    this.engine = options.engine;
    this.gl = this.engine.gl;
    this.drawMode = this.gl[options.drawMode];
    this.size = options.size;

    this.buffers = {};
  }

  VBO.prototype = {
    addBuffer: function(name, size, data, type, elementType) {
      if(!type) type = this.gl.ARRAY_BUFFER;
      if(!elementType) elementType = this.gl.FLOAT;
      this.buffers[name] = new Buffer(name, size, data, type, elementType);
    },

    upload: function() {
      var tmps = [], tmp, 
          counter = 0, offset = 0,
          id, buffer, i,
          gl = this.gl;

      for(name in this.buffers) {
        buffer = this.buffers[name];
        id = gl.createBuffer();
        gl.bindBuffer(buffer.type, id);
        gl.bufferData(buffer.type, buffer.data, gl.STATIC_DRAW);

        buffer.id = id;
        buffer.uploaded = true;
      }
      
    },

    destroy: function() {    
      var gl = this.gl;
        
      for(name in this.buffers) {
        var buffer = this.buffers[name];
        if(buffer.id) gl.deleteBuffer(buffer.id);
        buffer.uploaded = false;
      }

      this.buffers = {};
      return this.size = 0;
    },

    bind: function() {
      var gl = this.gl, 
          shader = this.engine.shader,
          i, buffer, loc;

      for(var name in this.buffers){
        buffer = this.buffers[name];

        loc = shader.getAttribLocation(buffer.name);
        if(loc >= 0) {
          gl.bindBuffer(buffer.type, buffer.id);
          gl.vertexAttribPointer(loc, buffer.size, buffer.elementType, false, buffer.stride, buffer.offset);
          gl.enableVertexAttribArray(loc);
        }
      }

      gl.drawArrays(this.drawMode, 0, this.size);
    },

    unbind: function() {
      var gl = this.gl, 
          shader = this.engine.shader,
          i, buffer, loc;

      for(var name in this.buffers){
        buffer = this.buffers[name];

        loc = shader.getAttribLocation(buffer.name);
        if(loc >= 0) gl.disableVertexAttribArray(loc);
      }
    },

    draw: function() {
      var gl = this.gl, 
          shader = this.engine.shader,
          i, buffer, loc;

      this.bind();
      this.engine.flushUniforms();
      this.unbind();      
    }
  }
})();
