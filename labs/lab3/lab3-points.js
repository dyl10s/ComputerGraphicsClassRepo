// globals
var canvas;
var gl;
var program;

var numColors = 8;

var initialSpeed = 0.1;
var speed = initialSpeed;

var maxParticles = 5000;
var initialPointSize = 10;
var pointSize = initialPointSize;

var collisions = {};

var initialParticles = 100;
var numParticles = initialParticles;

var time = 0;
var dt = 1;

var pointsArray = [];
var colorsArray = [];

var cBufferId;
var vBufferId;

var normalized_width = 0.0;
var normalized_height = 0.0;

var paused = false;

var colors = [
    vec4(0.0, 0.0, 0.0, 1.0),
    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(1.0, 0.8, 0.0, 1.0),
    vec4(0.0, 1.0, 0.0, 1.0),
    vec4(0.0, 0.0, 1.0, 1.0),
    vec4(1.0, 0.0, 1.0, 1.0),
    vec4(0.8, 0.8, 0.8, 1.0),
    vec4(0.0, 1.0, 1.0, 1.0),
];

// get random float between min and max
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

// create a particle object, including its color, original color, velocity, and collision information
function particle() {
    var p = {};
    p.cooldown = 10;
    p.collided = false;
    p.color = vec4(0, 0, 0, 1);
    p.ocolor = p.color;
    p.position = vec4(0, 0, 0, 1);
    p.velocity = vec4(0, 0, 0, 0);
    p.cooldown = 10;
    p.collided = false;
    return p;
}

var particles = [];
for (var i = 0; i < maxParticles; i++)
    particles.push(particle());


window.onload = function init() {
    // setup WebGL and canvas
    canvas = document.getElementById('gl-canvas');
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL not available"); }

    // pause
    canvas.addEventListener("mousedown", function (event) {
        paused = !paused;
        document.getElementById('is_paused').innerText = paused;
    });

    document.getElementById('size_slider').value = pointSize;
    document.getElementById('size_slider').onchange = (e) => {
        pointSize = e.target.value;
        normalized_width = pointSize / gl.canvas.width;
        normalized_height = pointSize / gl.canvas.height;
        gl.uniform1f(gl.getUniformLocation(program, 'pointSize'), pointSize);
    };

    document.getElementById('speed_slider').value = speed;
    document.getElementById('speed_slider').onchange = (e) => {
        speed = e.target.value;
    };

    document.getElementById('num_points').innerText = numParticles;
    document.getElementById('numpoints_slider').value = numParticles;
    document.getElementById('numpoints_slider').onchange = function (event) {
        var newParticles = parseInt(event.target.value);

        if (newParticles < numParticles) {
            numParticles = newParticles;
        }
        else {
            for (var i = numParticles; i < newParticles; i++) {
                particles[i].cooldown = 10;
                particles[i].collided = false;

                for (var j = 0; j < 3; j++) {
                    particles[i].position[j] = getRandomArbitrary(-1.0, 1.0);
                    particles[i].velocity[j] = speed * getRandomArbitrary(-1.0, 1.0);
                }
                particles[i].position[3] = 1.0; // w
                particles[i].velocity[2] = 0.0; // z velocity
                // color
                color_index = Math.floor(Math.random() * colors.length);
                particles[i].color = colors[color_index];
                particles[i].ocolor = particles[i].color;
            }
            numParticles = newParticles;
        }


        document.getElementById('num_points').innerText = numParticles;
        setupPoints();
    }


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    normalized_width = pointSize / gl.canvas.width;
    normalized_height = pointSize / gl.canvas.height;
    console.log(normalized_width, normalized_height);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // make the point size variable if we wish
    gl.uniform1f(gl.getUniformLocation(program, 'pointSize'), pointSize);

    // setup our buffers and link to shaders
    cBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxParticles, gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    vBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxParticles, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    setupPoints();
}

// initialize our particles randomly
var setupPoints = function () {

    for (var i = 0; i < numParticles; i++)
        collisions[i] = [];
    for (var i = 0; i < numParticles; i++) {
        for (var j = 0; j < numParticles; j++) {
            if ((i != j) && (!collisions[j].includes(i)))
                collisions[i].push(j);
        }
    }


    for (var i = 0; i < numParticles; i++) {
        particles[i].cooldown = 10;
        particles[i].collided = false;

        // position
        for (var j = 0; j < 3; j++) {
            particles[i].position[j] = getRandomArbitrary(-1.0, 1.0);
            particles[i].velocity[j] = speed * getRandomArbitrary(-1.0, 1.0);
        }
        particles[i].position[3] = 1.0; // w
        particles[i].velocity[2] = 0.0; // z velocity

        // color
        color_index = Math.floor(Math.random() * colors.length);
        particles[i].color = colors[color_index];
        particles[i].ocolor = particles[i].color;
    }

    for (var i = 0; i < numParticles; i++) {
        pointsArray.push(particles[i].position);
        colorsArray.push(particles[i].color);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsArray));

    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(pointsArray));

    render();
}

// update the position of our particle(s) each timestep
var update = function () {
    
    checkCollisions();

    pointsArray = [];
    colorsArray = [];

    for (var i = 0; i < numParticles; i++) {
        // update its position based on a speed/velocity calculation
        particles[i].position = add(particles[i].position, scale(speed * dt, particles[i].velocity));

        if (particles[i].collided) {
            particles[i].cooldown--;
            if (particles[i].cooldown == 0) {
                particles[i].collided = false;
                particles[i].cooldown = 10;
                particles[i].color = particles[i].ocolor;
            }
        }


        // push down each point with an associated color
        pointsArray.push(particles[i].position);
        colorsArray.push(particles[i].color);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsArray));

    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(pointsArray));
}

// render!
var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (!paused)
        update();

    gl.drawArrays(gl.POINTS, 0, numParticles);
    requestAnimFrame(render);
}

var checkCollisions = function () {
    for (let i = 0; i < numParticles; i++) {

        if(document.getElementById('enable_collision').checked ) {
            for (var j = 0; j < collisions[i].length; j++) {
                checkCollision(i, collisions[i][j]);
            }
        }
        

        // right wall
        if (particles[i].position[0] > (1.0 - normalized_width)) {
            particles[i].velocity[0] *= -1.0; // reverse x direction
            particles[i].position[0] = 1.0 - normalized_width;
        }
        // left wall
        if (particles[i].position[0] < (-1.0 + normalized_width)) {
            particles[i].velocity[0] *= -1.0; // reverse x direction
            particles[i].position[0] = -1.0 + normalized_width;
        }
        // bottom wall
        if (particles[i].position[1] < (-1.0 + normalized_height)) {
            particles[i].velocity[1] *= -1.0; // reverse y direction
            particles[i].position[1] = -1.0 + normalized_height;
        }
        // top wall
        if (particles[i].position[1] > (1.0 - normalized_height)) {
            particles[i].velocity[1] *= -1.0; // reverse y direction
            particles[i].position[1] = 1.0 - normalized_height;
        }
    }
}

var checkCollision = function (i, j) {
    a = particles[i];
    b = particles[j];

    // is any vertex in a within b?
    a_xl = a.position[0] - normalized_width;
    a_xr = a.position[0] + normalized_width;

    a_yt = a.position[1] + normalized_height;
    a_yb = a.position[1] - normalized_height;

    b_xl = b.position[0] - normalized_width;
    b_xr = b.position[0] + normalized_width;

    b_yt = b.position[1] + normalized_height;
    b_yb = b.position[1] - normalized_height;

    if (((a_xl > b_xl) && (a_xl < b_xr) && (a_yt < b_yt) && (a_yt > b_yb)) ||
        ((a_xr > b_xl) && (a_xr < b_xr) && (a_yt < b_yt) && (a_yt > b_yb)) ||
        ((a_xl > b_xl) && (a_xl < b_xr) && (a_yb < b_yt) && (a_yb > b_yb)) ||
        ((a_xr > b_xl) && (a_xr < b_xr) && (a_yb < b_yt) && (a_yb > b_yb))
    ) {
        if (!a.collided) {
            a.color = vec4(1.0, 0.0, 1.0, 1.0);
            a.collided = true;
        }
        if (!b.collided) {
            b.color = vec4(1.0, 0.0, 1.0, 1.0);
            b.collided = true;
        }
    }
}
