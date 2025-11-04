// Provided cone mesh (open base), radius=0.5, height=1 (y in [-0.5,0.5])
// Attribute layout: 0 pos, 1 normal, 2 color, 3 texCoord
export class Cone {
    constructor(gl, segments = 32, options = {}) {
        this.gl = gl;
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        const radius = 0.5;
        const halfH = 0.5;
        this.segments = segments;
        const dtheta = (2.0 * Math.PI) / segments;

        const pos=[], nrm=[], col=[], uv=[], idx=[];
        const col4 = options.color || [0.8,0.8,0.8,1.0];

        const tip = [0, halfH, 0];

        for (let i=0;i<segments;i++){
            const a0=i*dtheta, a1=(i+1)*dtheta;
            const x0=radius*Math.cos(a0), z0=radius*Math.sin(a0);
            const x1=radius*Math.cos(a1), z1=radius*Math.sin(a1);

            // pos (CCW): top -> bot0 -> bot1
            pos.push(tip[0],tip[1],tip[2],  x0,-halfH,z0,  x1,-halfH,z1);

            // face normal (flat)
            const v1=[x0-tip[0], -halfH-tip[1], z0-tip[2]];
            const v2=[x1-tip[0], -halfH-tip[1], z1-tip[2]];
            let nx = v2[1]*v1[2] - v2[2]*v1[1];
            let ny = v2[2]*v1[0] - v2[0]*v1[2];
            let nz = v2[0]*v1[1] - v2[1]*v1[0];
            const L=Math.hypot(nx,ny,nz); if (L>0){nx/=L;ny/=L;nz/=L;}
            for(let k=0;k<3;k++) nrm.push(nx,ny,nz);

            for(let k=0;k<3;k++) col.push(col4[0],col4[1],col4[2],col4[3]);

            const u0=i/segments, u1=(i+1)/segments;
            uv.push((u0+u1)*0.5,1,  u0,0,  u1,0);

            const base=i*3; idx.push(base,base+1,base+2);
        }

        this.vertices=new Float32Array(pos);
        this.normals =new Float32Array(nrm);
        this.colors  =new Float32Array(col);
        this.texCoords=new Float32Array(uv);
        this.indices=new Uint16Array(idx);

        this.faceNormals=new Float32Array(this.normals);
        this.vertexNormals=new Float32Array(this.normals);
        this.computeVertexNormals();
        this.initBuffers();
    }

    computeVertexNormals(){
        const count=this.vertices.length/3;
        this.vertexNormals=new Float32Array(this.vertices.length);
        for(let i=0;i<count;i++){
            const x=this.vertices[i*3+0];
            const y=this.vertices[i*3+1];
            const z=this.vertices[i*3+2];
            if (Math.abs(y-0.5)<1e-3){
                this.vertexNormals[i*3+0]=0;
                this.vertexNormals[i*3+1]=0.83;
                this.vertexNormals[i*3+2]=0;
            }else{
                const len=Math.hypot(x,0,z)||1.0;
                this.vertexNormals[i*3+0]=x/len;
                this.vertexNormals[i*3+1]=0.0;
                this.vertexNormals[i*3+2]=z/len;
            }
        }
    }
    copyFaceNormalsToNormals(){ this.normals.set(this.faceNormals); }
    copyVertexNormalsToNormals(){ this.normals.set(this.vertexNormals); }

    initBuffers(){
        const gl=this.gl;
        const vSize=this.vertices.byteLength;
        const nSize=this.normals.byteLength;
        const cSize=this.colors.byteLength;
        const tSize=this.texCoords.byteLength;
        const total=vSize+nSize+cSize+tSize;

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER,total,gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER,vSize,this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER,vSize+nSize,this.colors);
        gl.bufferSubData(gl.ARRAY_BUFFER,vSize+nSize+cSize,this.texCoords);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indices,gl.STATIC_DRAW);

        gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
        gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,vSize);
        gl.vertexAttribPointer(2,4,gl.FLOAT,false,0,vSize+nSize);
        gl.vertexAttribPointer(3,2,gl.FLOAT,false,0,vSize+nSize+cSize);
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
    }
    updateNormals(){
        const gl=this.gl;
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vbo);
        const vSize=this.vertices.byteLength;
        gl.bufferSubData(gl.ARRAY_BUFFER,vSize,this.normals);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindVertexArray(null);
    }
    draw(shader){
        const gl=this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES,this.indices.length,gl.UNSIGNED_SHORT,0);
        gl.bindVertexArray(null);
    }
    delete(){
        const gl=this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
}
