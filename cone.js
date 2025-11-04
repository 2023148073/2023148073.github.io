// cone.js
// Cone: radius=0.5, height=1.0, base y=-0.5, apex y=+0.5, no bottom cap, segments=32
export class Cone {
  constructor(gl, segments=32, options={}){
    this.gl = gl;
    this.segments = Math.max(3, segments|0);
    this.color = options.color || [0.92,0.62,0.38,1.0];
    this._build();
  }
  _build(){
    const n = this.segments;
    const r = 0.5;
    const y0 = -0.5; // base
    const y1 =  0.5; // apex
    const verts = [];
    const normsFlat = [];
    const indices = [];
    // Build side faces (triangles fan-like but as separate quads to allow flat normals)
    for(let i=0;i<n;i++){
      const a = (i   /n)*Math.PI*2;
      const b = ((i+1)/n)*Math.PI*2;
      const x0 = r*Math.cos(a), z0 = r*Math.sin(a);
      const x1 = r*Math.cos(b), z1 = r*Math.sin(b);
      // triangle (apex, v1, v0)
      verts.push( 0,y1,0,   x1,y0,z1,  x0,y0,z0 );
      // flat normal for the face
      const v0=[0,y1,0], v1=[x1,y0,z1], v2=[x0,y0,z0];
      const e1=[v1[0]-v0[0],v1[1]-v0[1],v1[2]-v0[2]];
      const e2=[v2[0]-v0[0],v2[1]-v0[1],v2[2]-v0[2]];
      const fn=[ e1[1]*e2[2]-e1[2]*e2[1], e1[2]*e2[0]-e1[0]*e2[2], e1[0]*e2[1]-e1[1]*e2[0] ];
      const fl = Math.hypot(fn[0],fn[1],fn[2])||1; fn[0]/=fl; fn[1]/=fl; fn[2]/=fl;
      normsFlat.push(...fn, ...fn, ...fn);
      const base = i*3;
      indices.push(base, base+1, base+2);
    }
    this.vertices = new Float32Array(verts);
    this.faceNormals = new Float32Array(normsFlat);
    this.indices = new Uint16Array(indices);

    // For smooth normals: compute per-vertex normals (share base ring, apex unique)
    const vcount = this.vertices.length/3;
    const smooth = new Float32Array(this.vertices.length);
    // initialize
    for(let i=0;i<vcount;i++){ smooth[i*3+0]=0; smooth[i*3+1]=0; smooth[i*3+2]=0; }
    for(let f=0; f<this.indices.length; f+=3){
      const ia=this.indices[f], ib=this.indices[f+1], ic=this.indices[f+2];
      const ax=this.vertices[ia*3], ay=this.vertices[ia*3+1], az=this.vertices[ia*3+2];
      const bx=this.vertices[ib*3], by=this.vertices[ib*3+1], bz=this.vertices[ib*3+2];
      const cx=this.vertices[ic*3], cy=this.vertices[ic*3+1], cz=this.vertices[ic*3+2];
      const ux=bx-ax, uy=by-ay, uz=bz-az;
      const vx=cx-ax, vy=cy-ay, vz=cz-az;
      const nx = uy*vz - uz*vy;
      const ny = uz*vx - ux*vz;
      const nz = ux*vy - uy*vx;
      smooth[ia*3]+=nx; smooth[ia*3+1]+=ny; smooth[ia*3+2]+=nz;
      smooth[ib*3]+=nx; smooth[ib*3+1]+=ny; smooth[ib*3+2]+=nz;
      smooth[ic*3]+=nx; smooth[ic*3+1]+=ny; smooth[ic*3+2]+=nz;
    }
    // normalize
    for(let i=0;i<vcount;i++){
      const nx=smooth[i*3], ny=smooth[i*3+1], nz=smooth[i*3+2];
      const l=Math.hypot(nx,ny,nz)||1; smooth[i*3]=nx/l; smooth[i*3+1]=ny/l; smooth[i*3+2]=nz/l;
    }
    this.vertexNormals = smooth;
    this.normals = new Float32Array(this.faceNormals); // default to flat

    this._initBuffers();
  }

  copyVertexNormalsToNormals(){ this.normals.set(this.vertexNormals); }
  copyFaceNormalsToNormals(){ this.normals.set(this.faceNormals); }

  _initBuffers(){
    const gl=this.gl;
    this.vao=gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.vbo=gl.createBuffer();
    const vSize=this.vertices.byteLength, nSize=this.normals.byteLength;
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vSize+nSize, gl.DYNAMIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertices);
    gl.bufferSubData(gl.ARRAY_BUFFER,vSize,this.normals);
    this.ebo=gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indices,gl.STATIC_DRAW);
    gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,vSize); gl.enableVertexAttribArray(1);
    gl.bindVertexArray(null);
    this._vSize=vSize;
  }

  updateNormals(){
    const gl=this.gl;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vbo);
    gl.bufferSubData(gl.ARRAY_BUFFER,this._vSize,this.normals);
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
