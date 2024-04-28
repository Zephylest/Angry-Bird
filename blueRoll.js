var GL;

class MyObject {
    canvas = null;
    vertex = [];
    faces = [];


    SHADER_PROGRAM = null;
    _color = null;
    _position = null;


    _MMatrix = LIBS.get_I4();
    _PMatrix = LIBS.get_I4();
    _VMatrix = LIBS.get_I4();
    _greyScality = 0;


    TRIANGLE_VERTEX = null;
    TRIANGLE_FACES = null;


    MODEL_MATRIX = LIBS.get_I4();


    child = []


    constructor(vertex, faces, source_shader_vertex, source_shader_fragment) {
        this.vertex = vertex;
        this.faces = faces;


        var compile_shader = function (source, type, typeString) {
            var shader = GL.createShader(type);
            GL.shaderSource(shader, source);
            GL.compileShader(shader);
            if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
                alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
                return false;
            }
            return shader;
        };

        var shader_vertex = compile_shader(source_shader_vertex, GL.VERTEX_SHADER, "VERTEX");

        var shader_fragment = compile_shader(source_shader_fragment, GL.FRAGMENT_SHADER, "FRAGMENT");

        this.SHADER_PROGRAM = GL.createProgram();
        GL.attachShader(this.SHADER_PROGRAM, shader_vertex);
        GL.attachShader(this.SHADER_PROGRAM, shader_fragment);

        GL.linkProgram(this.SHADER_PROGRAM);


        //vao
        this._color = GL.getAttribLocation(this.SHADER_PROGRAM, "color");
        this._position = GL.getAttribLocation(this.SHADER_PROGRAM, "position");


        //uniform
        this._PMatrix = GL.getUniformLocation(this.SHADER_PROGRAM, "PMatrix"); //projection
        this._VMatrix = GL.getUniformLocation(this.SHADER_PROGRAM, "VMatrix"); //View
        this._MMatrix = GL.getUniformLocation(this.SHADER_PROGRAM, "MMatrix"); //Model
        this._greyScality = GL.getUniformLocation(this.SHADER_PROGRAM, "greyScality");//GreyScality



        GL.enableVertexAttribArray(this._color);
        GL.enableVertexAttribArray(this._position);
        GL.useProgram(this.SHADER_PROGRAM);




        this.TRIANGLE_VERTEX = GL.createBuffer();
        this.TRIANGLE_FACES = GL.createBuffer();

    }


    setup() {
        GL.bindBuffer(GL.ARRAY_BUFFER, this.TRIANGLE_VERTEX);
        GL.bufferData(GL.ARRAY_BUFFER,
            new Float32Array(this.vertex),
            GL.STATIC_DRAW);


        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.TRIANGLE_FACES);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.faces),
            GL.STATIC_DRAW);


        this.child.forEach(obj => {
            obj.setup();
        });
    }


    render(VIEW_MATRIX, PROJECTION_MATRIX) {
        GL.useProgram(this.SHADER_PROGRAM);
        GL.bindBuffer(GL.ARRAY_BUFFER, this.TRIANGLE_VERTEX);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.TRIANGLE_FACES);
        GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(this._color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.uniformMatrix4fv(this._PMatrix, false, PROJECTION_MATRIX);
        GL.uniformMatrix4fv(this._VMatrix, false, VIEW_MATRIX);
        GL.uniformMatrix4fv(this._MMatrix, false, this.MODEL_MATRIX);
        GL.uniform1f(this._greyScality, 1);

        GL.drawElements(GL.TRIANGLES, this.faces.length, GL.UNSIGNED_SHORT, 0);


        GL.flush();


        this.child.forEach(obj => {
            obj.render(VIEW_MATRIX, PROJECTION_MATRIX);
        });
    }
}
// Richard Kamitono C14220267
function generateEllipsoid(xrad, yrad, zrad, step, stack, red, green, blue, xtrans, ytrans, ztrans) {
    var vertices = [];
    var faces = [];
    for (var i = 0; i <= stack; i++) {
        for (var j = 0; j <= step; j++) {
            var u = i * 1.0 / stack * Math.PI - (Math.PI / 2);
            var v = j * 1.0 / step * 2 * Math.PI - Math.PI;

            var x = Math.cos(v) * Math.cos(u) * xrad;
            var y = Math.cos(v) * Math.sin(u) * yrad;
            var z = Math.sin(v) * zrad;

            x += xtrans;
            y += ytrans;
            z += ztrans;

            vertices.push(x, y, z, red, green, blue);
        }
    }
    for (var i = 0; i <= stack; i++) {
        for (var j = 0; j < step; j++) {
            var a = i * step + j;
            var b = a + 1;
            var c = a + step;
            var d = a + step + 1;
            faces.push(a, b, d, a, d, c);
        }
    }
    return { "vertices": vertices, "faces": faces };
}
function generateHalfEllipsoid(xrad, yrad, zrad, step, stack, red, green, blue, xtrans, ytrans, ztrans, xrotate, yrotate, zrotate) {
    var vertices = [];
    var faces = [];
    for (var i = 0; i <= stack / 2; i++) {
        for (var j = 0; j <= step; j++) {
            var u = i * 1.0 / (stack / 2) * Math.PI; 
            var v = j * 1.0 / step * 2 * Math.PI - Math.PI;

            var x = Math.cos(v) * Math.cos(u) * xrad;
            var y = Math.sin(u) * yrad;
            var z = Math.sin(v) * Math.cos(u) * zrad;

            // Apply rotation around x-axis
            var newX = x;
            var newY = y * Math.cos(xrotate) - z * Math.sin(xrotate);
            var newZ = y * Math.sin(xrotate) + z * Math.cos(xrotate);

            x = newX;
            y = newY;
            z = newZ;

            // Apply rotation around y-axis
            newX = x * Math.cos(yrotate) + z * Math.sin(yrotate);
            newY = y;
            newZ = -x * Math.sin(yrotate) + z * Math.cos(yrotate);

            x = newX;
            y = newY;
            z = newZ;

            // Apply rotation around z-axis
            var newX = x * Math.cos(zrotate) - y * Math.sin(zrotate);
            var newY = x * Math.sin(zrotate) + y * Math.cos(zrotate);
            var newZ = z;

            x = newX;
            y = newY;
            z = newZ;

            // Apply translation
            x += xtrans;
            y += ytrans;
            z += ztrans;

            vertices.push(x, y, z, red, green, blue);
            // console.log(x + " " + y + " " + z);
        }
    }
    for (var i = 0; i < stack / 2; i++) {
        for (var j = 0; j < step; j++) {
            var a = i * (step + 1) + j;
            var b = a + 1;
            var c = a + (step + 1);
            var d = c + 1;
            faces.push(a, b, d, a, d, c);
        }
    }
    return { "vertices": vertices, "faces": faces };
}
function generateBSplineCustom(controlPoint, m, degree, z1, z2, red, green, blue) {
    var curves = [];
    var knotVector = []
    var n = controlPoint.length / 2;

    // Calculate the knot values based on the degree and number of control points
    for (var i = 0; i < n + degree + 1; i++) {
        if (i < degree + 1) {
            knotVector.push(0);
        } else if (i >= n) {
            knotVector.push(n - degree);
        } else {
            knotVector.push(i - degree);
        }
    }
    var basisFunc = function (i, j, t) {
        if (j == 0) {
            if (knotVector[i] <= t && t < (knotVector[(i + 1)])) {
                return 1;
            } else {
                return 0;
            }
        }
        var den1 = knotVector[i + j] - knotVector[i];
        var den2 = knotVector[i + j + 1] - knotVector[i + 1];
        var term1 = 0;
        var term2 = 0;

        if (den1 != 0 && !isNaN(den1)) {
            term1 = ((t - knotVector[i]) / den1) * basisFunc(i, j - 1, t);
        }
        if (den2 != 0 && !isNaN(den2)) {
            term2 = ((knotVector[i + j + 1] - t) / den2) * basisFunc(i + 1, j - 1, t);
        }
        return term1 + term2;
    }
    for (var t = 0; t < m; t++) {
        var x = 0;
        var y = 0;

        var u = (t / m * (knotVector[controlPoint.length / 2] - knotVector[degree])) + knotVector[degree];

        //C(t)
        for (var key = 0; key < n; key++) {

            var C = basisFunc(key, degree, u);
            // console.log(C);
            x += (controlPoint[key * 2] * C);
            y += (controlPoint[key * 2 + 1] * C);
            // console.log(t + " " + degree + " " + x + " " + y + " " + C);
        }
        // Apply rotation around z-axis
        var angle = Math.PI / 9 * 3;
        var newX = x * Math.cos(angle) - y * Math.sin(angle);
        var newY = x * Math.sin(angle) + y * Math.cos(angle);

        x = newX;
        y = newY;

        x += 1.1;
        y += 0.2;

        curves.push(x);
        curves.push(y);
        curves.push(z1);
        curves.push(red);
        curves.push(green);
        curves.push(blue);

        curves.push(x);
        curves.push(y);
        curves.push(z2);
        curves.push(red);
        curves.push(green);
        curves.push(blue);
    }
    for (var t = 0; t < m; t++) {
        var x = 0;
        var y = 0;

        var u = (t / m * (knotVector[controlPoint.length / 2] - knotVector[degree])) + knotVector[degree];

        //C(t)
        for (var key = 0; key < n; key++) {

            var C = basisFunc(key, degree, u);
            // console.log(C);
            x += (controlPoint[key * 2] * C);
            y += (controlPoint[key * 2 + 1] * C);
            // console.log(t + " " + degree + " " + x + " " + y + " " + C);
        }
        // Apply rotation around z-axis
        var angle = Math.PI / 9 * 3;
        var newX = x * Math.cos(angle) - y * Math.sin(angle);
        var newY = x * Math.sin(angle) + y * Math.cos(angle);

        x = newX;
        y = newY;

        x += 1.1;
        y += 0.2;

        x *= -1;
        curves.push(x);
        curves.push(y);
        curves.push(z1);
        curves.push(red);
        curves.push(green);
        curves.push(blue);

        curves.push(x);
        curves.push(y);
        curves.push(z2);
        curves.push(red);
        curves.push(green);
        curves.push(blue);
    }
    // console.log(curves);
    return curves;
}
function generateEyebrow(red, green, blue){
    var z1 = 0.9;
    var z2 = 0.5; 

    var eyebrow = [ 
        0.046875, 0.43673469387755104,
        0.0390625, 0.46122448979591835,
        0.04296875, 0.5102040816326531,
        0.08984375, 0.5265306122448979,
        0.12109375, 0.5020408163265306,
        0.15234375, 0.43673469387755104,
        0.171875, 0.39591836734693875,
        0.18359375, 0.3224489795918367,
        0.1640625, 0.30612244897959184,
        0.13671875, 0.363265306122449,
        0.109375, 0.39591836734693875,
        0.0703125, 0.4122448979591836,
        0.046875, 0.42040816326530617
    ];
    var vertices = generateBSplineCustom(eyebrow, 100, 3, z1, z2, red, green, blue);

    // console.log(vertices.length);
    var faces = [];
    var size = vertices.length / 24;
    for (var i = 0; i < size - 1; i++){
        var a = i;
        var b = a + 1;
        var c = a + (size);
        var d = c + 1;
        // console.log(a + " " + b + " " + c + " " + d);
        faces.push(a, b, d, a, d, c);
    }
    for (var i = 1; i < size - 1; i++) {
        a = 0;
        b = i;
        c = i + 1;
        // console.log(a + " " + b + " " + c );
        faces.push(a, b, c);
    }

    for (var i = size * 2; i < size * 2 + size - 1; i++) {
        var a = i;
        var b = a + 1;
        var c = a + (size);
        var d = c + 1;
        // console.log(a + " " + b + " " + c + " " + d);
        faces.push(a, b, d, a, d, c);
    }
    for (var i = size * 2 + 1; i < size * 2 + size - 1; i++) {
        a = size * 2;
        b = i;
        c = i + 1;
        // console.log(a + " " + b + " " + c);
        faces.push(a, b, c);
    }
    return { "vertices": vertices, "faces": faces };
} 
function generateRightEar(step, stack) {
    var vertices = [];
    var faces = [];

    var halfRaw1 = generateHalfEllipsoid(0.2, 0.15, 0.22, step, stack, 0.43, 0.89, 0.28, 0.2, 1.2, 0.5, -Math.PI / 2, 0, -Math.PI / 9 * 1);
    var halfRaw2 = generateHalfEllipsoid(0.103, 0.08, 0.117, step, stack, 0.23, 0.62, 0.1, 0.2, 1.2, 0.5, -Math.PI / 2, 0, -Math.PI / 9 * 1);

    vertices = vertices.concat(halfRaw1['vertices'], halfRaw2['vertices']);
    // console.log(vertices.length);
    for (var i = 0; i < stack / 2; i++) {
        for (var j = 0; j < step; j++) {
            var a = i * (step + 1) + j;
            var b = a + 1;
            var c = a + (step + 1);
            var d = c + 1;
            // console.log(a + " " + b + " " + c + " " + d);
            faces.push(a, b, d, a, d, c);
        }
    }
    // console.log(halfRaw1['vertices'].length);

    for (var i = 0; i < stack / 2; i++) {
        for (var j = 0; j < step; j++) {
            var a = i * (step + 1) + j + (halfRaw1['vertices'].length / 6);
            var b = a + 1;
            var c = a + (step + 1);
            var d = c + 1;
            // console.log(a + " " + b + " " + c + " " + d);
            faces.push(a, b, d, a, d, c);
        }
    }


    return { "vertices": vertices, "faces": faces };
}
function generateLeftEar(step, stack) {
    var vertices = [];
    var faces = [];

    var halfRaw1 = generateHalfEllipsoid(0.2, 0.15, 0.22, step, stack, 0.43, 0.89, 0.28, -0.6, 1.1, 0.5, -Math.PI / 2, 0, Math.PI / 9 * 1.8);
    var halfRaw2 = generateHalfEllipsoid(0.103, 0.08, 0.117, step, stack, 0.23, 0.62, 0.1, -0.6, 1.1, 0.5, -Math.PI / 2, 0, Math.PI / 9 * 1.8);

    vertices = vertices.concat(halfRaw1['vertices'], halfRaw2['vertices']);
    // console.log(vertices.length);
    for (var i = 0; i < stack / 2; i++) {
        for (var j = 0; j < step; j++) {
            var a = i * (step + 1) + j;
            var b = a + 1;
            var c = a + (step + 1);
            var d = c + 1;
            // console.log(a + " " + b + " " + c + " " + d);
            faces.push(a, b, d, a, d, c);
        }
    }
    // console.log(halfRaw1['vertices'].length);

    for (var i = 0; i < stack / 2; i++) {
        for (var j = 0; j < step; j++) {
            var a = i * (step + 1) + j + (halfRaw1['vertices'].length / 6);
            var b = a + 1;
            var c = a + (step + 1);
            var d = c + 1;
            // console.log(a + " " + b + " " + c + " " + d);
            faces.push(a, b, d, a, d, c);
        }
    }


    return { "vertices": vertices, "faces": faces };
}
function generateRightEye(step, stack){
    // 285 300
    var vertices = [];
    var faces = [];
  
    
    var whitePartRaw = generateEllipsoid(0.285, 0.3, 0.2, step, stack, 1, 1, 1, 0.75, 0.035, 0.95);
    var blackPartRaw = generateEllipsoid(0.07, 0.07, 0.07, step, stack, 0, 0, 0, 0.85, 0, 1.12);


    vertices = vertices.concat(whitePartRaw['vertices'], blackPartRaw['vertices']);

    // console.log(whitePartRaw['vertices'].length);
    for (var i = 0; i <= stack; i++) {
        for (var j = 0; j < step; j++) {
            var a = i * step + j;
            var b = a + 1;
            var c = a + step;
            var d = a + step + 1;
            // console.log(a + " " + b + " " + c + " " + d);
            faces.push(a, b, d, a, d, c);
        }
    }
    for (var i = 0; i <= stack; i++) {
        for (var j = 0; j < step; j++) {
            var a = i * step + j + (whitePartRaw['vertices'].length / 6) + 1; 
            var b = a + 1;
            var c = a + step;
            var d = a + step + 1;
            // console.log(a + " " + b + " " + c + " " + d);
            faces.push(a, b, d, a, d, c);
        }
    }

    return { "vertices": vertices, "faces": faces };
}
function generateLeftEye(step, stack) {
    // 285 300
    var vertices = [];
    var faces = [];
    var whitePartRaw = generateEllipsoid(0.285, 0.3, 0.2, step, stack, 1, 1, 1, -0.8, -0.035, 0.95);
    var blackPartRaw = generateEllipsoid(0.07, 0.07, 0.07, step, stack, 0, 0, 0, -0.75, 0, 1.12);


    vertices = vertices.concat(whitePartRaw['vertices'], blackPartRaw['vertices']);
    
    for (var i = 0; i <= stack; i++) {
        for (var j = 0; j < step; j++) {
            var a = i * step + j;
            var b = a + 1;
            var c = a + step;
            var d = a + step + 1;
            // console.log(a + " " + b + " " + c + " " + d);
            faces.push(a, b, d, a, d, c);
        }
    }
    for (var i = 0; i <= stack; i++) {
        for (var j = 0; j < step; j++) {
            var a = i * step + j + (whitePartRaw['vertices'].length / 6) + 1;
            var b = a + 1;
            var c = a + step;
            var d = a + step + 1;
            // console.log(a + " " + b + " " + c + " " + d);
            faces.push(a, b, d, a, d, c);
        }
    }

    return { "vertices": vertices, "faces": faces };
}
function generateNose(step) {
    var vertices = [];
    var faces = [];
    
    // Vertices
    for (var i = 0; i <= step; i++) {
        var x = 0.63 * Math.cos((i / step) * 2 * Math.PI - Math.PI);
        var y = 0.53 * Math.sin((i / step) * 2 * Math.PI - Math.PI);
        var z = 1.5;
        vertices.push(x, y, z, 0.65, 0.91, 0);
    }
    for (var i = 0; i <= step; i++) {
        var x = 0.55 * Math.cos((i / step) * 2 * Math.PI - Math.PI);
        var y = 0.45 * Math.sin((i / step) * 2 * Math.PI - Math.PI);
        var z = 1.35;
        vertices.push(x, y, z, 0.65, 0.91, 0);
    }
    for (var i = 0; i <= step; i++) {
        var x = 0.47 * Math.cos((i / step) * 2 * Math.PI - Math.PI);
        var y = 0.37 * Math.sin((i / step) * 2 * Math.PI - Math.PI);
        var z = 1.2;
        vertices.push(x, y, z, 0.65, 0.91, 0);
    }
    for (var i = 0; i <= step; i++) {
        var x = 0.40 * Math.cos((i / step) * 2 * Math.PI - Math.PI);
        var y = 0.30 * Math.sin((i / step) * 2 * Math.PI - Math.PI);
        var z = 1;
        vertices.push(x, y, z, 0.65, 0.91, 0);
    }

    // 130 190 Black part left
    for (var i = 0; i <= step; i++) {
        var x = 0.13 * Math.cos((i / step) * 2 * Math.PI - Math.PI);
        var y = 0.19 * Math.sin((i / step) * 2 * Math.PI - Math.PI);
        var z = 1.5001;

        x-= 0.23;
        vertices.push(x, y, z, 0.08, 0.22, 0.06);
    }
    for (var i = 0; i <= step; i++) {
        var x = 0.13 * Math.cos((i / step) * 2 * Math.PI - Math.PI);
        var y = 0.19 * Math.sin((i / step) * 2 * Math.PI - Math.PI);
        var z = 1;
        x -= 0.23;
        vertices.push(x, y, z, 0.08, 0.22, 0.06);
    }

    
    // 135 160 Black part right
    for (var i = 0; i <= step; i++) {
        var x = 0.135 * Math.cos((i / step) * 2 * Math.PI - Math.PI);
        var y = 0.16 * Math.sin((i / step) * 2 * Math.PI - Math.PI);
        var z = 1.5001;

        x += 0.23;
        vertices.push(x, y, z, 0.08, 0.22, 0.06);
    }
    for (var i = 0; i <= step; i++) {
        var x = 0.135 * Math.cos((i / step) * 2 * Math.PI - Math.PI);
        var y = 0.16 * Math.sin((i / step) * 2 * Math.PI - Math.PI);
        var z = 1;
        x += 0.23;
        vertices.push(x, y, z, 0.08, 0.22, 0.06);
    }

    // Faces

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < step; j++) {
            var a = i * (step + 1) + j;
            var b = a + 1;
            var c = a + step + 1;
            var d = c + 1;
            // console.log(a + " " + b + " " + c + " " + d);
            faces.push(a, b, d, a, d, c);
        }
    }
    for (var i = 1; i < step ; i++){
        a = 0;
        b = i;
        c = i + 1;
        // console.log(a + " " + b + " " + c );
        faces.push(a,b,c);
    }

    // Black Part Left
    for (var j = 0; j < step; j++) {
        var a = 4 * (step + 1) + j;
        var b = a + 1;
        var c = a + step + 1;
        var d = c + 1;
        // console.log(a + " " + b + " " + c + " " + d);
        faces.push(a, b, d, a, d, c);
    }
    for (var i = 4 * (step + 1) + 1; i < step + 4 * (step + 1) + 1; i++) {
        a = 4 * (step + 1);
        b = i;
        c = i + 1;
        // console.log(a + " " + b + " " + c );
        faces.push(a, b, c);
    }

    // Black Part Right
    for (var j = 0; j < step; j++) {
        var a = 6 * (step + 1) + j;
        var b = a + 1;
        var c = a + step + 1;
        var d = c + 1;
        // console.log(a + " " + b + " " + c + " " + d);
        faces.push(a, b, d, a, d, c);
    }
    for (var i = 6 * (step + 1) + 1; i < step + 6 * (step + 1) + 1; i++) {
        a = 6 * (step + 1);
        b = i;
        c = i + 1;
        // console.log(a + " " + b + " " + c );
        faces.push(a, b, c);
    }

    return { "vertices": vertices, "faces": faces };
}

// Kiko 
function generateConeVertices(offsetX, offsetY, offsetZ, radius, stacks, slices, colorX, colorY, colorZ) {
    var vertices = [];
    var PI = Math.PI;

    for (var i = 0; i <= stacks; ++i) {
        var theta = i * PI / stacks;
        var sinTheta = Math.cos(theta);
        var cosTheta = Math.cos(theta);

        for (var j = 0; j <= slices; ++j) {
            var phi = j * 2 * PI / slices;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = (cosPhi * sinTheta);
            var y = (cosTheta);
            var z = (sinPhi * sinTheta);

            vertices.push((radius * x)+offsetX, (radius * y)+offsetY, (radius * z)+offsetZ);
            vertices.push(colorX,colorY,colorZ);
        }
    }

    return vertices;
}

function generateSphereVertices(offsetX, offsetY, offsetZ, radius, stacks, slices, colorX, colorY, colorZ) {
    var vertices = [];
    var PI = Math.PI;

    for (var i = 0; i <= stacks; ++i) {
        var theta = i * PI / stacks;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var j = 0; j <= slices; ++j) {
            var phi = j * 2 * PI / slices;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = (cosPhi * sinTheta);
            var y = cosTheta;
            var z = (sinPhi * sinTheta);

            vertices.push(offsetX + (radius * x), offsetY + (radius * y), offsetZ + (radius * z));
            vertices.push(colorX, colorY, colorZ);
        }
    }

    return vertices;
}

function generateEllipticParaboloidVertices(offsetX, offsetY, offsetZ, radius, stacks, slices, a, b, c, colorX, colorY, colorZ) {
    var vertices = [];
    var PI = Math.PI;

    for (var i = 0; i <= stacks; ++i) {
        var u = i / stacks;

        for (var j = 0; j <= slices; ++j) {
            var v = j * 2 * Math.PI / slices;

            var x = (a * u * Math.cos(v)) + offsetX;
            var y = (b * u * Math.sin(v)) + offsetY;
            var z = (c * u * u) + offsetZ;

            vertices.push(radius * x, radius * y, radius * z);
            vertices.push(colorX, colorY, colorZ);
        }
    }

    return vertices;
}

function generateCurvedTube(offsetX, offsetY, offsetZ, radius, tubeRadius, segments, angleDegrees, colorX, colorY, colorZ) {
    const vertices = [];
    const angleRadians = (angleDegrees * Math.PI) / 180;
    const deltaTheta = angleRadians / segments; // Angle between each segment along the curve
    const deltaPhi = (2 * Math.PI) / segments; // Angle between points in the tube's cross-section

    // Loop through each segment of the curve
    for (let i = 0; i <= segments; i++) {
        const theta = deltaTheta * i;
        const x = radius * Math.sin(theta); // x-coordinate of the center of the tube segment
        const z = radius * (1 - Math.cos(theta)); // z-coordinate of the center of the tube segment

        // Loop through each segment of the cross-section
        for (let j = 0; j <= segments; j++) {
            const phi = deltaPhi * j;
            const cosPhi = Math.cos(phi);
            const sinPhi = Math.sin(phi);

            // Calculate the vertex position
            const vz = (x + tubeRadius * cosPhi) + offsetZ;
            const vx = (tubeRadius * sinPhi) + offsetX;
            const vy = z + offsetY;

            // Push the vertex to the list
            vertices.push(vx, vy, vz);
            vertices.push(colorX, colorY, colorZ)
        }
    }

    return vertices;
}

function createBoxVertices(offsetX, offsetY, offsetZ, width, height, depth, angleY, colorX, colorY, colorZ) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfDepth = depth / 2;

    // Calculate sine and cosine of the rotation angle
    const sinAngleY = Math.sin(angleY);
    const cosAngleY = Math.cos(angleY);

    // Define the vertices of the box
    const vertices = [
        // Front face
        -halfWidth + offsetX, -halfHeight + offsetY, halfDepth + offsetZ, colorX, colorY, colorZ,
        halfWidth + offsetX, -halfHeight + offsetY, halfDepth + offsetZ, colorX, colorY, colorZ,
        halfWidth + offsetX, halfHeight + offsetY, halfDepth + offsetZ, colorX, colorY, colorZ,
        -halfWidth + offsetX, halfHeight + offsetY, halfDepth + offsetZ, colorX, colorY, colorZ,
        // Back face
        -halfWidth + offsetX, -halfHeight + offsetY, -halfDepth + offsetZ, colorX, colorY, colorZ,
        -halfWidth + offsetX, halfHeight + offsetY, -halfDepth + offsetZ, colorX, colorY, colorZ,
        halfWidth + offsetX, halfHeight + offsetY, -halfDepth + offsetZ, colorX, colorY, colorZ,
        halfWidth + offsetX, -halfHeight + offsetY, -halfDepth + offsetZ, colorX, colorY, colorZ,
        // Top face
        -halfWidth + offsetX, halfHeight + offsetY, -halfDepth + offsetZ, colorX, colorY, colorZ,
        -halfWidth + offsetX, halfHeight + offsetY, halfDepth + offsetZ, colorX, colorY, colorZ,
        halfWidth + offsetX, halfHeight + offsetY, halfDepth + offsetZ, colorX, colorY, colorZ,
        halfWidth + offsetX, halfHeight + offsetY, -halfDepth + offsetZ, colorX, colorY, colorZ,
        // Bottom face
        -halfWidth + offsetX, -halfHeight + offsetY, -halfDepth + offsetZ, colorX, colorY, colorZ,
        halfWidth + offsetX, -halfHeight + offsetY, -halfDepth + offsetZ, colorX, colorY, colorZ,
        halfWidth + offsetX, -halfHeight + offsetY, halfDepth + offsetZ, colorX, colorY, colorZ,
        -halfWidth + offsetX, -halfHeight + offsetY, halfDepth + offsetZ, colorX, colorY, colorZ,
        // Right face
        halfWidth + offsetX, -halfHeight + offsetY, -halfDepth + offsetZ, colorX, colorY, colorZ,
        halfWidth + offsetX, halfHeight + offsetY, -halfDepth + offsetZ, colorX, colorY, colorZ,
        halfWidth + offsetX, halfHeight + offsetY, halfDepth + offsetZ, colorX, colorY, colorZ,
        halfWidth + offsetX, -halfHeight + offsetY, halfDepth + offsetZ, colorX, colorY, colorZ,
        // Left face
        -halfWidth + offsetX, -halfHeight + offsetY, -halfDepth + offsetZ, colorX, colorY, colorZ,
        -halfWidth + offsetX, -halfHeight + offsetY, halfDepth + offsetZ, colorX, colorY, colorZ,
        -halfWidth + offsetX, halfHeight + offsetY, halfDepth + offsetZ, colorX, colorY, colorZ,
        -halfWidth + offsetX, halfHeight + offsetY, -halfDepth + offsetZ, colorX, colorY, colorZ,
    ];

    // Rotate vertices around the y-axis
    for (let i = 0; i < vertices.length; i += 6) {
        // Apply rotation around the x-axis
        const y = vertices[i + 1];
        const z = vertices[i + 2];
        vertices[i + 1] = y * cosAngleY - z * sinAngleY;
        vertices[i + 2] = y * sinAngleY + z * cosAngleY;
    }

    return vertices;
}

// Steve
function generateParallelogramVertices(width, height, thickness, offsetX, offsetY, offsetZ) {
    const vertices = [
        // Front face
        -width / 2 + offsetX, 0.0 + offsetY, 0.0 + offsetZ, 0.0, 0.0, 0.0,
        width / 2 + offsetX, 0.0 + offsetY, 0.0 + offsetZ, 0.0, 0.0, 0.0,
        width / 2 - thickness + offsetX, height + offsetY, 0.0 + offsetZ, 0.0, 0.0, 0.0,
        -width / 2 - thickness + offsetX, height + offsetY, 0.0 + offsetZ, 0.0, 0.0, 0.0,

        // Back face
        -width / 2 + offsetX, 0.0 + offsetY, thickness + offsetZ, 0.0, 0.0, 0.0,
        width / 2 + offsetX, 0.0 + offsetY, thickness + offsetZ, 0.0, 0.0, 0.0,
        width / 2 - thickness + offsetX, height + offsetY, thickness + offsetZ, 0.0, 0.0, 0.0,
        -width / 2 - thickness + offsetX, height + offsetY, thickness + offsetZ, 0.0, 0.0, 0.0,

        // Top face
        -width / 2 - thickness + offsetX, height + offsetY, 0.0 + offsetZ, 0.0, 0.0, 0.0,
        width / 2 - thickness + offsetX, height + offsetY, 0.0 + offsetZ, 0.0, 0.0, 0.0,
        width / 2 - thickness + offsetX, height + offsetY, thickness + offsetZ, 0.0, 0.0, 0.0,
        -width / 2 - thickness + offsetX, height + offsetY, thickness + offsetZ, 0.0, 0.0, 0.0,

        // Bottom face
        -width / 2 + offsetX, 0.0 + offsetY, 0.0 + offsetZ, 0.0, 0.0, 0.0,
        width / 2 + offsetX, 0.0 + offsetY, 0.0 + offsetZ, 0.0, 0.0, 0.0,
        width / 2 + offsetX, 0.0 + offsetY, thickness + offsetZ, 0.0, 0.0, 0.0,
        -width / 2 + offsetX, 0.0 + offsetY, thickness + offsetZ, 0.0, 0.0, 0.0,

        // Right face
        width / 2 + offsetX, 0.0 + offsetY, 0.0 + offsetZ, 0.0, 0.0, 0.0,
        width / 2 + offsetX, 0.0 + offsetY, thickness + offsetZ, 0.0, 0.0, 0.0,
        width / 2 - thickness + offsetX, height + offsetY, thickness + offsetZ, 0.0, 0.0, 0.0,
        width / 2 - thickness + offsetX, height + offsetY, 0.0 + offsetZ, 0.0, 0.0, 0.0,

        // Left face
        -width / 2 + offsetX, 0.0 + offsetY, 0.0 + offsetZ, 0.0, 0.0, 0.0,
        -width / 2 + offsetX, 0.0 + offsetY, thickness + offsetZ, 0.0, 0.0, 0.0,
        -width / 2 - thickness + offsetX, height + offsetY, thickness + offsetZ, 0.0, 0.0, 0.0,
        -width / 2 - thickness + offsetX, height + offsetY, 0.0 + offsetZ, 0.0, 0.0, 0.0
    ];
    // console.log(vertices.length);
    return vertices;
}
function generateEyelidVertices(radius, sectorCount, stackCount, offsetX, offsetY, offsetZ) {
    let vertices = [];
    let normals = [];
    let texCoords = [];
    let x, y, z, xy;                              // vertex position
    let nx, ny, nz, lengthInv = 1.0 / radius;    // vertex normal
    let s, t;                                     // vertex texCoord

    let sectorStep = 2 * Math.PI / sectorCount;
    let stackStep = Math.PI / stackCount;
    let sectorAngle, stackAngle;

    for (let i = 0; i <= stackCount / 2.5; ++i) {
        stackAngle = Math.PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
        xy = radius * Math.cos(stackAngle);             // r * cos(u)

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            z = radius * Math.sin(stackAngle);              // r * sin(u)
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)

            // Apply rotation around x-axis
            var newX = x;
            var newY = y * Math.cos(-90) - z * Math.sin(-90);
            var newZ = y * Math.sin(-90) + z * Math.cos(-90);

            x = newX;
            y = newY;
            z = newZ;

            x += offsetX;
            y += offsetY;
            z += offsetZ;

            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            //RGB color
            vertices.push(0.9);
            vertices.push(0.9);
            vertices.push(0.9);

            // normalized vertex normal (nx, ny, nz)
            nx = x * lengthInv;
            ny = y * lengthInv;
            nz = z * lengthInv;
            normals.push(nx);
            normals.push(ny);
            normals.push(nz);

            // vertex tex coord (s, t) range between [0, 1]
            s = j / sectorCount;
            t = i / stackCount;
            texCoords.push(s);
            texCoords.push(t);
        }
    }
    return vertices;
}
function generateBottomBeakVertices(radius, sectorCount, stackCount) {
    let vertices = [];
    let normals = [];
    let texCoords = [];
    let x, y, z, xy;                              // vertex position
    let nx, ny, nz, lengthInv = 1.0 / radius;    // vertex normal
    let s, t;                                     // vertex texCoord

    let sectorStep = 2 * Math.PI / sectorCount;
    let stackStep = Math.PI / stackCount;
    let sectorAngle, stackAngle;

    for (let i = 0; i <= stackCount / 2; ++i) {
        stackAngle = Math.PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
        xy = radius * Math.cos(stackAngle);             // r * cos(u)

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            z = radius * stackAngle * stackAngle;          // r * sin(u)
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)

            // Apply rotation around x-axis
            var newX = x;
            var newY = y * Math.cos(90) - z * Math.sin(90);
            var newZ = y * Math.sin(90) + z * Math.cos(90);

            x = newX;
            y = newY;
            z = newZ;

            y -= 1.85;
            z += 6.9;

            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            //RGB color
            vertices.push(1.);
            vertices.push(0.64);
            vertices.push(0.5);

            // normalized vertex normal (nx, ny, nz)
            nx = x * lengthInv;
            ny = y * lengthInv;
            nz = z * lengthInv;
            normals.push(nx);
            normals.push(ny);
            normals.push(nz);

            // vertex tex coord (s, t) range between [0, 1]
            s = j / sectorCount;
            t = i / stackCount;
            texCoords.push(s);
            texCoords.push(t);
        }
    }
    return vertices;
}
function generateEyeBallVertices(radius, sectorCount, stackCount, offsetX, offsetY, offsetZ) {
    let vertices = [];
    let normals = [];
    let texCoords = [];
    let x, y, z, xy;                              // vertex position
    let nx, ny, nz, lengthInv = 1.0 / radius;    // vertex normal
    let s, t;                                     // vertex texCoord

    let sectorStep = 2 * Math.PI / sectorCount;
    let stackStep = Math.PI / stackCount;
    let sectorAngle, stackAngle;

    for (let i = 0; i <= stackCount; ++i) {
        stackAngle = Math.PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
        xy = radius * Math.cos(stackAngle);             // r * cos(u)
        
        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            z = radius * Math.sin(stackAngle);              // r * sin(u)
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)

            x += offsetX;
            y += offsetY;
            z += offsetZ;

            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            //RGB color
            vertices.push(1.);
            vertices.push(1.);
            vertices.push(1.);

            // normalized vertex normal (nx, ny, nz)
            nx = x * lengthInv;
            ny = y * lengthInv;
            nz = z * lengthInv;
            normals.push(nx);
            normals.push(ny);
            normals.push(nz);

            // vertex tex coord (s, t) range between [0, 1]
            s = j / sectorCount;
            t = i / stackCount;
            texCoords.push(s);
            texCoords.push(t);
        }
    }
    return vertices;
}
function generateCheekVertices(radius, sectorCount, stackCount, offsetX, offsetY, offsetZ) {
    let vertices = [];
    let normals = [];
    let texCoords = [];
    let x, y, z, xy;                              // vertex position
    let nx, ny, nz, lengthInv = 1.0 / radius;    // vertex normal
    let s, t;                                     // vertex texCoord

    let sectorStep = 2 * Math.PI / sectorCount;
    let stackStep = Math.PI / stackCount;
    let sectorAngle, stackAngle;

    for (let i = 0; i <= stackCount; ++i) {
        stackAngle = Math.PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
        xy = radius * Math.cos(stackAngle);             // r * cos(u)
        

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            z = radius * Math.sin(stackAngle);              // r * sin(u)
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)

            // Apply rotation around x-axis
            var newX = x;
            var newY = y * Math.cos(90) - z * Math.sin(90);
            var newZ = y * Math.sin(90) + z * Math.cos(90);

            x = newX;
            y = newY;
            z = newZ;

            x += offsetX;
            y += offsetY;
            z += offsetZ;

            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            //RGB color
            vertices.push(1.);
            vertices.push(0.5);
            vertices.push(0.5);

            // normalized vertex normal (nx, ny, nz)
            nx = x * lengthInv;
            ny = y * lengthInv;
            nz = z * lengthInv;
            normals.push(nx);
            normals.push(ny);
            normals.push(nz);

            // vertex tex coord (s, t) range between [0, 1]
            s = j / sectorCount;
            t = i / stackCount;
            texCoords.push(s);
            texCoords.push(t);
        }
    }
    return vertices;
}
function generateEyeBallIrisVertices(radius, sectorCount, stackCount, offsetX, offsetY, offsetZ) {
    let vertices = [];
    let normals = [];
    let texCoords = [];
    let x, y, z, xy;                              // vertex position
    let nx, ny, nz, lengthInv = 1.0 / radius;    // vertex normal
    let s, t;                                     // vertex texCoord

    let sectorStep = 2 * Math.PI / sectorCount;
    let stackStep = Math.PI / stackCount;
    let sectorAngle, stackAngle;

    for (let i = 0; i <= stackCount; ++i) {
        stackAngle = Math.PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
        xy = radius * Math.cos(stackAngle);             // r * cos(u)

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            z = radius * Math.sin(stackAngle);              // r * sin(u)
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)

            x += offsetX;
            y += offsetY;
            z += offsetZ;

            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            //RGB color
            vertices.push(0.);
            vertices.push(0.);
            vertices.push(0.);

            // normalized vertex normal (nx, ny, nz)
            nx = x * lengthInv;
            ny = y * lengthInv;
            nz = z * lengthInv;
            normals.push(nx);
            normals.push(ny);
            normals.push(nz);

            // vertex tex coord (s, t) range between [0, 1]
            s = j / sectorCount;
            t = i / stackCount;
            texCoords.push(s);
            texCoords.push(t);
        }
    }
    return vertices;
}
function generateBodyVertices(radius, sectorCount, stackCount) {
    let vertices = [];
    let normals = [];
    let texCoords = [];
    let x, y, z, xy;                              // vertex position
    let nx, ny, nz, lengthInv = 1.0 / radius;    // vertex normal
    let s, t;                                     // vertex texCoord

    let sectorStep = 2 * Math.PI / sectorCount;
    let stackStep = Math.PI / stackCount;
    let sectorAngle, stackAngle;

    for (let i = 0; i <= stackCount; ++i) {
        stackAngle = Math.PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
        xy = radius * Math.cos(stackAngle);             // r * cos(u)
       

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            z = radius * Math.sin(stackAngle);              // r * sin(u)
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)

            y -= 2.6;
            z += 5;
            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            //RGB color
            vertices.push(0.9);
            vertices.push(0.9);
            vertices.push(0.9);

            // normalized vertex normal (nx, ny, nz)
            nx = x * lengthInv;
            ny = y * lengthInv;
            nz = z * lengthInv;
            normals.push(nx);
            normals.push(ny);
            normals.push(nz);

            // vertex tex coord (s, t) range between [0, 1]
            s = j / sectorCount;
            t = i / stackCount;
            texCoords.push(s);
            texCoords.push(t);
        }
    }
    return vertices;
}
function generateUpperBeakVertices(radius, sectorCount, stackCount) {
    let vertices = [];
    let normals = [];
    let texCoords = [];
    let x, y, z, xy;                              // vertex position
    let nx, ny, nz, lengthInv = 1.0 / radius;    // vertex normal
    let s, t;                                     // vertex texCoord

    let sectorStep = 2 * Math.PI / sectorCount;
    let stackStep = Math.PI / stackCount;
    let sectorAngle, stackAngle;

    for (let i = 0; i <= stackCount; ++i) {
        stackAngle = Math.PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
        xy = radius * stackAngle;             // r * cos(u)

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            z = radius * stackAngle * stackAngle;          // r * sin(u)
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)

            // Apply rotation around x-axis
            var newX = x;
            var newY = y * Math.cos(90) - z * Math.sin(90);
            var newZ = y * Math.sin(90) + z * Math.cos(90);

            x = newX;
            y = newY;
            z = newZ;

            y -= 1;
            z += 7.3;

            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            //RGB color
            vertices.push(1.);
            vertices.push(0.64);
            vertices.push(0.5);


            // normalized vertex normal (nx, ny, nz)
            nx = x * lengthInv;
            ny = y * lengthInv;
            nz = z * lengthInv;
            normals.push(nx);
            normals.push(ny);
            normals.push(nz);

            // vertex tex coord (s, t) range between [0, 1]
            s = j / sectorCount;
            t = i / stackCount;
            texCoords.push(s);
            texCoords.push(t);
        }
    }
    return vertices;
}
function generateEllipticParaboloidVerticesS(radius, sectorCount, stackCount) {
    let vertices = [];
    let normals = [];
    let texCoords = [];
    let x, y, z, xy;                              // vertex position
    let nx, ny, nz, lengthInv = 1.0 / radius;    // vertex normal
    let s, t;                                     // vertex texCoord

    let sectorStep = 2 * Math.PI / sectorCount;
    let stackStep = Math.PI / stackCount;
    let sectorAngle, stackAngle;

    for (let i = 0; i <= stackCount; ++i) {
        stackAngle = Math.PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
        xy = radius * stackAngle;             // r * cos(u)
        

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            z = radius * stackAngle * stackAngle;          // r * sin(u)
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)

            // Apply rotation around x-axis
            var newX = x;
            var newY = y * Math.cos(90) - z * Math.sin(90);
            var newZ = y * Math.sin(90) + z * Math.cos(90);

            x = newX;
            y = newY;
            z = newZ;

            z += 6.2;
            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            //RGB color
            vertices.push(0.9);
            vertices.push(0.9);
            vertices.push(0.9);

            // normalized vertex normal (nx, ny, nz)
            nx = x * lengthInv;
            ny = y * lengthInv;
            nz = z * lengthInv;
            normals.push(nx);
            normals.push(ny);
            normals.push(nz);

            // vertex tex coord (s, t) range between [0, 1]
            s = j / sectorCount;
            t = i / stackCount;
            texCoords.push(s);
            texCoords.push(t);
        }
    }
    return vertices;
}
function generateBallFaces(stackCount, sectorCount) {
    // generate CCW index list of sphere triangles
    // k1--k1+1
    // |  / |
    // | /  |
    // k2--k2+1
    let indices = [];
    let lineIndices = [];
    let k1, k2;
    for (let i = 0; i < stackCount; ++i) {
        k1 = i * (sectorCount + 1);     // beginning of current stack
        k2 = k1 + sectorCount + 1;      // beginning of next stack

        for (let j = 0; j < sectorCount; ++j, ++k1, ++k2) {
            // 2 triangles per sector excluding first and last stacks
            // k1 => k2 => k1+1
            if (i != 0) {
                indices.push(k1);
                indices.push(k2);
                indices.push(k1 + 1);
            }

            // k1+1 => k2 => k2+1
            if (i != (stackCount - 1)) {
                indices.push(k1 + 1);
                indices.push(k2);
                indices.push(k2 + 1);
            }

            // store indices for lines
            // vertical lines for all stacks, k1 => k2
            lineIndices.push(k1);
            lineIndices.push(k2);
            if (i != 0)  // horizontal lines except 1st stack, k1 => k+1
            {
                lineIndices.push(k1);
                lineIndices.push(k1 + 1);
            }
        }
    }
    return indices;
}

// Environment
function generateBase(step) {
    var vertices = [];
    var faces = [];

    // Vertices
    for (var i = 0; i <= step; i++) {
        var x = 7 * Math.cos((i / step) * 2 * Math.PI - Math.PI);
        var y = 7 * Math.sin((i / step) * 2 * Math.PI - Math.PI);
        var z = 0;

        // Apply rotation around x-axis
        var newX = x;
        var newY = y * Math.cos(90) - z * Math.sin(90);
        var newZ = y * Math.sin(90) + z * Math.cos(90);

        x = newX;
        y = newY;
        z = newZ;

        
        vertices.push(x, y, z, 0.82, 0.63, 0.67);
    }
    for (var i = 0; i <= step; i++) {
        var x = 7 * Math.cos((i / step) * 2 * Math.PI - Math.PI);
        var y = 7 * Math.sin((i / step) * 2 * Math.PI - Math.PI);
        var z = 0.5;

        // Apply rotation around x-axis
        var newX = x;
        var newY = y * Math.cos(90) - z * Math.sin(90);
        var newZ = y * Math.sin(90) + z * Math.cos(90);

        x = newX;
        y = newY;
        z = newZ;

        vertices.push(x, y, z, 0.82, 0.63, 0.67);
    }
    
    // Faces
    for (var j = 0; j < step - 1; j++) {
        var a = 0 * step + j;
        var b = a + 1;
        var c = a + step + 1;
        var d = c + 1;
        faces.push(a, b, d, a, d, c);
    }
    for (var i = 1; i < step; i++) {
        a = 0;
        b = i;
        c = i + 1;
        faces.push(a, b, c);
    }
    for (var i = 102; i < step + 101; i++) {
        a = 101;
        b = i;
        c = i + 1;
        faces.push(a, b, c);
    }

    return { "vertices": vertices, "faces": faces };
}

function main() {
    var CANVAS = document.getElementById("myCanvas");


    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;


    var drag = false;
    var dX = 0;
    var dY = 0;


    var X_prev = 0;
    var Y_prev = 0;


    var THETA = 0;
    var ALPHA = 0;


    var FRICTION = 0.95;


    var mouseDown = function (e) {
        drag = true;
        X_prev = e.pageX;
        Y_prev = e.pageY;
    }


    var mouseUp = function (e) {
        drag = false;
    }


    var mouseMove = function (e) {
        if (!drag) { return false; }
        dX = e.pageX - X_prev;
        dY = e.pageY - Y_prev;
        // console.log(dX + " " + dY);
        X_prev = e.pageX;
        Y_prev = e.pageY;


        THETA += dX * 2 * Math.PI / CANVAS.width;
        ALPHA += dY * 2 * Math.PI / CANVAS.height;
    }


    var keyDown = function (e) {
        e.preventDefault();
    }


    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);
    CANVAS.addEventListener("keydown", keyDown);



    try {
        GL = CANVAS.getContext("webgl", { antialias: true });
    } catch (e) {
        alert("WebGL context cannot be initialized");
        return false;
    }
    //shaders
    var shader_vertex_source = `
        attribute vec3 position;
        attribute vec3 color;


        uniform mat4 PMatrix;
        uniform mat4 VMatrix;
        uniform mat4 MMatrix;


        varying vec3 outColor;


        void main(void){
            gl_Position = PMatrix*VMatrix*MMatrix*vec4(position, 1.);
            outColor = color;
        }
   
    `;
    var shader_fragment_source = `
        precision mediump float;
        uniform float greyScality;
        varying vec3 outColor;
        void main(void){
            float greyScaleValue = (outColor.r + outColor.b + outColor.g)/3.;
            vec3 greyScaleColor = vec3(greyScaleValue,greyScaleValue,greyScaleValue);
            vec3 color = mix(greyScaleColor, outColor, greyScality);
            gl_FragColor = vec4(color,1.);
        }
    `;


    //matrix
    var PROJECTION_MATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    var VIEW_MATRIX = LIBS.get_I4();
    var MODEL_MATRIX = LIBS.get_I4();
    var MODEL_MATRIX2 = LIBS.get_I4();
    var MODEL_MATRIX3 = LIBS.get_I4();
    var MODEL_MATRIX4 = LIBS.get_I4();
    var MODEL_MATRIX5 = LIBS.get_I4();
    var MODEL_MATRIX6 = LIBS.get_I4();
    var MODEL_MATRIX7 = LIBS.get_I4();
    var MODEL_MATRIX8 = LIBS.get_I4();
    var MODEL_MATRIX9 = LIBS.get_I4();

    LIBS.translateZ(VIEW_MATRIX, -35);

    // Richard 
    var headRaw = generateEllipsoid(1.35, 1.16, 1.1, 100, 100, 0.43, 0.89, 0.28, 0, 0, 0);
    var head = new MyObject(headRaw['vertices'], headRaw['faces'], shader_vertex_source, shader_fragment_source);

    var rightEarRaw = generateRightEar(100,100);
    var rightEar = new MyObject(rightEarRaw['vertices'], rightEarRaw['faces'], shader_vertex_source, shader_fragment_source);
    head.child.push(rightEar);

    var leftEarRaw = generateLeftEar(100, 100);
    var leftEar = new MyObject(leftEarRaw['vertices'], leftEarRaw['faces'], shader_vertex_source, shader_fragment_source);
    head.child.push(leftEar);

    var rightEyeRaw = generateRightEye(100, 100);
    var rightEye = new MyObject(rightEyeRaw['vertices'], rightEyeRaw['faces'], shader_vertex_source, shader_fragment_source);
    head.child.push(rightEye);

    var leftEyeRaw = generateLeftEye(100, 100);
    var leftEye = new MyObject(leftEyeRaw['vertices'], leftEyeRaw['faces'], shader_vertex_source, shader_fragment_source);
    head.child.push(leftEye);

    var noseRaw = generateNose(100, 100);
    var nose = new MyObject(noseRaw['vertices'], noseRaw['faces'], shader_vertex_source, shader_fragment_source);
    head.child.push(nose);

    var eyebrowRaw = generateEyebrow(0.15, 0.37, 0.05);
    var eyebrow = new MyObject(eyebrowRaw['vertices'], eyebrowRaw['faces'], shader_vertex_source, shader_fragment_source);
    head.child.push(eyebrow);
    head.setup();

    //Kiko

    var scaling_blue = 0.7;

    var sphere = generateSphereVertices(0*scaling_blue, 0*scaling_blue, 0*scaling_blue, 2*scaling_blue, 20, 20, 0.043, 0.7, 0.94); //0,0,0,0.5,20,20,20,1,1,1
    var LeftEye = generateSphereVertices(-0.5*scaling_blue, 0.2*scaling_blue, 1.4*scaling_blue, 0.8*scaling_blue, 20, 20, 1, 1, 1);
    var RightEye = generateSphereVertices(0.5*scaling_blue, 0.2*scaling_blue, 1.4*scaling_blue, 0.8*scaling_blue, 20, 20, 1, 1, 1);
    var leftPupil = generateSphereVertices(-0.5*scaling_blue, 0.2*scaling_blue, 2*scaling_blue, 0.25*scaling_blue, 20, 20, 0, 0, 0);
    var RightPupil = generateSphereVertices(0.5*scaling_blue, 0.2*scaling_blue, 2*scaling_blue, 0.25*scaling_blue, 20, 20, 0, 0, 0);
    var LeftSocket1 = generateSphereVertices(-0.5*scaling_blue, 0.2*scaling_blue, 1.4*scaling_blue, 0.86*scaling_blue, 20, 20, 0.89, 0.035, 0.263);
    var RightSocket1 = generateSphereVertices(0.5*scaling_blue, 0.2*scaling_blue, 1.4*scaling_blue, 0.86*scaling_blue, 20, 20, 0.89, 0.035, 0.263);
    var topBeak = generateEllipticParaboloidVertices(0*scaling_blue, -0.8*scaling_blue, 4.5*scaling_blue, 0.7, 20, 20, 0.7*scaling_blue, 1.2*scaling_blue, -2*scaling_blue, 0.988, 0.976, 0.051);
    var bottomBeak = generateEllipticParaboloidVertices(0*scaling_blue, 0.75*scaling_blue, 4*scaling_blue, 0.7, 20, 20, 0.7*scaling_blue, 0.7*scaling_blue, -2*scaling_blue, 0.89, 0.875, 0.039);
    var feather1 = generateCurvedTube(0*scaling_blue, 0.6*scaling_blue, -0.5*scaling_blue, 1*scaling_blue, 0.3, 30, 170, 0.043, 0.7, 0.94)
    var feather2 = generateCurvedTube(0*scaling_blue, 0.35*scaling_blue, -1.6*scaling_blue, 1*scaling_blue, 0.3, 30, 160, 0.043, 0.7, 0.94)
    var backFeather1 = createBoxVertices(0*scaling_blue, -0.5*scaling_blue, -2.2*scaling_blue, 0.1*scaling_blue, 0.3*scaling_blue, 0.7*scaling_blue, 0.3, 0.027, 0.086, 0.271);
    var backFeather2 = createBoxVertices(0*scaling_blue, 1*scaling_blue, -2*scaling_blue, 0.1*scaling_blue, 0.3*scaling_blue, 0.7*scaling_blue, -0.7*scaling_blue, 0.027, 0.086, 0.271);

    var sphere_faces = [
        // 0,1,2
    ]
    for (let index = 21; index < 420; index++) {
        sphere_faces.push(index);
        sphere_faces.push(index + 1);
        sphere_faces.push(index - 21);

        sphere_faces.push(index + 1);
        sphere_faces.push(index - 21);
        sphere_faces.push(index - 20);

    }

    var cone_faces = [
    ]
    for (let index = 231; index < 420; index++) {
        cone_faces.push(index);
        cone_faces.push(index+1);
        cone_faces.push(index-21);

        cone_faces.push(index+1);
        cone_faces.push(index-21);
        cone_faces.push(index-20);
    }
    var left_socket_faces = [

    ]
    var right_socket_faces = [

    ]
    for (let index = 286; index < 420; index++) {
        left_socket_faces.push(index);
        left_socket_faces.push(index + 1);
        left_socket_faces.push(index - 21);

        left_socket_faces.push(index + 1);
        left_socket_faces.push(index - 21);
        left_socket_faces.push(index - 20);

        right_socket_faces.push(index);
        right_socket_faces.push(index + 1);
        right_socket_faces.push(index - 21);

        right_socket_faces.push(index + 1);
        right_socket_faces.push(index - 21);
        right_socket_faces.push(index - 20);

    }
    var topBeak_faces = [

    ]
    for (let index = 21; index < 460; index++) {

        if (index % 21 < 10) {
            topBeak_faces.push(index);
            topBeak_faces.push(index + 1);
            topBeak_faces.push(index - 21);

            topBeak_faces.push(index + 1);
            topBeak_faces.push(index - 21);
            topBeak_faces.push(index - 20);
        }
    }
    var feather_faces = [

    ]
    for (let index = 0; index < 900; index++) {
        feather_faces.push(index);
        feather_faces.push(index + 1);
        feather_faces.push(index + 30);

        feather_faces.push(index + 30);
        feather_faces.push(index + 31);
        feather_faces.push(index + 1);
    }
    const indices = [
        // Front face
        0, 1, 2,
        0, 2, 3,
        // Back face
        4, 5, 6,
        4, 6, 7,
        // Top face
        8, 9, 10,
        8, 10, 11,
        // Bottom face
        12, 13, 14,
        12, 14, 15,
        // Right face
        16, 17, 18,
        16, 18, 19,
        // Left face
        20, 21, 22,
        20, 22, 23
    ];
    left_socket_faces.push(261, 262, 240, 262, 240, 241, 260, 261, 240);
    left_socket_faces.push(282, 283, 261, 283, 261, 262);
    left_socket_faces.push(281, 282, 260, 282, 260, 261, 280, 281, 260);
    left_socket_faces.push(275, 276, 254, 276, 254, 255, 276, 277, 255);
    left_socket_faces.push(277, 255, 256, 277, 278, 256);

    right_socket_faces.push(279, 280, 279 - 21, 280, 279 - 21, 279 + 1, 278, 279, 278 - 20);
    right_socket_faces.push(279 + 1, 279 - 21, 279 - 20);
    right_socket_faces.push(278, 278 + 1, 278 - 20, 274, 274 + 1, 274 - 21, 274 + 1, 274 - 21, 274 - 20);
    right_socket_faces.push(273, 273 + 1, 273 - 21, 273 + 1, 273 - 21, 273 - 20);
    right_socket_faces.push(252, 252 + 1, 252 - 21, 252 + 1, 252 - 21, 252 - 20, 275 + 1, 275, 275 - 21, 253 + 1, 253, 253 - 21);

    var object = new MyObject(sphere, sphere_faces, shader_vertex_source, shader_fragment_source);
    //object.setup();
    var object2 = new MyObject(LeftEye, sphere_faces, shader_vertex_source, shader_fragment_source);
    object.child.push(object2);
    var object3 = new MyObject(RightEye, sphere_faces, shader_vertex_source, shader_fragment_source);
    object.child.push(object3);
    var object4 = new MyObject(leftPupil, sphere_faces, shader_vertex_source, shader_fragment_source);
    object.child.push(object4);
    var object5 = new MyObject(RightPupil, sphere_faces, shader_vertex_source, shader_fragment_source);
    object.child.push(object5);
    var object6 = new MyObject(LeftSocket1, left_socket_faces, shader_vertex_source, shader_fragment_source);
    object.child.push(object6);
    var object7 = new MyObject(RightSocket1, right_socket_faces, shader_vertex_source, shader_fragment_source);
    object.child.push(object7);
    var object8 = new MyObject(topBeak, topBeak_faces, shader_vertex_source, shader_fragment_source);
    object.child.push(object8);
    var object9 = new MyObject(bottomBeak, topBeak_faces, shader_vertex_source, shader_fragment_source);
    object.child.push(object9);
    var object10 = new MyObject(feather1, feather_faces, shader_vertex_source, shader_fragment_source);
    object.child.push(object10);
    var object11 = new MyObject(feather2, feather_faces, shader_vertex_source, shader_fragment_source);
    object.child.push(object11);
    var object12 = new MyObject(backFeather1, indices, shader_vertex_source, shader_fragment_source);
    object.child.push(object12);
    var object13 = new MyObject(backFeather2, indices, shader_vertex_source, shader_fragment_source);
    object.child.push(object13);
    object.setup();

    //Steve
    var cube_faces = [
        0, 1, 2,
        0, 2, 3,


        4, 5, 6,
        4, 6, 7,


        8, 9, 10,
        8, 10, 11,


        12, 13, 14,
        12, 14, 15,


        16, 17, 18,
        16, 18, 19,


        20, 21, 22,
        20, 22, 23
    ];

    let x = [];
    x = generateBallFaces(18, 36);
    for (let i = 0; i < x.length; i++) {
        x.pop();
    }

    var objectS = new MyObject(generateEllipticParaboloidVerticesS(1.2, 36, 18), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object2S = new MyObject(generateBodyVertices(1.8, 36, 8), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object3S = new MyObject(generateEyeBallVertices(0.4, 36, 18, 0.5, -1, 6.5), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object4S = new MyObject(generateEyeBallVertices(0.4, 36, 18, -0.5, -1, 6.5), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object5S = new MyObject(generateEyeBallIrisVertices(0.15, 36, 18, -0.4, -1, 6.87), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object6S = new MyObject(generateEyeBallIrisVertices(0.15, 36, 18, 0.4, -1, 6.87), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object7S = new MyObject(generateUpperBeakVertices(0.5, 36, 18), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object8S = new MyObject(generateBottomBeakVertices(0.86, 36, 18), x, shader_vertex_source, shader_fragment_source);
    var object9S = new MyObject(generateCheekVertices(0.45, 36, 18, 0.9, -1.65, 6.4), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object10S = new MyObject(generateCheekVertices(0.45, 36, 18, -0.9, -1.65, 6.4), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object11S = new MyObject(generateEyelidVertices(0.4, 36, 18, -0.5, -0.89, 6.51), generateBallFaces(18 / 2.5 - 1, 36), shader_vertex_source, shader_fragment_source);
    var object12S = new MyObject(generateEyelidVertices(0.4, 36, 18, 0.5, -0.89, 6.51), generateBallFaces(18 / 2.5 - 1, 36), shader_vertex_source, shader_fragment_source);
    var object13S = new MyObject(generateParallelogramVertices(0.6, 0.15, 0.1, 0.7, -0.5, 6.57), cube_faces, shader_vertex_source, shader_fragment_source);
    var object14S = new MyObject(generateParallelogramVertices(0.6, 0.15, 0.1, -0.7, -0.5, 6.57), cube_faces, shader_vertex_source, shader_fragment_source);
    var featherS = generateCurvedTube(-0.05, -0.7, 5.3, 0.5, 0.15, 30, 170, 0, 0, 0);
    var feather1S = generateCurvedTube(-0.25, -0.7, 4.8, 0.5, 0.15, 30, 170, 0, 0, 0);
    var feather2S = generateCurvedTube(0.15, -0.7, 4.8, 0.5, 0.15, 30, 170, 0, 0, 0);
    var tailFeatherS = generateCurvedTube(0.2, -3.4, 3.6, 1, 0.15, 30, 270, 0, 0, 0);
    var tailFeather2S = generateCurvedTube(-0.3, -3.4, 3.6, 1, 0.15, 30, 270, 0, 0, 0);
    var object16S = new MyObject(featherS, feather_faces, shader_vertex_source, shader_fragment_source);
    var object17S = new MyObject(feather1S, feather_faces, shader_vertex_source, shader_fragment_source);
    var object18S = new MyObject(feather2S, feather_faces, shader_vertex_source, shader_fragment_source);
    var object19S = new MyObject(tailFeatherS, feather_faces, shader_vertex_source, shader_fragment_source);
    var object20S = new MyObject(tailFeather2S, feather_faces, shader_vertex_source, shader_fragment_source);
    
    objectS.child.push(object2S);
    objectS.child.push(object3S);
    objectS.child.push(object4S);
    objectS.child.push(object5S);
    objectS.child.push(object6S);
    objectS.child.push(object7S);
    objectS.child.push(object8S);
    objectS.child.push(object9S);
    objectS.child.push(object10S);
    objectS.child.push(object11S);
    objectS.child.push(object12S);
    objectS.child.push(object13S);
    objectS.child.push(object14S);
    objectS.child.push(object16S);
    objectS.child.push(object17S);
    objectS.child.push(object18S);
    objectS.child.push(object19S);
    objectS.child.push(object20S);
    objectS.setup();


    //Enviorment
    var boxbase = createBoxVertices(25,-3,0,135,3,60,0,0.659, 0.412, 0.071)
    var boxgrass = createBoxVertices(25,-1,0,135,1,60,0,0.329, 0.961, 0.063)
    var base = new MyObject(boxbase, indices, shader_vertex_source, shader_fragment_source);
    var grass = new MyObject(boxgrass, indices, shader_vertex_source, shader_fragment_source);

    var woodblock1v = createBoxVertices(10,2,0,0.6,5,3,0,0.788, 0.51, 0.141)
    var woodblock1 = new MyObject(woodblock1v,indices, shader_vertex_source,shader_fragment_source)

    var woodblock2v = createBoxVertices(14,2,0,0.6,5,3,0,0.788, 0.51, 0.141)
    var woodblock2 = new MyObject(woodblock2v,indices, shader_vertex_source,shader_fragment_source)
    
    var woodblock3v = createBoxVertices(18,2,0,0.6,5,3,0,0.788, 0.51, 0.141)
    var woodblock3 = new MyObject(woodblock3v,indices, shader_vertex_source,shader_fragment_source)

    var woodblock4v = createBoxVertices(14,4.8,0,9,0.6,3,0,0.788, 0.51, 0.141)
    var woodblock4 = new MyObject(woodblock4v,indices, shader_vertex_source,shader_fragment_source)

    var woodblock5v = createBoxVertices(20,5,0,0.6,11,3,0,0.788, 0.51, 0.141)
    var woodblock5 = new MyObject(woodblock5v,indices, shader_vertex_source,shader_fragment_source)

    var woodblock6v = createBoxVertices(24,5,0,0.6,11,3,0,0.788, 0.51, 0.141)
    var woodblock6 = new MyObject(woodblock6v,indices, shader_vertex_source,shader_fragment_source)
    
    var woodblock7v = createBoxVertices(28,5,0,0.6,11,3,0,0.788, 0.51, 0.141)
    var woodblock7 = new MyObject(woodblock7v,indices, shader_vertex_source,shader_fragment_source)

    var woodblock8v = createBoxVertices(24,10.5,0,9,0.6,3,0,0.788, 0.51, 0.141)
    var woodblock8 = new MyObject(woodblock8v,indices, shader_vertex_source,shader_fragment_source)

    var woodblock9v = createBoxVertices(22,13,0,0.6,5,3,0,0.788, 0.51, 0.141)
    var woodblock9 = new MyObject(woodblock9v,indices, shader_vertex_source,shader_fragment_source)

    var woodblock10v = createBoxVertices(26,13,0,0.6,5,3,0,0.788, 0.51, 0.141)
    var woodblock10 = new MyObject(woodblock10v,indices, shader_vertex_source,shader_fragment_source)

    var woodblock11v = createBoxVertices(24,15.5,0,6,0.6,3,0,0.788, 0.51, 0.141)
    var woodblock11 = new MyObject(woodblock11v,indices, shader_vertex_source,shader_fragment_source)

    var dirtblock1v = createBoxVertices(39,3,0,12,7,8,0,0.271, 0.173, 0.09)
    var dirtblock = new MyObject(dirtblock1v,indices, shader_vertex_source,shader_fragment_source)

    var dirtblock2v = createBoxVertices(51,6,0,12,13,8,0,0.271, 0.173, 0.09)
    var dirtblock2 = new MyObject(dirtblock2v,indices, shader_vertex_source,shader_fragment_source)

    var glassblock1v = createBoxVertices(11,6.1,0,2,2,5,0,0.447, 0.812, 1)
    var glassblock = new MyObject(glassblock1v,indices, shader_vertex_source,shader_fragment_source)
    var glassblock2v = createBoxVertices(14,6.1,0,2,2,5,0,0.447, 0.812, 1)
    var glassblock2 = new MyObject(glassblock2v,indices, shader_vertex_source,shader_fragment_source)
    var glassblock3v = createBoxVertices(17,6.1,0,2,2,5,0,0.447, 0.812, 1)
    var glassblock3 = new MyObject(glassblock3v,indices, shader_vertex_source,shader_fragment_source)
    var glassblock4v = createBoxVertices(14,8,0,6,2,5,0,0.447, 0.812, 0.85)
    var glassblock4 = new MyObject(glassblock4v,indices, shader_vertex_source,shader_fragment_source)
    var glassblock5v = createBoxVertices(12.5,10,0,2,2,5,0,0.447, 0.812, 1)
    var glassblock5 = new MyObject(glassblock5v,indices, shader_vertex_source,shader_fragment_source)
    var glassblock6v = createBoxVertices(15.5,10,0,2,2,5,0,0.447, 0.812, 1)
    var glassblock6 = new MyObject(glassblock6v,indices, shader_vertex_source,shader_fragment_source)

    var stoneblock1v = createBoxVertices(34,10,0,0.8,10,3,0,0.722, 0.722, 0.722)
    var stoneblock = new MyObject(stoneblock1v,indices, shader_vertex_source,shader_fragment_source)
    var stoneblock2v = createBoxVertices(36,10,0,0.8,10,3,0,0.722, 0.722, 0.722)
    var stoneblock2 = new MyObject(stoneblock2v,indices, shader_vertex_source,shader_fragment_source)

    var glassblock7v = createBoxVertices(42,10,0,0.8,10,3,0,0.447, 0.812, 1)
    var glassblock7 = new MyObject(glassblock7v,indices, shader_vertex_source,shader_fragment_source)
    var glassblock8v = createBoxVertices(44,10,0,0.8,10,3,0,0.447, 0.812, 1)
    var glassblock8 = new MyObject(glassblock8v,indices, shader_vertex_source,shader_fragment_source)

    var stoneblock3v = createBoxVertices(39,15.8,0,12,1.6,3,0,0.722, 0.722, 0.722)
    var stoneblock3 = new MyObject(stoneblock3v,indices, shader_vertex_source,shader_fragment_source)
    var stoneblock4v = createBoxVertices(46,18,0,0.8,11,3,0,0.722, 0.722, 0.722)
    var stoneblock4 = new MyObject(stoneblock4v,indices, shader_vertex_source,shader_fragment_source)
    var stoneblock5v = createBoxVertices(48,18,0,0.8,11,3,0,0.722, 0.722, 0.722)
    var stoneblock5 = new MyObject(stoneblock5v,indices, shader_vertex_source,shader_fragment_source)
    var stoneblock6v = createBoxVertices(54,18,0,0.8,11,3,0,0.722, 0.722, 0.722)
    var stoneblock6 = new MyObject(stoneblock6v,indices, shader_vertex_source,shader_fragment_source)
    var stoneblock7v = createBoxVertices(56,18,0,0.8,11,3,0,0.722, 0.722, 0.722)
    var stoneblock7 = new MyObject(stoneblock7v,indices, shader_vertex_source,shader_fragment_source)
    var stoneblock8v = createBoxVertices(51,24,0,11,1.2,3,0,0.722, 0.722, 0.722)
    var stoneblock8 = new MyObject(stoneblock8v,indices, shader_vertex_source,shader_fragment_source)

    var bush1v = generateSphereVertices(-6,1,-23,3,20,20,0, 0.612, 0.067)
    var bush1 = new MyObject(bush1v,sphere_faces,shader_vertex_source,shader_fragment_source)
    var bush2v = generateSphereVertices(-4,4,-23,3,20,20,0, 0.612, 0.067)
    var bush2 = new MyObject(bush2v,sphere_faces,shader_vertex_source,shader_fragment_source)
    var bush3v = generateSphereVertices(0,4,-23,3,20,20,0, 0.612, 0.067)
    var bush3 = new MyObject(bush3v,sphere_faces,shader_vertex_source,shader_fragment_source)
    var bush4v = generateSphereVertices(2,1,-23,3,20,20,0, 0.612, 0.067)
    var bush4 = new MyObject(bush4v,sphere_faces,shader_vertex_source,shader_fragment_source)
    var bush5v = generateSphereVertices(-2,1,-23,3,20,20,0, 0.612, 0.067)
    var bush5 = new MyObject(bush5v,sphere_faces,shader_vertex_source,shader_fragment_source)

    var bush11v = generateSphereVertices(-6+30,1,23,3,20,20,0, 0.612, 0.067)
    var bush11 = new MyObject(bush11v,sphere_faces,shader_vertex_source,shader_fragment_source)
    var bush12v = generateSphereVertices(-4+30,4,23,3,20,20,0, 0.612, 0.067)
    var bush12 = new MyObject(bush12v,sphere_faces,shader_vertex_source,shader_fragment_source)
    var bush13v = generateSphereVertices(0+30,4,23,3,20,20,0, 0.612, 0.067)
    var bush13 = new MyObject(bush13v,sphere_faces,shader_vertex_source,shader_fragment_source)
    var bush14v = generateSphereVertices(2+30,1,23,3,20,20,0, 0.612, 0.067)
    var bush14 = new MyObject(bush14v,sphere_faces,shader_vertex_source,shader_fragment_source)
    var bush15v = generateSphereVertices(-2+30,1,23,3,20,20,0, 0.612, 0.067)
    var bush15 = new MyObject(bush15v,sphere_faces,shader_vertex_source,shader_fragment_source)

    var bush16v = generateSphereVertices(87,4,-19,3,20,20,0, 0.612, 0.067)
    var bush16 = new MyObject(bush16v,sphere_faces,shader_vertex_source,shader_fragment_source)
    var bush17v = generateSphereVertices(87,1,-17,3,20,20,0, 0.612, 0.067)
    var bush17 = new MyObject(bush17v,sphere_faces,shader_vertex_source,shader_fragment_source)
    var bush18v = generateSphereVertices(87,4,-15,3,20,20,0, 0.612, 0.067)
    var bush18 = new MyObject(bush18v,sphere_faces,shader_vertex_source,shader_fragment_source)
    var bush19v = generateSphereVertices(87,1,-21,3,20,20,0, 0.612, 0.067)
    var bush19 = new MyObject(bush19v,sphere_faces,shader_vertex_source,shader_fragment_source)
    var bush20v = generateSphereVertices(87,1,-13,3,20,20,0, 0.612, 0.067)
    var bush20 = new MyObject(bush20v,sphere_faces,shader_vertex_source,shader_fragment_source)

    var cone1v = generateConeVertices(-30,23.5,-12,5.5,20,20,0.09, 0.529, 0.137)
    var cone1 = new MyObject(cone1v,cone_faces,shader_vertex_source,shader_fragment_source)
    var cone2v = generateConeVertices(-30,20,-12,7,20,20,0.09, 0.529, 0.137)
    var cone2 = new MyObject(cone2v,cone_faces,shader_vertex_source,shader_fragment_source)
    var cone3v = generateConeVertices(-30,16,-12,8.5,20,20,0.09, 0.529, 0.137)
    var cone3 = new MyObject(cone3v,cone_faces,shader_vertex_source,shader_fragment_source)
    var log1v = createBoxVertices(-30,4,-12,1,9,1,0,0.388, 0.275, 0.02)
    var log1 = new MyObject(log1v,indices,shader_vertex_source,shader_fragment_source)
    
    var cone4v = generateConeVertices(4,23.5,25,5.5,20,20,0.09, 0.529, 0.137)
    var cone4 = new MyObject(cone4v,cone_faces,shader_vertex_source,shader_fragment_source)
    var cone5v = generateConeVertices(4,20,25,7,20,20,0.09, 0.529, 0.137)
    var cone5 = new MyObject(cone5v,cone_faces,shader_vertex_source,shader_fragment_source)
    var cone6v = generateConeVertices(4,16,25,8.5,20,20,0.09, 0.529, 0.137)
    var cone6 = new MyObject(cone6v,cone_faces,shader_vertex_source,shader_fragment_source)
    var log2v = createBoxVertices(4,4,25,1,9,1,0,0.388, 0.275, 0.02)
    var log2 = new MyObject(log2v,indices,shader_vertex_source,shader_fragment_source)

    var cone7v = generateConeVertices(78,23.5,22,5.5,20,20,0.09, 0.529, 0.137)
    var cone7 = new MyObject(cone7v,cone_faces,shader_vertex_source,shader_fragment_source)
    var cone8v = generateConeVertices(78,20,22,7,20,20,0.09, 0.529, 0.137)
    var cone8 = new MyObject(cone8v,cone_faces,shader_vertex_source,shader_fragment_source)
    var cone9v = generateConeVertices(78,16,22,8.5,20,20,0.09, 0.529, 0.137)
    var cone9 = new MyObject(cone9v,cone_faces,shader_vertex_source,shader_fragment_source)
    var log3v = createBoxVertices(78,4,22,1,9,1,0,0.388, 0.275, 0.02)
    var log3 = new MyObject(log3v,indices,shader_vertex_source,shader_fragment_source)

    var cone10v = generateConeVertices(35,23.5,-25,5.5,20,20,0.09, 0.529, 0.137)
    var cone10 = new MyObject(cone10v,cone_faces,shader_vertex_source,shader_fragment_source)
    var cone11v = generateConeVertices(35,20,-25,7,20,20,0.09, 0.529, 0.137)
    var cone11 = new MyObject(cone11v,cone_faces,shader_vertex_source,shader_fragment_source)
    var cone12v = generateConeVertices(35,16,-25,8.5,20,20,0.09, 0.529, 0.137)
    var cone12 = new MyObject(cone12v,cone_faces,shader_vertex_source,shader_fragment_source)
    var log4v = createBoxVertices(35,4,-25,1,9,1,0,0.388, 0.275, 0.02)
    var log4 = new MyObject(log4v,indices,shader_vertex_source,shader_fragment_source)
    
    base.child.push(grass)
    base.child.push(woodblock1)
    base.child.push(woodblock2)
    base.child.push(woodblock3)
    base.child.push(woodblock4)
    base.child.push(woodblock5)
    base.child.push(woodblock6)
    base.child.push(woodblock7)
    base.child.push(woodblock8)
    base.child.push(woodblock9)
    base.child.push(woodblock10)
    base.child.push(woodblock11)
    base.child.push(dirtblock)
    base.child.push(dirtblock2)
    base.child.push(glassblock)
    base.child.push(glassblock2)
    base.child.push(glassblock3)
    base.child.push(glassblock4)
    base.child.push(glassblock5)
    base.child.push(glassblock6)
    base.child.push(stoneblock)
    base.child.push(stoneblock2)
    base.child.push(glassblock7)
    base.child.push(glassblock8)
    base.child.push(stoneblock3)
    base.child.push(stoneblock4)
    base.child.push(stoneblock5)
    base.child.push(stoneblock6)
    base.child.push(stoneblock7)
    base.child.push(stoneblock8)
    base.child.push(bush1)
    base.child.push(bush2)
    base.child.push(bush3)
    base.child.push(bush4)
    base.child.push(bush5)
    base.child.push(bush11)
    base.child.push(bush12)
    base.child.push(bush13)
    base.child.push(bush14)
    base.child.push(bush15)
    base.child.push(bush16)
    base.child.push(bush17)
    base.child.push(bush18)
    base.child.push(bush19)
    base.child.push(bush20)
    base.child.push(cone1)
    base.child.push(cone2)
    base.child.push(cone3)
    base.child.push(log1)
    base.child.push(cone4)
    base.child.push(cone5)
    base.child.push(cone6)
    base.child.push(log2)
    base.child.push(cone7)
    base.child.push(cone8)
    base.child.push(cone9)
    base.child.push(log3)
    base.child.push(cone10)
    base.child.push(cone11)
    base.child.push(cone12)
    base.child.push(log4)

    base.setup();

    //ANIMATION

    var controlPoint1 = [0,0 , 5,10, 10,3]
    var bspline1 = generateBSpline(controlPoint1,50,2)
    console.log(bspline1)
    /*========================= DRAWING ========================= */
    GL.clearColor(0.0, 0.0, 0.0, 0.0);


    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);

    LIBS.translateZ(VIEW_MATRIX,-5)

    var prev_time = 0;
    var cameraX = 0;
    var cameraY = 0;

    var offsetSplineX = 0;
    var offsetSplineXreverse = 0;
    var offsetSplineY = 0;
    var spineTime = 5;

    var backwardsCondition = false;
    var animate = function (time) {
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.D_BUFFER_BIT);
        var dt = time - prev_time;
        // console.log(dt);

        if (!drag) {
            dX *= FRICTION;
            dY *= FRICTION;

            THETA += dX * 2 * Math.PI / CANVAS.width;
            ALPHA += dY * 2 * Math.PI / CANVAS.height;
        }
        // ANIMATION

        // Richard 
        MODEL_MATRIX4 = LIBS.get_I4();
        //LIBS.rotateY(MODEL_MATRIX4, THETA);
        //LIBS.rotateX(MODEL_MATRIX4, ALPHA);
        head.MODEL_MATRIX = MODEL_MATRIX4;
        rightEar.MODEL_MATRIX = MODEL_MATRIX4;
        leftEar.MODEL_MATRIX = MODEL_MATRIX4;
        rightEye.MODEL_MATRIX = MODEL_MATRIX4;
        leftEye.MODEL_MATRIX = MODEL_MATRIX4;
        nose.MODEL_MATRIX = MODEL_MATRIX4;
        eyebrow.MODEL_MATRIX = MODEL_MATRIX4;

        // Kiko
        MODEL_MATRIX2 = LIBS.get_I4();
        //LIBS.rotateY(MODEL_MATRIX2, THETA);
        //LIBS.rotateX(MODEL_MATRIX2, ALPHA);
        LIBS.translateX(MODEL_MATRIX2, 0 + offsetSplineX + offsetSplineXreverse);
        LIBS.translateY(MODEL_MATRIX2, 1);

        LIBS.rotateY(MODEL_MATRIX2, -1.62);

        MODEL_MATRIX3 = LIBS.get_I4();
        LIBS.rotateZ(MODEL_MATRIX3, 3.14);
        //LIBS.rotateY(MODEL_MATRIX3, THETA);
        //LIBS.rotateX(MODEL_MATRIX3, ALPHA);
        LIBS.translateX(MODEL_MATRIX3, 0 + offsetSplineX + offsetSplineXreverse);
        LIBS.translateY(MODEL_MATRIX3, 1);

        LIBS.rotateY(MODEL_MATRIX3, -1.62)

        if(time > 10000 && offsetSplineX > -18){
            let rotation = time/400;
            LIBS.rotateZ(MODEL_MATRIX2, rotation)
            LIBS.rotateZ(MODEL_MATRIX3, rotation)

            offsetSplineX-= 0.05;
        }

        if(offsetSplineX <= -18){
            backwardsCondition = true;
        }
        if(backwardsCondition){
            let rotation = time/400;
            LIBS.rotateZ(MODEL_MATRIX2, -rotation+1.62)
            LIBS.rotateZ(MODEL_MATRIX3, -rotation+1.62)

            LIBS.rotateZ(MODEL_MATRIX4, +rotation)

            offsetSplineXreverse += 0.05;
            if (offsetSplineXreverse > 23) {
                offsetSplineY -= 0.5;
            }
        }
   
        LIBS.translateY(MODEL_MATRIX4, 0.8 + offsetSplineY);
        LIBS.translateX(MODEL_MATRIX4, -20 - offsetSplineXreverse);
        head.render(VIEW_MATRIX, PROJECTION_MATRIX);

        object.MODEL_MATRIX = MODEL_MATRIX2;
        object2.MODEL_MATRIX = MODEL_MATRIX2;
        object3.MODEL_MATRIX = MODEL_MATRIX2;
        object4.MODEL_MATRIX = MODEL_MATRIX2;
        object5.MODEL_MATRIX = MODEL_MATRIX2;
        object6.MODEL_MATRIX = MODEL_MATRIX2;
        object7.MODEL_MATRIX = MODEL_MATRIX2;
        object8.MODEL_MATRIX = MODEL_MATRIX2;
        object9.MODEL_MATRIX = MODEL_MATRIX3;
        object10.MODEL_MATRIX = MODEL_MATRIX2;
        object11.MODEL_MATRIX = MODEL_MATRIX2;
        object12.MODEL_MATRIX = MODEL_MATRIX2;
        object13.MODEL_MATRIX = MODEL_MATRIX2;
        
        object.render(VIEW_MATRIX, PROJECTION_MATRIX);
        
        // Steve
        
        //head
        MODEL_MATRIX = LIBS.get_I4();
        //LIBS.rotateY(MODEL_MATRIX, THETA);
        //LIBS.rotateX(MODEL_MATRIX, ALPHA);
        LIBS.translateX(MODEL_MATRIX, -38);
        LIBS.translateZ(MODEL_MATRIX, -5);
        LIBS.translateY(MODEL_MATRIX, 4);
        LIBS.translateY(MODEL_MATRIX4, 10);

        LIBS.rotateY(MODEL_MATRIX,1.62)
             
        objectS.MODEL_MATRIX = MODEL_MATRIX;
        object2S.MODEL_MATRIX = MODEL_MATRIX;
        object3S.MODEL_MATRIX = MODEL_MATRIX;
        object4S.MODEL_MATRIX = MODEL_MATRIX;
        object5S.MODEL_MATRIX = MODEL_MATRIX;
        object6S.MODEL_MATRIX = MODEL_MATRIX;
        object7S.MODEL_MATRIX = MODEL_MATRIX;
        object8S.MODEL_MATRIX = MODEL_MATRIX;
        object9S.MODEL_MATRIX = MODEL_MATRIX;
        object10S.MODEL_MATRIX = MODEL_MATRIX;
        object11S.MODEL_MATRIX = MODEL_MATRIX;
        object12S.MODEL_MATRIX = MODEL_MATRIX;
        object13S.MODEL_MATRIX = MODEL_MATRIX;
        object14S.MODEL_MATRIX = MODEL_MATRIX;
        object16S.MODEL_MATRIX = MODEL_MATRIX;
        object17S.MODEL_MATRIX = MODEL_MATRIX;
        object18S.MODEL_MATRIX = MODEL_MATRIX;
        object19S.MODEL_MATRIX = MODEL_MATRIX;
        object20S.MODEL_MATRIX = MODEL_MATRIX;
        //objectS.render(VIEW_MATRIX, PROJECTION_MATRIX);

        // Environment
        MODEL_MATRIX5 = LIBS.get_I4();
    
        base.MODEL_MATRIX = MODEL_MATRIX5;
        //LIBS.rotateY(MODEL_MATRIX5, THETA);
        //LIBS.rotateX(MODEL_MATRIX5, ALPHA);

        //View matrix
        base.render(VIEW_MATRIX, PROJECTION_MATRIX);

        LIBS.rotateY(VIEW_MATRIX, THETA/20);
        LIBS.rotateX(VIEW_MATRIX, ALPHA/20);

        THETA/=2;
        ALPHA/=2;

        // // Combination Transformation (Translation & Rotation)
        // if (time >= 1000 && time < 3000){
        //     LIBS.rotateX(MODEL_MATRIX, - LIBS.degToRad(15) * dt /10);
        //     LIBS.translateY(MODEL_MATRIX, dt / 1000);

        // } else if (time >= 3000 && time < 5000){
        //     LIBS.rotateX(MODEL_MATRIX, LIBS.degToRad(15) * dt / 10);
        //     LIBS.translateY(MODEL_MATRIX, - dt / 1000);

        // }
        // // Rotate Arbitrary Axis
        // else if (time >= 6000 && time < 10600){
        //     var temp = LIBS.get_I4();
        //     LIBS.translateY(temp, -2);
        //     MODEL_MATRIX = LIBS.multiply(MODEL_MATRIX, temp);
        //     temp = LIBS.get_I4();
        //     LIBS.rotateX(temp, - LIBS.degToRad(15) * dt / 100);
        //     MODEL_MATRIX = LIBS.multiply(MODEL_MATRIX, temp);
        //     temp = LIBS.get_I4();
        //     LIBS.translateY(temp, 2);
        //     MODEL_MATRIX = LIBS.multiply(MODEL_MATRIX, temp);
        // } 
        // // Scaling
        // else if (time >=12000 && time < 14000){
        //     MODEL_MATRIX = LIBS.scale(MODEL_MATRIX, (dt / 2000 + 1) * 1);
        // } else if (time >= 14000 && time < 16000){
        //     MODEL_MATRIX = LIBS.scale(MODEL_MATRIX, 1 / ((dt / 2000 + 1) * 1));
        // }
        // // Translate Eye
        
        // else {
        //     MODEL_MATRIX = LIBS.get_I4();
        // }

        // console.log(time);

        //CAMERA MOVEMENTS (NOT ROTATION)

        document.addEventListener('keydown', function(event) {
            switch (event.key) {
                case 'ArrowUp':
                    console.log(offsetSplineX);
                    LIBS.translateY(VIEW_MATRIX, -0.0005);
                    break;
                case 'ArrowDown':
                    LIBS.translateY(VIEW_MATRIX, 0.0005);
                    break;
                case 'ArrowLeft':
                    LIBS.translateX(VIEW_MATRIX, 0.0005);
                    break;
                case 'ArrowRight':
                    LIBS.translateX(VIEW_MATRIX, -0.0005);
                    break;
                case 'w':
                    LIBS.translateZ(VIEW_MATRIX, -0.0005);
                    break;
                case 's':
                    LIBS.translateZ(VIEW_MATRIX, 0.0005);
                    break;
                default:
                    break;
            }
        });        

        GL.flush();
        prev_time = time;

        window.requestAnimationFrame(animate);
    };
    animate(0);
}
window.addEventListener('load', main);