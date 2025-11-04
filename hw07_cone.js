/* 
  HW07 (Cone): Arcball + Flat/Smooth + Phong/Gouraud
  Keys: a(arcball toggle), r(reset), f(flat), s(smooth), g(gouraud), p(phong)
*/
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
gl.clearColor(0.08,0.08,0.1,1.0);
gl.enable(gl.DEPTH_TEST);

let arcBallMode = 'CAMERA';   // CAMERA / MODEL
let shadingMode = 'SMOOTH';   // FLAT / SMOOTH
let renderingMode = 'PHONG';  // PHONG / GOURAUD

const cameraPos = vec3.fromValues(0,0,3);
const lightPos  = vec3.fromValues(1.0,0.7,1.0);
const lightSize = vec3.fromValues(0.1,0.1,0.1);

const cone = new Cone(gl, 32, { color: [0.92, 0.62, 0.38, 1.0] });
const lamp = new Cube(gl, { color: [1,1,1,1] });

const arcball = new Arcball(canvas, 3.0, { rotation: 2.0, zoom: 0.0005 });

setupText(canvas, 'HW07 – Cone Lighting', 1);
const overlay2 = setupText(canvas, '', 2);
const overlay3 = setupText(canvas, '', 3);
const syncOverlay = () => {
  updateText(overlay2, `arcball mode: ${arcBallMode}`);
  updateText(overlay3, `shading mode: ${shadingMode} | rendering: ${renderingMode}`);
};
syncOverlay();

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

  const P = mat4.create();
  mat4.perspective(P, Math.PI/3, canvas.width/canvas.height, 0.1, 100.0);

  function setupCommonFor(program) {
    program.use();
    program.setMat4('u_projection', P);
    program.setVec3('light.position', lightPos);
    program.setVec3('light.ambient',  [0.2, 0.2, 0.2]);
    program.setVec3('light.diffuse',  [0.7, 0.7, 0.7]);
    program.setVec3('light.specular', [1.0, 1.0, 1.0]);
    program.setVec3('material.diffuse',  [0.92, 0.62, 0.38]);
    program.setVec3('material.specular', [0.5, 0.5, 0.5]);
    program.setFloat('material.shininess', 32.0);
  }
  setupCommonFor(progPhong);
  setupCommonFor(progGouraud);

  progLamp.use();
  progLamp.setMat4('u_projection', P);

  window.addEventListener('keydown', (ev)=>{
    switch(ev.key){
      case 'a': case 'A':
        arcBallMode = (arcBallMode==='CAMERA') ? 'MODEL' : 'CAMERA';
        syncOverlay(); break;
      case 'r': case 'R':
        arcball.reset(); 
        syncOverlay(); break;
      case 'f': case 'F':
        shadingMode='FLAT';
        cone.copyFaceNormalsToNormals();
        cone.updateNormals();
        syncOverlay(); break;
      case 's': case 'S':
        shadingMode='SMOOTH';
        cone.copyVertexNormalsToNormals();
        cone.updateNormals();
        syncOverlay(); break;
      case 'g': case 'G':
        renderingMode='GOURAUD';
        syncOverlay(); break;
      case 'p': case 'P':
        renderingMode='PHONG';
        syncOverlay(); break;
    }
  });

  const viewFromCamera = ()=> arcball.getViewMatrix();
  const viewForModel   = ()=> arcball.getViewCamDistanceMatrix();
  const modelFromArc   = ()=> arcball.getModelRotMatrix();

  function getViewModel() {
    if (arcBallMode==='CAMERA') {
      return { V: viewFromCamera(), M: mat4.create() };
    } else {
      return { V: viewForModel(), M: modelFromArc() };
    }
  }

  function drawConeWith(program){
    program.use();
    const {V,M} = getViewModel();
    program.setMat4('u_view', V);
    program.setMat4('u_model', M);
    program.setVec3('u_viewPos', cameraPos);
    cone.draw(program);
  }

  function drawLamp(){
    progLamp.use();
    const {V} = getViewModel();
    const ML = mat4.create();
    mat4.translate(ML, ML, lightPos);
    mat4.scale(ML, ML, lightSize);
    progLamp.setMat4('u_view', V);
    progLamp.setMat4('u_model', ML);
    lamp.draw(progLamp);
  }

  function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (renderingMode==='PHONG')  drawConeWith(progPhong);
    else                          drawConeWith(progGouraud);
    drawLamp();
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}).catch((e)=>{
  console.error(e);
  alert('Shader load failed (경로/파일명/문법 확인)');
});
