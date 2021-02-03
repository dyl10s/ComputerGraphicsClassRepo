var gl;
var points = [];
var baseColors = [
  vec4(1.0, 1.0, 0.0),
  vec4(0.0, 0.0, 1.0),
];
var colors = [baseColors[0], baseColors[0], baseColors[0], baseColors[1], baseColors[1], baseColors[1]];

window.onload = function init() {
  // Setup our canvas and WebGL
  var canvas = document.getElementById('gl-canvas');
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert('WebGL unavailable'); }

  // Triangle vertices
  var vertices = [
    vec2(-1, -1),
    vec2(0, 1),
    vec2(1, -1),

    vec2(-1, 0.5),
    vec2(-0.5, 1),
    vec2(0, 0.5),
  ];

  // configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // load and initialize shaders
  var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  // load data into GPU
  var bufferID = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
 
  // set position and render
  var vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // draw colors
  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  render(vertices.length);

};


function render(vertexCount) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}