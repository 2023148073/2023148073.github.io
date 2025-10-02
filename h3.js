const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");
let program;
let mode = "circle";
let circle = null;
let linePoints = [];
let intersectionPoints = [];

function toNDC(x, y) {
  return [(x / canvas.width) * 2 - 1, -((y / canvas.height) * 2 - 1)];
}

async function initShaders() {
  const shaderSrc = await fetch("h3.shader").then(r => r.text());
  const [vertSrc, fragSrc] = shaderSrc.split("// FRAGMENT_SHADER");
  const vertShader = createShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  program = createProgram(gl, vertShader, fragShader);
  gl.useProgram(program);
}

function createShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

function createProgram(gl, v, f) {
  const p = gl.createProgram();
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  return p;
}

function drawPoints(points, color) {
  const posLoc = gl.getAttribLocation(program, "a_Position");
  const colLoc = gl.getUniformLocation(program, "u_Color");
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(posLoc);
  gl.uniform4fv(colLoc, color);
  gl.drawArrays(gl.POINTS, 0, points.length / 2);
}

function drawLine(points, color) {
  const posLoc = gl.getAttribLocation(program, "a_Position");
  const colLoc = gl.getUniformLocation(program, "u_Color");
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(posLoc);
  gl.uniform4fv(colLoc, color);
  gl.drawArrays(gl.LINES, 0, points.length / 2);
}

function drawCircle(c, color) {
  const posLoc = gl.getAttribLocation(program, "a_Position");
  const colLoc = gl.getUniformLocation(program, "u_Color");
  let vertices = [];
  for (let i = 0; i <= 100; i++) {
    const t = (i / 100) * 2 * Math.PI;
    vertices.push(c.cx + c.r * Math.cos(t));
    vertices.push(c.cy + c.r * Math.sin(t));
  }
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(posLoc);
  gl.uniform4fv(colLoc, color);
  gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 2);
}

function computeIntersection(cx, cy, r, x1, y1, x2, y2) {
  let dx = x2 - x1, dy = y2 - y1, fx = x1 - cx, fy = y1 - cy;
  let a = dx*dx + dy*dy;
  let b = 2*(fx*dx + fy*dy);
  let c = (fx*fx + fy*fy) - r*r;
  let d = b*b - 4*a*c;
  let pts = [];
  if (d >= 0) {
    d = Math.sqrt(d);
    let t1 = (-b - d) / (2*a);
    let t2 = (-b + d) / (2*a);
    if (t1 >= 0 && t1 <= 1) pts.push([x1 + t1*dx, y1 + t1*dy]);
    if (t2 >= 0 && t2 <= 1) pts.push([x1 + t2*dx, y1 + t2*dy]);
  }
  return pts;
}

function render() {
  gl.clearColor(1,1,1,1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (circle) drawCircle(circle, [0,0,0,1]);
  if (linePoints.length === 2) drawLine([linePoints[0][0], linePoints[0][1], linePoints[1][0], linePoints[1][1]], [0,0,1,1]);
  for (let p of intersectionPoints) drawPoints(p, [1,0,0,1]);
  let info = `Circle: ${circle ? `center=(${circle.cx.toFixed(2)},${circle.cy.toFixed(2)}), r=${circle.r.toFixed(2)}` : "입력 대기"}<br>`;
  info += `Line: ${linePoints.length===2 ? `(${linePoints[0][0].toFixed(2)},${linePoints[0][1].toFixed(2)}) ~ (${linePoints[1][0].toFixed(2)},${linePoints[1][1].toFixed(2)})` : "입력 대기"}<br>`;
  info += `Intersection: ${intersectionPoints.length} ${JSON.stringify(intersectionPoints.map(p=>p.map(v=>v.toFixed(2))))}`;
  document.getElementById("info").innerHTML = info;
}

let isDragging = false;
let startPos = null;

canvas.addEventListener("mousedown", e => {
  if (mode === "circle") {
    isDragging = true;
    startPos = toNDC(e.offsetX, e.offsetY);
  }
});
canvas.addEventListener("mousemove", e => {
  if (mode === "circle" && isDragging) {
    let cur = toNDC(e.offsetX, e.offsetY);
    let dx = cur[0] - startPos[0];
    let dy = cur[1] - startPos[1];
    let r = Math.sqrt(dx*dx + dy*dy);
    circle = {cx:startPos[0], cy:startPos[1], r:r};
    render();
  }
});
canvas.addEventListener("mouseup", e => {
  if (mode === "circle" && isDragging) {
    isDragging = false;
    mode = "line";
  }
  else if (mode === "line") {
    let p = toNDC(e.offsetX, e.offsetY);
    linePoints.push(p);
    if (linePoints.length === 2) {
      intersectionPoints = computeIntersection(circle.cx,circle.cy,circle.r, linePoints[0][0],linePoints[0][1], linePoints[1][0],linePoints[1][1]);
    }
    render();
  }
});

(async function main(){
  await initShaders();
  render();
})();
