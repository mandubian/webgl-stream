(function(){
  this.Game = function(options){
    requireOptions(options, [ "engine", "camera", "world" ]);

    if ( !(this instanceof arguments.callee) ) return new arguments.callee(options);

    this.engine = options.engine;
    this.camera = options.camera;
    this.world = options.world;

    this.hasTouch = ('ontouchstart' in window);

    this.actions = [];

    this.initEventHandlers();
    this.lastEventPos = null;
    this.clicked = false;

    this.viewSquaredLength = vec2.squaredLength(vec2.fromValues(this.engine.width, this.engine.height));
    this.previousSign = 1.0;
  }

  Game.prototype = {
    initEventHandlers: function() {
      var self = this;

      if (!this.hasTouch) {
        canvas.addEventListener("mousemove", function (event) {
          self.mouseMove(event);
        }, false);
        canvas.addEventListener("mousedown", function (e) {
          self.mouseDown(event);
        });
        canvas.addEventListener("mouseup", function (e) {
          self.mouseUp(event);
        });
      }
      else {
        canvas.addEventListener("touchmove", function (event) {
          self.touchMove(event);
        }, false);
        canvas.addEventListener("touchstart", function (event) {
          self.touchStart(event);
        });
      }
    },

    run: function(){
      this.loop();
    },

    loop: function(){
      var self = this;
      this.engine.loop(function(t, dt){
        self.updateGame(t, dt);
        self.render();
      });
    },

    computeSign: function(dv) {
      var dx = dv[0], dy = -dv[1];

      //console.debug("dx:", dx, " dy:", dy);
      if(dx < 0 && dy < 0) return -1.0;
      if(dx > 0 && dy > 0) return 1.0;
      else if((dx < 0 && dy >= 0)  && (Math.abs(dx) > Math.abs(dy))) return -1.0;
      else if((dx >= 0 && dy < 0)  && (Math.abs(dx) < Math.abs(dy))) return -1.0;  
      return this.previousSign;
    },

    moveRotate: function(v, dt) {
      var dv = vec3.create(), axis, angle;

      vec3.subtract(dv, v, this.lastEventPos);

      // creates Y rotation axis
      axis = vec3.fromValues(0.0, 1.0, 0.0);
      angle = vec3.squaredLength(dv) * Math.PI * 10000 / (this.viewSquaredLength * dt) /*/ (10.0 * dt)*/;
      angle = this.computeSign(dv) * angle;

      //console.debug("dv:", dv, " length:", vec3.squaredLength(dv));
      //console.debug("axis:", axis, " angle:", angle);
      this.camera.moveRotate(axis, angle);
    },

    zoom: function(v, dt) {
      var dv = vec3.create(), factor;

      vec3.subtract(dv, v, this.lastEventPos);

      factor = this.camera.zoomFactor + 
               this.computeSign(dv) * vec3.squaredLength(dv) * Math.PI * 5000 / (this.viewSquaredLength * dt);
      //console.debug("zoom factor:"+factor);
      if(factor > 0) {
        this.camera.zoom(factor);        
      }      
    },

    updateGame: function(t, dt) {
      var v = this.actions.pop(), dv = vec3.create(), axis, angle;
      if(!this.lastEventPos) this.lastEventPos = v;
      else {
        if(v) {
          if(!this.clicked) this.moveRotate(v, dt);
          else this.zoom(v, dt);

          this.lastEventPos = v;
        }
      }
      this.world.update(t, dt);

      this.camera.apply();
    },

    render: function(){
      this.world.draw();
    },

    mouseMove: function(event){
      this.actions.push(vec3.fromValues(event.clientX, event.clientY, 1.0 /*event.timeStamp*/));
    },

    mouseDown: function(event){
      this.clicked = true;
    },

    mouseUp: function(event){
      this.clicked = false;
    },

    touchMove: function(event){
      console.log("touchMove:"+event);
    },

    touchStart: function(event){
      console.log("touchStart:"+event);
    }
  }
})();