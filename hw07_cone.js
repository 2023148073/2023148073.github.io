/* HW07 Cone with Arcball + Flat/Smooth + Phong/Gouraud */
import { resizeAspectRatio, setupText, updateText } from './util.js';
import { Shader, readShaderFile } from './shader.js';
import { Arcball } from './arcball.js';
import { Cube } from './cube.js';
import { Cone } from './cone.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
if (!gl) { alert('WebGL2 not supported'); throw new Error('no webgl2'); }

canvas.width = 700; canvas.height = 700;
resizeAspectRatio(gl, canvas);
gl.viewport(0,0,canvas.width,canvas.height);
gl.clearColor(0.1,0.1,0.1,1.0);
gl.enable(gl.DEPTH_TEST);

// modes
let arcMode='MODEL';  // default MODEL like screenshot
let shadeMode='FLAT'; // default FLAT like screenshot
let renderMode='PHONG';

// camera/light
const cameraPos = vec3.fromValues(0,0,3);
const lightPos  = vec3.fromValues(1.0,0.7,1.0);
const lightSize = vec3.fromValues(0.1,0.1,0.1);

// objects
const cone = new Cone(gl, 32, {color:[0.92,0.62,0.38,1.0]});
const lamp = new Cube(gl);

// arcball
const arcball = new Arcball(canvas, 5.0, { rotation: 2.0, zoom: 0.0005 });

// text overlay (strictly 1~9 lines, updating only 2,3)
setupText(canvas, "Cone with Lighting", 1);
const t2 = setupText(canvas, "", 2);
const t3 = setupText(canvas, "", 3);
setupText(canvas, "press 'a' to change arcball mode", 4);
setupText(canvas, "press 'r' to reset arcball", 5);
setupText(canvas, "press 's' to switch to smooth shading", 6);
setupText(canvas, "press 'f' to switch to flat shading", 7);
setupText(canvas, "press 'g' to switch to Gouraud shading", 8);
setupText(canvas, "press 'p' to switch to Phong shading", 9);
function refreshOverlay(){
  updateText(t2, `arcball mode: ${arcMode}`);
  updateText(t3, `shading mode: ${shadeMode} (${renderMode})`);
}
refreshOverlay();

// projection (fixed)
const P = mat4.create();
mat4.perspective(P, glMatrix.toRadian(60), canvas.width/canvas.height, 0.1, 100.0);

// helpers
function getViewMat(){
  if (arcMode==='CAMERA') return arcball.getViewMatrix();
  else { return arcball.getViewCamDistanceMatrix(); }
}
function getModelMat(){
  const M = mat4.create();
  if (arcMode==='MODEL'){
    const R = arcball.getModelRotMatrix();
    mat4.multiply(M, M, R);
  }
  return M;
}

// input
window.addEventListener('keydown', (e)=>{
  switch(e.key){
    case 'a': case 'A':
      arcMode = (arcMode==='CAMERA'?'MODEL':'CAMERA'); refreshOverlay(); break;
    case 'r': case 'R':
      arcball.reset(); break;
    case 's': case 'S':
      shadeMode='SMOOTH'; cone.copyVertexNormalsToNormals(); cone.updateNormals(); refreshOverlay(); break;
    case 'f': case 'F':
      shadeMode='FLAT'; cone.copyFaceNormalsToNormals(); cone.updateNormals(); refreshOverlay(); break;
    case 'g': case 'G':
      renderMode='GOURAUD'; refreshOverlay(); break;
    case 'p': case 'P':
      renderMode='PHONG'; refreshOverlay(); break;
  }
});

// shaders
let progPhong, progGouraud, progLamp;
Promise.all([
  readShaderFile('./shVert.glsl'),
  readShaderFile('./shFrag.glsl'),
  readShaderFile('./shGouraudVert.glsl'),
  readShaderFile('./shGouraudFrag.glsl'),
  readShaderFile('./shLampVert.glsl'),
  readShaderFile('./shLampFrag.glsl'),
]).then(([vsP,fsP,vsG,fsG,vsL,fsL])=>{
  progPhong   = new Shader(gl, vsP, fsP);
  progGouraud = new Shader(gl, vsG, fsG);
  progLamp    = new Shader(gl, vsL, fsL);
  requestAnimationFrame(render);
}).catch(err=>{ console.error(err); alert('Shader load failed'); });

function drawCone(shader){
  shader.use();
  const V = getViewMat(); const M = getModelMat();
  shader.setMat4('u_model', M);
  shader.setMat4('u_view', V);
  shader.setMat4('u_projection', P);
  shader.setVec3('u_lightPos', lightPos);
  shader.setVec3('u_cameraPos', cameraPos);
  shader.setVec3('u_lightColor', [1,1,1]);
  shader.setVec3('u_objectColor', [0.92,0.62,0.38]);
  cone.draw(shader);
}
function drawLamp(){
  progLamp.use();
  const V = getViewMat();
  const M = mat4.create(); mat4.translate(M,M,lightPos); mat4.scale(M,M,lightSize);
  progLamp.setMat4('u_model', M);
  progLamp.setMat4('u_view', V);
  progLamp.setMat4('u_projection', P);
  lamp.draw(progLamp);
}

function render(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (renderMode==='PHONG') drawCone(progPhong); else drawCone(progGouraud);
  drawLamp();
  requestAnimationFrame(render);
}
