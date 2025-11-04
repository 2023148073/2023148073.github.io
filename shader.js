export async function readShaderFile(filePath) {
  const response = await fetch(filePath);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.text();
}
export class Shader {
  constructor(gl, vertexSource, fragmentSource) {
    this.gl = gl;
    this.program = this.initShader(vertexSource, fragmentSource);
    if (!this.program) throw new Error('Failed to initialize shader program');
  }
  initShader(vertexSource, fragmentSource) {
    const gl = this.gl;
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vertexSource); gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(vs)); return null; }
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fragmentSource); gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(fs)); return null; }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); return null; }
    gl.deleteShader(vs); gl.deleteShader(fs);
    return prog;
  }
  use(){ this.gl.useProgram(this.program); }
  setFloat(name, x){ this.gl.uniform1f(this.gl.getUniformLocation(this.program, name), x); }
  setVec3(name, v){ if (Array.isArray(v)) this.gl.uniform3f(this.gl.getUniformLocation(this.program, name), v[0], v[1], v[2]); else this.gl.uniform3fv(this.gl.getUniformLocation(this.program, name), v); }
  setMat4(name, m){ this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, name), false, m); }
}
