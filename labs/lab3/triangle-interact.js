// Global variables we'll need
var gl;
var points;

var x = 0;
var y = 0;
var xLoc, yLoc;

var dirs = [null, null];

// This function executes our WebGL code AFTER the window is loaded.
// Meaning, that we wait for our canvas element to exist.
window.onload = function init() {

  window.addEventListener("keydown",
  (e) => {
      console.log("Keycode: " + e.keyCode)
      if (e.keyCode == 37) {
        dirs[0] = false;
      } else if (e.keyCode == 39) {
        dirs[0] = true;
      } else if (e.keyCode == 38) {
        dirs[1] = true;
      } else if (e.keyCode == 40) {
        dirs[1] = false;
      } else if (e.keyCode == 32) {
        dirs[0] = null;
        dirs[1] = null;
      }
  }, false);

  // Grab the canvas object and initialize it
  var canvas = document.getElementById('gl-canvas');
  gl = WebGLUtils.setupWebGL(canvas);

  // Error checking
  if (!gl) { alert('WebGL unavailable'); }

  // triangle vertices
  var vertices = [
    vec2(-.25, -.25),
    vec2(0, .25),
    vec2(.25, -.25)
  ];

  // configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // load shaders and initialize attribute buffers
  var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  xLoc = gl.getUniformLocation(program, "x");
  yLoc = gl.getUniformLocation(program, "y");

  // load data into GPU
  var bufferID = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  // set its position and render it
  var vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  render();
};

// Render whatever is in our gl variable
function render() {
  if (dirs[0] === true) // move right
    x += 0.01;
  else if (dirs[0] === false) // move left
    x -= 0.01;
  if (dirs[1] === true) // move up
    y += 0.01;
  else if (dirs[1] === false) // move down
    y -= 0.01;


  gl.uniform1f(xLoc, x);
  gl.uniform1f(yLoc, y);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  requestAnimFrame(render);
}