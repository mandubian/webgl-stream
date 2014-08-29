(function(){
  this.Camera = function(options){
    if ( !(this instanceof arguments.callee) ) return new arguments.callee(options);

    this.engine = engine;

    this.position = options.position || vec3.fromValues(0.0, 0.0, 0.0);
    this.lookAtPos = options.lookAt || vec3.fromValues(0.0, 0.0, 0.0);
    this.forward = options.forward || vec3.fromValues(0.0, 0.0, -1.0);
    this.up = vec3.fromValues(0.0, 1.0, 0.0);
    this.fov = options.fov || 45.0;
    this.near = options.near || 0.1;
    this.far = options.far || 400;
    this.zoomFactor = options.zoomFactor || 1.0;
  }

  Camera.prototype = {
    apply: function(){
      var mv = mat4.create(),
          ref = vec3.clone(this.position);

      vec3.add(ref, ref, this.forward);
      mat4.lookAt(mv, this.position, ref, this.up);
      
      var fov = MathUtils.deg2Rad(this.fov * this.zoomFactor);
      this.engine.projection.set(mat4.perspective(mat4.create(), fov, this.engine.aspect, this.near, this.far));
      this.engine.view.set(mv);
    },

    lookAt: function(pos){
      this.lookAtPos = pos;
      vec3.subtract(this.forward, this.lookAtPos, this.position);
      vec3.normalize(this.forward, this.forward);
    },

    move: function(dir){
      vec3.add(this.position, this.position, dir);
    },

    moveRotate: function(axis, rad){
      var neg = vec3.create(), rotTransMat = mat4.create(), q = quat.setAxisAngle(quat.create(), axis, rad);

      // translation vector setting origin to lookAt
      vec3.negate(neg, this.lookAtPos);
      // computes new position with lookAt as origin and using quaternion as rotation
      mat4.fromRotationTranslation(rotTransMat, q, neg);      
      vec3.transformMat4(this.position, this.position, rotTransMat);
      // retranslates position to real origin
      vec3.add(this.position, this.position, this.lookAtPos);
      // recomputes forward vector
      vec3.subtract(this.forward, this.lookAtPos, this.position);
      vec3.normalize(this.forward, this.forward);
    },

    zoom: function(factor) {
      this.zoomFactor = factor;
    }
  }
})();