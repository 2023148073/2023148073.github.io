export class Cone {
  constructor(gl, segments = 32, options = {}) {
    this.gl = gl;
    this.segments = Math.max(3, segments);
    this.color = options.color || [0.92, 0.62, 0.38, 1.0];

    this.vao = gl.createVertexArray();
    this.vbo = gl.createBuffer();
    this.ebo = gl.createBuffer();

    const r = 0.5, yBase = -0.5, yApex = 0.5;
    const positions = [], normals_face = [], normals_smooth = [], colors = [], tex = [], indices = [];

    const k = r / 1.0; // r/h
    const normalForAngle = (phi) => {
      const nx = Math.cos(phi), nz = Math.sin(phi), ny = k;
      const len = Math.hypot(nx, ny, nz) || 1.0;
      return [nx/len, ny/len, nz/len];
    };

    for (let i=0;i<this.segments;i++){
      const a0 = (i    / this.segments) * Math.PI * 2.0;
      const a1 = ((i+1)/ this.segments) * Math.PI * 2.0;
      const x0 = r*Math.cos(a0), z0 = r*Math.sin(a0);
      const x1 = r*Math.cos(a1), z1 = r*Math.sin(a1);
      const vA = [0, yApex, 0], v0 = [x0, yBase, z0], v1 = [x1, yBase, z1];
      const base = positions.length/3;
      positions.push(...vA, ...v0, ...v1);

      // Flat normal
      const U = [v0[0]-vA[0], v0[1]-vA[1], v0[2]-vA[2]];
      const V = [v1[0]-vA[0], v1[1]-vA[1], v1[2]-vA[2]];
      const fn = [U[1]*V[2]-U[2]*V[1], U[2]*V[0]-U[0]*V[2], U[0]*V[1]-U[1]*V[0]];
      const fl = Math.hypot(fn[0],fn[1],fn[2])||1.0;
      const f = [fn[0]/fl, fn[1]/fl, fn[2]/fl];
      normals_face.push(...f, ...f, ...f);

      // Smooth normal
      const amid = (a0+a1)*0.5;
      normals_smooth.push(...normalForAngle(amid), ...normalForAngle(a0), ...normalForAngle(a1));

      colors.push(...this.color, ...this.color, ...this.color);
      indices.push(base, base+1, base+2);
    }

    this.vertices = new Float32Array(positions);
    this.faceNormals = new Float32Array(normals_face);
    this.vertexNormals = new Float32Array(normals_smooth);
    this.normals = new Float32Array(this.vertexNormals);
    this.colors = new Float32Array(colors);
    this.texCoords = new Float32Array((positions.length/3)*2);
    this.indices = new Uint16Array(indices);

    this.initBuffers();
  }
  copyVertexNormalsToNormals(){ this.normals.set(this.vertexNormals); }
  copyFaceNormalsToNormals(){ this.normals.set(this.faceNormals); }
  initBuffers(){
    const gl=this.gl;
    const vSize=this.vertices.byteLength, nSize=this.normals.byteLength, cSize=this.colors.byteLength, tSize=this.texCoords.byteLength;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vSize+nSize+cSize+tSize, gl.STATIC_DRAW);
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
    const gl=this.gl; const vSize = this.vertices.byteLength;
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
