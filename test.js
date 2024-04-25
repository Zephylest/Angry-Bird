var GL;

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
        console.log(e);
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


    LIBS.translateZ(VIEW_MATRIX, -20);

    var headRaw = generateEllipsoid(1.35, 1.16, 1.1, 100, 100, 0.43, 0.89, 0.28, 0, 0, 0);
    var head = new MyObject(headRaw['vertices'], headRaw['faces'], shader_vertex_source, shader_fragment_source);
    head.setup();

    var rightEarRaw = generateRightEar(100,100);
    var rightEar = new MyObject(rightEarRaw['vertices'], rightEarRaw['faces'], shader_vertex_source, shader_fragment_source);
    rightEar.setup();
    head.child.push(rightEar);

    var leftEarRaw = generateLeftEar(100, 100);
    var leftEar = new MyObject(leftEarRaw['vertices'], leftEarRaw['faces'], shader_vertex_source, shader_fragment_source);
    leftEar.setup();
    head.child.push(leftEar);

    var rightEyeRaw = generateRightEye(100, 100);
    var rightEye = new MyObject(rightEyeRaw['vertices'], rightEyeRaw['faces'], shader_vertex_source, shader_fragment_source);
    rightEye.setup();
    head.child.push(rightEye);

    var leftEyeRaw = generateLeftEye(100, 100);
    var leftEye = new MyObject(leftEyeRaw['vertices'], leftEyeRaw['faces'], shader_vertex_source, shader_fragment_source);
    leftEye.setup();
    head.child.push(leftEye);

    var noseRaw = generateNose(100, 100);
    var nose = new MyObject(noseRaw['vertices'], noseRaw['faces'], shader_vertex_source, shader_fragment_source);
    nose.setup();
    head.child.push(nose);

    var eyebrowRaw = generateEyebrow(0.15, 0.37, 0.05);
    var eyebrow = new MyObject(eyebrowRaw['vertices'], eyebrowRaw['faces'], shader_vertex_source, shader_fragment_source);
    eyebrow.setup();
    head.child.push(eyebrow);

    /*========================= DRAWING ========================= */
    GL.clearColor(0.0, 0.0, 0.0, 0.0);


    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);

    var prev_time = 0;
    MODEL_MATRIX = LIBS.get_I4();
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
        LIBS.rotateY(MODEL_MATRIX, THETA);
        LIBS.rotateX(MODEL_MATRIX, ALPHA);

        head.MODEL_MATRIX = MODEL_MATRIX;
        head.render(VIEW_MATRIX, PROJECTION_MATRIX);
        rightEar.MODEL_MATRIX = MODEL_MATRIX;
        leftEar.MODEL_MATRIX = MODEL_MATRIX;
        rightEye.MODEL_MATRIX = MODEL_MATRIX;
        leftEye.MODEL_MATRIX = MODEL_MATRIX;
        nose.MODEL_MATRIX = MODEL_MATRIX;
        eyebrow.MODEL_MATRIX = MODEL_MATRIX;
        
        // Combination Transformation Translation & Rotation
        if (time >= 1000 && time < 3000){
            LIBS.rotateX(MODEL_MATRIX, - LIBS.degToRad(15) * dt /10);
            LIBS.translateY(MODEL_MATRIX, dt / 1000);

        } else if (time >= 3000 && time < 5000){
            LIBS.rotateX(MODEL_MATRIX, LIBS.degToRad(15) * dt / 10);
            LIBS.translateY(MODEL_MATRIX, - dt / 1000);

        }
        // Rotate Arbitrary Axis
        else if (time >= 6000 && time < 10600){
            var temp = LIBS.get_I4();
            LIBS.translateY(temp, -2);
            MODEL_MATRIX = LIBS.multiply(MODEL_MATRIX, temp);
            temp = LIBS.get_I4();
            LIBS.rotateX(temp, - LIBS.degToRad(15) * dt / 100);
            MODEL_MATRIX = LIBS.multiply(MODEL_MATRIX, temp);
            temp = LIBS.get_I4();
            LIBS.translateY(temp, 2);
            MODEL_MATRIX = LIBS.multiply(MODEL_MATRIX, temp);
        } 
        // Scaling
        else if (time >=12000 && time < 14000){
            MODEL_MATRIX = LIBS.scale(MODEL_MATRIX, (dt / 2000 + 1) * 1);
        } else if (time >= 14000 && time < 16000){
            MODEL_MATRIX = LIBS.scale(MODEL_MATRIX, 1 / ((dt / 2000 + 1) * 1));
        }
        // Translate Eye
        
        else {
            MODEL_MATRIX = LIBS.get_I4();
        }

        // console.log(time);
        GL.flush();
        prev_time = time;

        window.requestAnimationFrame(animate);
    };
    animate(0);
}
window.addEventListener('load', main);
