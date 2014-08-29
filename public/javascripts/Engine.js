(function(){
  this.Engine = function(options){
    requireOptions(options, [ "canvas", "vertexShaderId", "fragmentShaderId" ]);

    if ( !(this instanceof arguments.callee) ) return new arguments.callee(options);

    this.canvasId = options.canvas;
    this.vertexShaderId = options.vertexShaderId;
    this.fragmentShaderId = options.fragmentShaderId;

    this.debug = options.debug;
    this.color = MathUtils.hexToVec4(options.color || "#000000ff");

    this.initCtx();
    this.initGL();
    this.initMatrix();
    this.initShader();
  }

  Engine.prototype = {
    initCtx: function() {
      if(!GLUtils.isWebGLSupported()) throw "WebGl not supported";

      this.canvas = document.getElementById(this.canvasId);  
      this.gl = GLUtils.makeWebGLDebugContext(GLUtils.getWebGLContext(this.canvas), this.debug);
    },

    initGL: function(){
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.aspect = this.canvas.width / this.canvas.height;

      GLUtils.clearColor(this.gl, this.color);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.depthFunc(this.gl.LEQUAL);
      //this.gl.disable(this.gl.GL_CULL_FACE);
      //this.gl.enable(this.gl.CULL_FACE);
      //this.gl.cullFace(this.gl.BACK);

      //this.gl.viewport(0, 0, this.width, this.height);

      console.debug('Render canvas =', this.canvas);
      console.debug('WebGL context =', this.gl);
    },

    initMatrix: function(){
      this.model = new MatrixStack();
      this.view = new MatrixStack();
      this.projection = new MatrixStack();
    },

    initShader: function(){
      this.shader = new Shader(this.gl, this.vertexShaderId, this.fragmentShaderId);

      this.shader.uniform2f("uViewportSize", this.width, this.height);
    },

    loop: function(doit) {
      var startTime = Date.now(),
          lastTime = 0,
          delta = 0,
          self = this,
          t;

      this.running = true;
      requestAnimationFrame(function step() {
        if (this.stopRequest) { // handle stop request
          this.stopRequest = false;
          this.running = false;
          return;
        }
        requestAnimationFrame(step, self.canvas);
        t = Date.now()-startTime;
        delta = t-lastTime;
        lastTime = t;
        // TEMPORARY
        self.shader.uniform2f("uDeltaTime", t, delta);
        doit(t, delta);
      }, self.canvas);
      return this;
    },

    stop: function () {
      this.stopRequest = true;
    },

    flushUniforms: function() {
      var gl = this.gl,
          shader = this.shader;

      //if (shader._uniformVersion === this._uniformVersion) return;
      shader.uniform2f("uViewportSize", this.width, this.height);
      shader.uniformMatrix4fv("uModelMatrix", this.model.top);
      shader.uniformMatrix4fv("uViewMatrix", this.view.top);
      shader.uniformMatrix4fv("uModelViewMatrix", this.getModelView());
      shader.uniformMatrix4fv("uProjectionMatrix", this.projection.top);
      shader.uniformMatrix4fv("uModelViewProjectionMatrix", this.getModelViewProjection());
      shader.uniformMatrix3fv("uNormalMatrix", this.getNormal());
      //return shader._uniformVersion = this._uniformVersion;
    },


    getModelView: function(){
      return mat4.multiply(mat4.create(), this.view.top, this.model.top);
    },

    getModelViewProjection: function(){
      return mat4.multiply(mat4.create(), this.projection.top, this.getModelView());
    },

    getNormal: function(){
      return mat3.invert(mat3.create(), mat3.fromMat4(mat3.create(), this.model.top));
    },

    /*getCurrentFrustum: ->
      @_frustum ?= new webglmc.Frustum this.getModelViewProjection()*/

    getInverseView: function(){
      return mat4.invert(this.view.top, mat4.create());
    },

    getInverseViewProjection: function(){
      var viewproj = mat4.multiply(this.projection.top, this.view.top, mat4.create());
      return mat4.invert(viewproj);
    },

    getCameraPos: function(){
      var iview = this.getInverseView();
      return vec3.fromValues(iview[12], iview[13], iview[14]);
    },

    getForward: function(){
      return vec3.fromValues(-this.view.top[2], -this.view.top[6], -this.view.top[10]);
    }

  }
})();