(function(){
  //CUBE_SIZE = 3.2;
  CUBE_SIZE = 2.4;

  VIEW_DISTANCE_X = 20;

  VIEW_DISTANCE_Y = 20;

  VIEW_DISTANCE_Z = 20;

  CubeMaker = function() { return Cube({ "drawMode" : "TRIANGLES"}); }

  this.World = function(options){
    requireOptions(options, [ "engine", "texture" ]);

    if ( !(this instanceof arguments.callee) ) return new arguments.callee(options);

    this.texture = options.texture;
    this.engine = options.engine;

    this.blocks = {};
    this.vbos = {};
    this.hidden = {};
    this.hiddenNb = 0;
    this.blockNb = 0;
    this.nbx = 60;
    this.nby = 60;
  }

  World.prototype = {
    addPoly: function(poly) {
      this.blocks[poly.id] = { 
        positions : poly.data[0],
        normals : poly.data[1],
        texcoords : poly.data[2]
      }

      var vbo = VBO({
        engine: engine, 
        drawMode: "TRIANGLES",
        size: 6
      });

      vbo.addBuffer('aVertexPosition', 3, poly.data[0]);
      vbo.addBuffer('aVertexNormal', 3, poly.data[1]);
      vbo.addBuffer('aTextureCoord', 2, poly.data[2]);
      
      vbo.upload();
      this.vbos[poly.id] = vbo;

    },

    generate: function() {
      var x, y, id,
          nbx = this.nbx, nby = this.nby, i, j, szx = (nbx / 2.0), szy = (nby / 2.0), 
          textureIncx = 1.0 / nbx, textureIncy = 1.0 / nby, offx = 0, offy = 0;

      for(i = 0; i < nbx; i++)
        for(j = 0; j < nby; j++) {
          /*if(i < szx) offx = -0.05 * (szx - i); 
          else offx = 0.05 * (i - szx);
          
          if(j < szy) offy = -0.05 * (szy - j); 
          else offy = 0.05 * (j - szy);*/
          x = -szx + offx + i + 0.5;
          y = -szy + offy + j + 0.5;
          id = i + "," + j;

          // console.log("id:"+id+" offx:"+offx+ " offy:"+offy+ " x:"+x 
          //   + " y:"+y + " tx:"+(textureIncx * i) + " ty:"+(textureIncy * j) + " tfacx:"+textureIncx+ " tfacy"+textureIncy);
          this.setBlock(
            id, 
            x * CUBE_SIZE, y * CUBE_SIZE, 0.0, 
            textureIncx * i, textureIncy * j, 
            textureIncx, textureIncy
          );

          this.createVBO(id);

        }
      //this.setBlock("0", x, y, z, 0.0, 0.0, 0.333333, 1.0);
      //this.setBlock("1", x + 1.01, y, z, 0.333333, 0.0, 0.333333, 1.0);
      //this.setBlock("2", x + 2.02, y, z, 0.666666, 0.0, 0.333333, 1.0);

      this.blockNb = nbx * nby;
      return this;
    },

    getBlock: function(id) {
      return this.blocks[id];
    },

    setBlock: function(id, x, y, z, tx, ty, tfx, tfy) {
      this.blocks[id] = { 
        pos : vec3.fromValues(x, y, z),
        tpos: vec2.fromValues(tx, ty),
        tfac: vec2.fromValues(tfx, tfy),
        axis: vec3.fromValues(0.0, 1.0, 0.0),
        angle: 0.0
      };      
    },

    createVBO: function(id) {
      var block = this.blocks[id],
          maker = CubeMaker();

      if(block /*&& !this.hidden[id]*/) {
        var x = block.pos[0],
            y = block.pos[1],
            z = block.pos[2];

        maker.addSide(
          "near",
          x, 
          y, 
          z, 
          CUBE_SIZE,
          //block.axis,
          //block.angle,
          this.texture,
          block.tpos[0],
          block.tpos[1],
          block.tfac[0],
          block.tfac[1]
        );
  
        this.vbos[id] = maker.makeVBO(this.engine);
      }

    },
    moveBlock: function(id, x, y, z) {
      var block = this.blocks[id];
      if(block) {
        block.pos = vec3.fromValues(x, y, z);
      }
    },

    rotateBlock: function(id, axis, angle) {
      var block = this.blocks[id];
      if(block) {
        block.axis = axis;
        block.angle = angle;
      }
    },

    
    /*createVBO: function(){

      this.maker.addSideRotate(
        "near",
        0, 
        0, 
        0, 
        CUBE_SIZE,
        vec3.fromValues(0.0, 1.0, 0.0),
        0,
        this.texture
      );

      return this.maker.makeVBO(this.engine);
    },*/

    iterVisibles: function(callback){
      var vbo, block, results = [];

      for(var id in this.vbos) {
        block = this.vbos[id];
        if (!block) continue;
        results.push(callback(block, this.vbos[id]));
      }

      return results;
    },

    update: function(t, dt){
      var div = t * Math.PI / 1000.0, x, y, z,
      //var div = dt * Math.PI / 100.0,
          nb = 10, i, j, block, id;

      /*if(this.currentRot) {
        if(this.currentRot.angle <= Math.PI/2 + 0.5) {
          this.currentRot.angle += div;
          this.rotateBlock(this.currentRot.id, vec3.fromValues(0.0, 1.0, 0.0), this.currentRot.angle);
        }
        else {
          this.hidden[this.currentRot.id] = true;
          this.hiddenNb++;
          if(this.hiddenNb >= this.blockNb) return;
          var found = true;
          while(found) {
            i = Math.floor(Math.random()*nb);
            j = Math.floor(Math.random()*nb);
            id = i + "," + j;
            if(!this.hidden[id]) found = false;
          }
          block = this.blocks[id];

          if(block){
            this.rotateBlock(id, vec3.fromValues(0.0, 1.0, 0.0), div);
            this.currentRot = {
              id: id,
              angle: div
            };
          }
        }
      } else {
        if(this.hiddenNb >= this.blockNb) return;
        var found = true;
        while(found) {
          i = Math.floor(Math.random()*nb);
          j = Math.floor(Math.random()*nb);
          id = i + "," + j;
          if(!this.hidden[id]) found = false;
        }
        block = this.blocks[id];

        if(block){
          this.rotateBlock(id, vec3.fromValues(0.0, 1.0, 0.0), div);
          this.currentRot = {
            id: id,
            angle: div
          };
        }
      }*/

      // this.setBlock("0", -1.0 + div, block.pos[1], block.pos[2]);
      // this.setBlock("1", div, div, block.pos[2]);
      // this.setBlock("2", 1.0 + div, block.pos[1], block.pos[2]);

      // this.moveBlock("0", -1.0 + div, block.pos[1], block.pos[2]);
      // this.moveBlock("1", div, div, block.pos[2]);
      // this.moveBlock("2", 1.0 + div, block.pos[1], block.pos[2]);
      //for(var id in this.blocks) {
        //block = this.blocks[id];
        //x = block.pos[0]; y = block.pos[1]; z = block.pos[2];
        //this.rotateBlock(id, vec3.fromValues(0.0, 0.0, 1.0), Math.sin(t/20000) * Math.sqrt(x*x+y*y) / 15 );
        //block.pos[0] = Math.sin(x*x+y*y) * Math.sin(t);
        //block.pos[1] = Math.sin(x*x+y*y) * Math.sin(t);

        //this.moveBlock(id, x+0.1*Math.cos(t), y+0.1*Math.sin(t), 1.0);
      //}

      
    },

    draw: function() {
      var model = this.engine.model, self = this;

      GLUtils.clearColor(this.engine.gl, this.engine.color);

      this.texture.destroy();
      this.texture.init();
      this.texture.bind();
      this.texture.create(this.image);

      var results = this.iterVisibles(function(block, vbo) {
        model.push();
        //console.log("pos:"+block.pos[0]+","+block.pos[1]+","+block.pos[2]);
        //model.translate(vec3.fromValues(block.pos[0], block.pos[1], block.pos[2]));
        //model.scale(vec3.fromValues(CUBE_SIZE, CUBE_SIZE, 1.0));
        //model.rotate(block.angle, block.axis);
        vbo.draw();
        model.pop();
      });
      this.texture.unbind();
      return results;
    }
  }
})();
