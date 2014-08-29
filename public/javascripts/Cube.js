(function(){
  CUBE_INDEXES = [0, 1, 2, 0, 2, 3];

  CUBE_VERTICES = {
    near: {
      positions: [[-1.0, -1.0, 1.0], [1.0, -1.0, 1.0], [1.0, 1.0, 1.0], [-1.0, 1.0, 1.0]],
      normal: [0, 0, 1],
      texcoords: [[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]]
    },
    far: {
      positions: [[-1.0, -1.0, -1.0], [-1.0, 1.0, -1.0], [1.0, 1.0, -1.0], [1.0, -1.0, -1.0]],
      normal: [0, 0, -1],
      texcoords: [[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]]
    },
    top: {
      positions: [[-1.0, 1.0, -1.0], [-1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [1.0, 1.0, -1.0]],
      normal: [0, 1, 0],
      texcoords: [[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]]
    },
    bottom: {
      positions: [[-1.0, -1.0, -1.0], [1.0, -1.0, -1.0], [1.0, -1.0, 1.0], [-1.0, -1.0, 1.0]],
      normal: [0, -1, 0],
      texcoords: [[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]]
    },
    right: {
      positions: [[1.0, -1.0, -1.0], [1.0, 1.0, -1.0], [1.0, 1.0, 1.0], [1.0, -1.0, 1.0]],
      normal: [1, 0, 0],
      texcoords: [[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]]
    },
    left: {
      positions: [[-1.0, -1.0, -1.0], [-1.0, -1.0, 1.0], [-1.0, 1.0, 1.0], [-1.0, 1.0, -1.0]],
      normal: [-1, 0, 0],
      texcoords: [[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]]
    }
  };

  CUBE_DEFAULT_SZ = 1.0;

  this.Cube = function(options){
    if ( !(this instanceof arguments.callee) ) return new arguments.callee(options);
    
    this.vertexCount = 0;
    this.positions = [];
    this.normals = [];
    this.texcoords = [];
    this.indexes = [];

    this.drawMode = options.drawMode || "TRIANGLES";

  }

  Cube.prototype = {
    addSide: function(side, x, y, z, size, texture, textureOffsetX, textureOffsetY, textureFacX, textureFacY) {
      if(!size) size = CUBE_DEFAULT_SZ;
      if(!textureOffsetX) textureOffsetX = 0.0;
      if(!textureOffsetY) textureOffsetY = 0.0;
      if(!textureFacX) textureFacX = 1.0;
      if(!textureFacY) textureFacY = 1.0;

      var halfSize = size / 2.0,
          side = CUBE_VERTICES[side],
          normal = side.normal, nx = normal[0], ny = normal[1], nz = normal[2],
          idx, pos, tex,
          cx, cy, cz,
          facX = texture.width / texture.storedWidth,
          facY = texture.height / texture.storedHeight,
          offX = (texture.offsetX * texture.storedWidth) + textureOffsetX,
          offY = (texture.offsetY * texture.storedHeight) + textureOffsetY;

      for (var i = 0; i < CUBE_INDEXES.length; i++) {
        idx = CUBE_INDEXES[i];
        pos = side.positions[idx]; 
        cx = pos[0], cy = pos[1], cz = pos[2],
        tex = side.texcoords[idx];

        this.positions.push(x + (cx * halfSize));
        this.positions.push(y + (cy * halfSize));
        this.positions.push(z + (cz * halfSize));
        this.normals.push(nx, ny, nz);       

        this.texcoords.push(tex[0] * facX * textureFacX + offX);
        this.texcoords.push(tex[1] * facY * textureFacY + offY);
      }

      this.vertexCount += 6;
    },

    addSideRotate: function(side, x, y, z, size, axis, angle, texture, textureOffsetX, textureOffsetY, textureFacX, textureFacY) {
      if(!size) size = CUBE_DEFAULT_SZ;
      if(!textureOffsetX) textureOffsetX = 0.0;
      if(!textureOffsetY) textureOffsetY = 0.0;
      if(!textureFacX) textureFacX = 1.0;
      if(!textureFacY) textureFacY = 1.0;

      var halfSize = size / 2.0,
          side = CUBE_VERTICES[side],
          normal = side.normal, nx = normal[0], ny = normal[1], nz = normal[2],
          idx, pos, tex,
          cx, cy, cz,
          facX = texture.width / texture.storedWidth,
          facY = texture.height / texture.storedHeight,
          offX = (texture.offsetX  / texture.storedWidth) + textureOffsetX,
          offY = (texture.offsetY / texture.storedHeight) + textureOffsetY,
          q = quat.setAxisAngle(quat.create(), axis, angle),
          mat, v, n;      

      n = vec3.fromValues(-nx, -ny, -nz);
      mat = mat4.fromQuat(mat4.create(), q);
      mat4.translate(mat, mat, n);

      for (var i = 0; i < CUBE_INDEXES.length; i++) {
        idx = CUBE_INDEXES[i];
        pos = side.positions[idx]; 
        cx = pos[0], cy = pos[1], cz = pos[2],
        tex = side.texcoords[idx];

        v = vec3.fromValues(cx, cy, cz);
        vec3.transformMat4(v, v, mat);

        this.positions.push(x + (v[0] * halfSize));
        this.positions.push(y + (v[1] * halfSize));
        this.positions.push(z + (v[2] * halfSize));
        this.normals.push(nx, ny, nz);       

        this.texcoords.push(tex[0]*facX*textureFacX + offX);
        this.texcoords.push(tex[1]*facY*textureFacY + offY);
      }

      this.vertexCount += 6;
    },

    makeVBO: function(engine) {
      var vbo = VBO({
        engine: engine, 
        drawMode: this.drawMode,
        size: this.vertexCount
      });

      vbo.addBuffer('aVertexPosition', 3, this.positions);
      vbo.addBuffer('aVertexNormal', 3, this.normals);
      vbo.addBuffer('aTextureCoord', 2, this.texcoords);
      
      vbo.upload();

      return vbo;
    },

    addAllSides: function(x, y, z, size, texture, textureOffsetX, textureOffsetY, textureFacX, textureFacY){
      if(!size) size = CUBE_DEFAULT_SZ;
      this.addSide("left", x, y, z, size, texture, textureOffsetX, textureOffsetY, textureFacX, textureFacY);
      this.addSide("right", x, y, z, size, texture, textureOffsetX, textureOffsetY, textureFacX, textureFacY);
      this.addSide("bottom", x, y, z, size,  texture, textureOffsetX, textureOffsetY, textureFacX, textureFacY);
      this.addSide("top", x, y, z, size, texture, textureOffsetX, textureOffsetY, textureFacX, textureFacY);
      this.addSide("far", x, y, z, size, texture, textureOffsetX, textureOffsetY, textureFacX, textureFacY);
      this.addSide("near", x, y, z, size, texture, textureOffsetX, textureOffsetY, textureFacX, textureFacY);
    }

  }
})();