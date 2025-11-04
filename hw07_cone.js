/* 
  HW07 (Cone): Arcball + Flat/Smooth + Phong/Gouraud
  Keys: a(arcball toggle), r(reset), f(flat), s(smooth), g(gouraud), p(phong)
  - camera(0,0,3), light(1,0.7,1), lamp scale(0.1,0.1,0.1)
  - overlay line #2, #3만 모드에 따라 가변
*/
import { resizeAspectRatio, setupText, updateText } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';
import { Arcball } from '../util/arcball.js';
import { Cube } from '../util/cube.js';
import { Cone } from './cone.js';

const cvs = document.getElementById('glCanvas');
const gl = cvs.getContext('webgl2');
if (!gl) { alert('WebGL2 not supported'); throw new Error('no webgl2'); }

// 1) 캔버스 기본 크기
cvs.width = 700; cvs.height = 700;
resizeAspectRatio(gl, cvs);
gl.viewport(0,0,cvs.width,cvs.height);
gl.clearColor(0.08,0.08,0.1,1.0);
gl.enable(gl.DEPTH_TEST);

// 상태값 (약간 다른 변수명으로 구성)
let arcMode   = 'CAMERA';   // CAMERA / MODEL
let shadeMode = 'SMOOTH';   // FLAT / SMOOTH
let renderMode= 'PHONG';    // PHONG / GOURAUD

// 고정 파라미터
const eyePos   = vec3.fromValues(0,0,3);
const lightPos = vec3.fromValues(1.0,0.7,1.0);
const lampSize = vec3.fromValues(0.1,0.1,0.1);

// 지오메트리
const cone = new Cone(gl, 32, { color: [0.92, 0.62, 0.38, 1.0] });
const lamp = new Cube(gl, { color: [1,1,1,1] });

// Arcball
const ab = new Arcball(cvs, 3.0, { rotation: 1.0, zoom: 0.001 });

// 텍스트 오버레이 (2,3줄만 업데이트)
setupText(cvs, 'HW07 – Cone Lighting', 1);
const overlayLine2 = setupText(cvs, '', 2);
const overlayLine3 = setupText(cvs, '', 3);
const setOverlay = () => {
  updateText(overlayLine2, `arcball: ${arcMode}`);
  updateText(overlayLine3, `shading=${shadeMode} | render=${renderMode}`);
};
setOverlay();

// 셰이더 로딩
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
  requestAnimationFrame(loop);
}).catch((e)=>{ console.error(e); alert('Shader load failed'); });

// 투영
const P = mat4.create();
mat4.perspective(P, Math.PI/3, cvs.width/cvs.height, 0.1, 100.0);

function viewMat(){
  return (arcMode==='CAMERA') ? ab.getViewMatrix() : ab.getViewCamDistanceMatrix();
}
function modelMat(){
  const M = mat4.create();
  if (arcMode==='MODEL') mat4.multiply(M,M,ab.getModelRotMatrix());
  return M;
}

// 입력
window.addEventListener('keydown', (ev)=>{
  switch(ev.key){
    case 'a': case 'A':
      arcMode = (arcMode==='CAMERA'?'MODEL':'CAMERA'); setOverlay(); break;
    case 'r': case 'R':
      ab.reset(); break;
    case 'f': case 'F':
      shadeMode='FLAT';
      cone.copyFaceNormalsToNormals?.(); 
      cone.updateNormals?.();
      setOverlay(); break;
    case 's': case 'S':
      shadeMode='SMOOTH';
      cone.copyVertexNormalsToNormals?.(); 
      cone.updateNormals?.();
      setOverlay(); break;
    case 'g': case 'G':
      renderMode='GOURAUD'; setOverlay(); break;
    case 'p': case 'P':
      renderMode='PHONG'; setOverlay(); break;
  }
});

function drawCone(shader){
  shader.use();
  const V = viewMat();
  const M = modelMat();
  shader.setMat4('u_model', M);
  shader.setMat4('u_view', V);
  shader.setMat4('u_projection', P);
  shader.setVec3('u_lightPos',  lightPos);
  shader.setVec3('u_cameraPos', eyePos);
  shader.setVec3('u_lightColor', [1,1,1]);
  shader.setVec3('u_objectColor', [0.92,0.62,0.38]);
  cone.draw(shader);
}

function drawLamp(){
  progLamp.use();
  const V = viewMat();
  const M = mat4.create();
  mat4.translate(M,M,lightPos);
  mat4.scale(M,M,lampSize);
  progLamp.setMat4('u_model', M);
  progLamp.setMat4('u_view', V);
  progLamp.setMat4('u_projection', P);
  lamp.draw(progLamp);
}

function loop(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (progPhong && progGouraud && progLamp){
    (renderMode==='PHONG'? drawCone(progPhong) : drawCone(progGouraud));
    drawLamp();
  }
  requestAnimationFrame(loop);
}
