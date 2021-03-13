window.onload = function init() {  
    // Grab the canvas object and initialize it
    var canvas = document.getElementById('gl-canvas'); // assume this element exists 
    gl = WebGLUtils.setupWebGL(canvas);      
  
    // Error checking    
    if (!gl) { alert('WebGL unavailable'); }      
  
    // set our hexagon vertex locations    
    var vertices = [ 
      vec2(0, 0),
      vec2(0, 1),
      vec2(-.75, .5),
      vec2(-.75, -.5),
      vec2(0, -1),
      vec2(.75, -.5),
      vec2(.75, .5),
      vec2(0, 1)
     ];      
  
    // configure WebGL   
    gl.viewport(0, 0, canvas.width, canvas.height);    
    gl.clearColor(1.0, 1.0, 1.0, 1.0);      
  
    // load shaders and initialize attribute buffers    
    var program = initShaders(gl, 'vertex-shader', 'fragment-shader');    
    gl.useProgram(program);      
  
    // load data into GPU  
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // set its position and render it      
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // call render to display    
    render(vertices.length); 
  };    
  
  function render(vertexCount) { 
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, vertexCount );
  }  