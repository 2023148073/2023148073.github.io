// cube.js (for lamp)
export class Cube {
  constructor(gl, options = {}){
    this.gl = gl;
    // Simple unit cube (indexed)
    this.vertices = new Float32Array([
      // positions
      // front
      -0.5,-0.5, 0.5,  0.5,-0.5, 0.5,  0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
      // back
      -0.5,-0.5,-0.5, -0.5, 0.5,-0.5,  0.5, 0.5,-0.5,  0.5,-0.5,-0.5,
      // left
      -0.5,-0.5,-0.5, -0.5,-0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5,-0.5,
      // right
       0.5,-0.5,-0.5,  0.5, 0.5,-0.5,  0.5, 0.5, 0.5,  0.5,-0.5, 0.5,
      // top
      -0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5,-0.5, -0.5, 0.5,-0.5,
      // bottom
      -0.5,-0.5, 0.5, -0.5,-0.5,-0.5,  0.5,-0.5,-0.5,  0.5,-0.5, 0.5,
    ]);
    // flat normals per face
    const n = [
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      0,0,-1,0,0,-1,0,0,-1,0,0,-1,
      -1,0,0,-1,0,0,-1,0,0,-1,0,0,
      1,0,0,1,0,0,1,0,0,1,0,0,
      0,1,0,0,1,0,0,1,0,0,1,0,
      0,-1,0,0,-1,0,0,-1,0,0,-1,0
    ];
    this.normals = new Float32Array(n);
    this.indices = new Uint16Array([
      0,1,2, 2,3,0, 4,5,6, 6,7,4, 8,9,10, 10,11,8,
      12,13,14, 14,15,12, 16,17,18, 18,19,16, 20,21,22, 22,23,20
    ]);
    this._initBuffers();
  }
  _initBuffers(){
    const gl=this.gl;
    this.vao=gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.vbo=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices.byteLength+this.normals.byteLength, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertices);
    gl.bufferSubData(gl.ARRAY_BUFFER,this.vertices.byteLength,this.normals);
    this.ebo=gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indices,gl.STATIC_DRAW);
    gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,this.vertices.byteLength); gl.enableVertexAttribArray(1);
    gl.bindVertexArray(null);
  }
  draw(shader){
    const gl=this.gl;
    shader.use();
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES,this.indices.length,gl.UNSIGNED_SHORT,0);
    gl.bindVertexArray(null);
  }
}
