// shader.js
export async function readShaderFile(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`fail to fetch ${path}: `+res.status);
  return await res.text();
}

export class Shader {
  constructor(gl, vs, fs) {
    this.gl = gl;
    const v = this._compile(gl.VERTEX_SHADER, vs);
    const f = this._compile(gl.FRAGMENT_SHADER, fs);
    const p = gl.createProgram();
    gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error('link error: '+gl.getProgramInfoLog(p));
    }
    gl.deleteShader(v); gl.deleteShader(f);
    this.program = p;
  }
  _compile(type, src) {
    const gl = this.gl;
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error('compile error: '+gl.getShaderInfoLog(s)+'\n'+src);
    }
    return s;
  }
  use(){ this.gl.useProgram(this.program); }
  setMat4(name, m){ this.gl.uniformMatrix4fv(this._loc(name), false, m); }
  setVec3(name, v){ 
    if (Array.isArray(v)) this.gl.uniform3fv(this._loc(name), new Float32Array(v));
    else this.gl.uniform3fv(this._loc(name), v);
  }
  setFloat(name, x){ this.gl.uniform1f(this._loc(name), x); }
  _loc(n){ return this.gl.getUniformLocation(this.program, n); }
}
