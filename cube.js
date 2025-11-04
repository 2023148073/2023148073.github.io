export class Cube {
  constructor(gl, options = {}) {
    this.gl = gl;
    this.vao = gl.createVertexArray();
    this.vbo = gl.createBuffer();
    this.ebo = gl.createBuffer();

    this.vertices = new Float32Array([
      0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,  -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,
      0.5,  0.5,  0.5,   0.5, -0.5,  0.5,   0.5, -0.5, -0.5,   0.5,  0.5, -0.5,
      0.5,  0.5,  0.5,   0.5,  0.5, -0.5,  -0.5,  0.5, -0.5,  -0.5,  0.5,  0.5,
     -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5,  -0.5, -0.5, -0.5,  -0.5, -0.5,  0.5,
     -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5, -0.5,  0.5,  -0.5, -0.5,  0.5,
      0.5, -0.5, -0.5,  -0.5, -0.5, -0.5,  -0.5,  0.5, -0.5,   0.5,  0.5, -0.5
    ]);
    this.normals = new Float32Array([
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      1,0,0, 1,0,0, 1,0,0, 1,0,0,
      0,1,0, 0,1,0, 0,1,0, 0,1,0,
     -1,0,0,-1,0,0,-1,0,0,-1,0,0,
      0,-1,0,0,-1,0,0,-1,0,0,-1,0,
      0,0,-1,0,0,-1,0,0,-1,0,0,-1
    ]);
    this.colors = new Float32Array(24*4);
    const c = options.color || [1,1,1,1];
    for (let i=0;i<24;i++){ this.colors.set(c, i*4); }
    this.texCoords = new Float32Array(24*2);
    this.indices = new Uint16Array([
      0,1,2, 2,3,0, 4,5,6, 6,7,4, 8,9,10, 10,11,8,
      12,13,14, 14,15,12, 16,17,18, 18,19,16, 20,21,22, 22,23,20
    ]);
    this.vertexNormals = this.normals.slice();
    this.faceNormals = this.normals.slice();
    this.initBuffers();
  }
  copyVertexNormalsToNormals(){ this.normals.set(this.vertexNormals); }
  copyFaceNormalsToNormals(){ this.normals.set(this.faceNormals); }
  initBuffers(){
    const gl = this.gl;
    const vSize = this.vertices.byteLength;
    const nSize = this.normals.byteLength;
    const cSize = this.colors.byteLength;
    const tSize = this.texCoords.byteLength;
    const total = vSize+nSize+cSize+tSize;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, total, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
    gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
    gl.bufferSubData(gl.ARRAY_BUFFER, vSize+nSize, this.colors);
    gl.bufferSubData(gl.ARRAY_BUFFER, vSize+nSize+cSize, this.texCoords);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
    gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,vSize);
    gl.vertexAttribPointer(2,4,gl.FLOAT,false,0,vSize+nSize);
    gl.vertexAttribPointer(3,2,gl.FLOAT,false,0,vSize+nSize+cSize);
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);
    gl.enableVertexAttribArray(3);
    gl.bindVertexArray(null);
  }
  updateNormals(){
    const gl = this.gl; const vSize = this.vertices.byteLength;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
    gl.bindVertexArray(null);
  }
  draw(shader){
    const gl=this.gl; shader.use();
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }
}
