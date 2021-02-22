"use strict";

var canvas;
var gl;
var speed = 100000;

var points = [];

var vertices = [
    vec2( -1, -1 ),
    vec2(  0,  1 ),
    vec2(  1, -1 )
];

var vertexVelocity = [
    vec2(getRandom(), getRandom()),
    vec2(getRandom(), getRandom()),
    vec2(getRandom(), getRandom()),
]

var numTimesToSubdivide = 0;

function getRandom() {
    if(Math.random() > .5) {
        return getRandomNegative();
    }else{
        return getRandomPositive();
    }
}

function getRandomNegative() {
    return -((Math.random() * 1000) / speed) - .002;
}

function getRandomPositive() {
    return ((Math.random() * 1000) / speed) + .002;
}

function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    for(let i = 0; i < vertices.length; i++) {
        for(let v = 0; v < 2; v++) {
            vertices[i][v] += vertexVelocity[i][v];

            if(vertices[i][v] > 1 || vertices[i][v] < -1) {
                if(vertexVelocity[i][v] < 0) {
                    vertexVelocity[i][v] = getRandomPositive();
                }else{
                    vertexVelocity[i][v] = getRandomNegative();
                }

                if (vertices[i][v] < -1) {
                    vertices[i][v] = -1;
                }else{
                    vertices[i][v] = 1;
                }
            }
        }
    }

    // First, initialize the corners of our gasket with three points.
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    numTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 50000, gl.STATIC_DRAW );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

        document.getElementById("slider").onchange = function(event) {
        numTimesToSubdivide = parseInt(event.target.value);
    };


    render();
};

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }
}

window.onload = init;

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    points = [];
    requestAnimFrame(init);
}
