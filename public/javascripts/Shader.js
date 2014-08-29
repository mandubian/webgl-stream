(function(){
  this.Shader = function(gl, vertexShaderId, fragmentShaderId){
    this.gl = gl;
    this.vertexShader = GLUtils.loadShaderFromId(gl, vertexShaderId, gl.VERTEX_SHADER);
    this.fragmentShader = GLUtils.loadShaderFromId(gl, fragmentShaderId, gl.FRAGMENT_SHADER);

    this.program = GLUtils.loadProgram(gl, [this.vertexShader, this.fragmentShader]);
    this.gl.useProgram(this.program);

    this.uniforms = {};
    this.attribs = {};
  };

  Shader.prototype.getUniformLocation = function(name) {
    var u = this.uniforms[name];
    if(!u) u = this.uniforms[name] = this.gl.getUniformLocation(this.program, name);
    return u;
  };

  Shader.prototype.getAttribLocation = function(name) {
    var a = this.attribs[name];
    if(!a) this.attribs[name] = this.gl.getAttribLocation(this.program, name);
    return a;
  };

  Shader.prototype.uniform1i = function(name, value) {
    var l = this.getUniformLocation(name);
    if(l) return this.gl.uniform1i(l, value);
  };

  Shader.prototype.uniform1f = function(name, value) {
    var l = this.getUniformLocation(name);
    if(l) return this.gl.uniform1f(l, value);
  };

  Shader.prototype.uniform2f = function(name, v1, v2) {
    var l = this.getUniformLocation(name);
    if(l) return this.gl.uniform2f(l, v1, v2);
  };

  Shader.prototype.uniform2fv = function(name, v) {
    var l = this.getUniformLocation(name);
    if(l) return this.gl.uniform2fv(l, v);
  };

  Shader.prototype.uniform3fv = function(name, v) {
    var l = this.getUniformLocation(name);
    if(l) return this.gl.uniform3fv(l, v);
  };

  Shader.prototype.uniform4fv = function(name, v) {
    var l = this.getUniformLocation(name);
    if(l) return this.gl.uniform4fv(l, v);
  };

  Shader.prototype.uniformMatrix3fv = function(name, v) {
    var l = this.getUniformLocation(name);
    if(l) return this.gl.uniformMatrix3fv(l, false, v);
  };

  Shader.prototype.uniformMatrix4fv = function(name, v) {
    var l = this.getUniformLocation(name);
    if(l) return this.gl.uniformMatrix4fv(l, false, v);
  };

  Shader.prototype.bind = function() {
    return this.gl.useProgram(this.prog);
  };

  Shader.prototype.unbind = function() {
    return this.gl.useProgram(null);
  };

  Shader.prototype.destroy = function() {
    var gl = this.gl;
    gl.destroyProgram(this.prog);
    gl.destroyShader(this.vertexShader);
    return gl.destroyShader(this.fragmentShader);
  };


})();