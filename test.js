var GL;

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
function generateParallelogramVertices(width, height, thickness) {
    const vertices = [
        // Front face
        -width / 2, 0.0, 0.0, 0.0, 0.0, 0.0,
        width / 2, 0.0, 0.0, 0.0, 0.0, 0.0,
        width / 2 - thickness, height, 0.0, 0.0, 0.0, 0.0,
        -width / 2 - thickness, height, 0.0, 0.0, 0.0, 0.0,

        // Back face
        -width / 2, 0.0, thickness, 0.0, 0.0, 0.0,
        width / 2, 0.0, thickness, 0.0, 0.0, 0.0,
        width / 2 - thickness, height, thickness, 0.0, 0.0, 0.0,
        -width / 2 - thickness, height, thickness, 0.0, 0.0, 0.0,

        // Top face
        -width / 2 - thickness, height, 0.0, 0.0, 0.0, 0.0,
        width / 2 - thickness, height, 0.0, 0.0, 0.0, 0.0,
        width / 2 - thickness, height, thickness, 0.0, 0.0, 0.0,
        -width / 2 - thickness, height, thickness, 0.0, 0.0, 0.0,

        // Bottom face
        -width / 2, 0.0, 0.0, 0.0, 0.0, 0.0,
        width / 2, 0.0, 0.0, 0.0, 0.0, 0.0,
        width / 2, 0.0, thickness, 0.0, 0.0, 0.0,
        -width / 2, 0.0, thickness, 0.0, 0.0, 0.0,

        // Right face
        width / 2, 0.0, 0.0, 0.0, 0.0, 0.0,
        width / 2, 0.0, thickness, 0.0, 0.0, 0.0,
        width / 2 - thickness, height, thickness, 0.0, 0.0, 0.0,
        width / 2 - thickness, height, 0.0, 0.0, 0.0, 0.0,

        // Left face
        -width / 2, 0.0, 0.0, 0.0, 0.0, 0.0,
        -width / 2, 0.0, thickness, 0.0, 0.0, 0.0,
        -width / 2 - thickness, height, thickness, 0.0, 0.0, 0.0,
        -width / 2 - thickness, height, 0.0, 0.0, 0.0, 0.0
    ];
    return vertices;
}
function generateEyelidVertices(radius, sectorCount, stackCount) {
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
        z = radius * Math.sin(stackAngle);              // r * sin(u)

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)
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
        z = radius * Math.sin(stackAngle);              // r * sin(u)

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)
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
function generateEyeBallVertices(radius, sectorCount, stackCount) {
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
        z = radius * Math.sin(stackAngle);              // r * sin(u)

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)
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
function generateCheekVertices(radius, sectorCount, stackCount) {
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
        z = radius * Math.sin(stackAngle);              // r * sin(u)

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)
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
function generateEyeBallIrisVertices(radius, sectorCount, stackCount) {
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
        z = radius * Math.sin(stackAngle);              // r * sin(u)

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)
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
        z = radius * Math.sin(stackAngle);              // r * sin(u)

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)
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
        z = radius * stackAngle * stackAngle;          // r * sin(u)

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)
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
        z = radius * stackAngle * stackAngle;          // r * sin(u)

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for (let j = 0; j <= sectorCount; ++j) {
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)
            
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
    var MODEL_MATRIX3 = LIBS.get_I4();
    var MODEL_MATRIX4 = LIBS.get_I4();
    var MODEL_MATRIX5 = LIBS.get_I4();
    var MODEL_MATRIX6 = LIBS.get_I4();
    var MODEL_MATRIX7 = LIBS.get_I4();
    var MODEL_MATRIX8 = LIBS.get_I4();
    var MODEL_MATRIX9 = LIBS.get_I4();
    var MODEL_MATRIX10 = LIBS.get_I4();
    var MODEL_MATRIX11 = LIBS.get_I4();
    var MODEL_MATRIX12 = LIBS.get_I4();
    var MODEL_MATRIX13 = LIBS.get_I4();
    var MODEL_MATRIX14 = LIBS.get_I4();
    var MODEL_MATRIX15 = LIBS.get_I4();
    var MODEL_MATRIX16 = LIBS.get_I4();
    var MODEL_MATRIX17 = LIBS.get_I4();



    LIBS.translateZ(VIEW_MATRIX, -20);

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
    var sphere = generateSphereVertices(0, 0, 0, 2, 20, 20, 0.043, 0.7, 0.94); //0,0,0,0.5,20,20,20,1,1,1
    var LeftEye = generateSphereVertices(-0.5, 0.2, 1.4, 0.8, 20, 20, 1, 1, 1);
    var RightEye = generateSphereVertices(0.5, 0.2, 1.4, 0.8, 20, 20, 1, 1, 1);
    var leftPupil = generateSphereVertices(-0.5, 0.2, 2, 0.25, 20, 20, 0, 0, 0);
    var RightPupil = generateSphereVertices(0.5, 0.2, 2, 0.25, 20, 20, 0, 0, 0);
    var LeftSocket1 = generateSphereVertices(-0.5, 0.2, 1.4, 0.86, 20, 20, 0.89, 0.035, 0.263);
    var RightSocket1 = generateSphereVertices(0.5, 0.2, 1.4, 0.86, 20, 20, 0.89, 0.035, 0.263);
    var topBeak = generateEllipticParaboloidVertices(0, -0.8, 4.5, 0.7, 20, 20, 0.7, 1.2, -2, 0.988, 0.976, 0.051);
    var bottomBeak = generateEllipticParaboloidVertices(0, 0.75, 4, 0.7, 20, 20, 0.7, 0.7, -2, 0.89, 0.875, 0.039);
    var feather1 = generateCurvedTube(0, 0.6, -0.5, 1, 0.3, 30, 170, 0.043, 0.7, 0.94)
    var feather2 = generateCurvedTube(0, 0.35, -1.6, 1, 0.3, 30, 160, 0.043, 0.7, 0.94)
    var backFeather1 = createBoxVertices(0, -0.5, -2.2, 0.1, 0.3, 0.7, 0.3, 0.027, 0.086, 0.271);
    var backFeather2 = createBoxVertices(0, 1, -2, 0.1, 0.3, 0.7, -0.7, 0.027, 0.086, 0.271);

    var sphere_faces = [
        // 0,1,2
    ]
    for (let index = 21; index < 441; index++) {
        sphere_faces.push(index);
        sphere_faces.push(index + 1);
        sphere_faces.push(index - 21);

        sphere_faces.push(index + 1);
        sphere_faces.push(index - 21);
        sphere_faces.push(index - 20);

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
    var objectS = new MyObject(generateEllipticParaboloidVerticesS(1.2, 36, 18), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object2S = new MyObject(generateBodyVertices(1.8, 36, 8), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object3S = new MyObject(generateEyeBallVertices(0.4, 36, 18), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object4S = new MyObject(generateEyeBallVertices(0.4, 36, 18), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object5S = new MyObject(generateEyeBallIrisVertices(0.15, 36, 18), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object6S = new MyObject(generateEyeBallIrisVertices(0.15, 36, 18), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object7S = new MyObject(generateUpperBeakVertices(0.5, 36, 18), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object8S = new MyObject(generateBottomBeakVertices(0.86, 36, 18), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object9S = new MyObject(generateCheekVertices(0.45, 36, 18), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object10S = new MyObject(generateCheekVertices(0.45, 36, 18), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object11S = new MyObject(generateEyelidVertices(0.4, 36, 18), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object12S = new MyObject(generateEyelidVertices(0.4, 36, 18), generateBallFaces(18, 36), shader_vertex_source, shader_fragment_source);
    var object13S = new MyObject(generateParallelogramVertices(0.6, 0.15, 0.1), cube_faces, shader_vertex_source, shader_fragment_source);
    var object14S = new MyObject(generateParallelogramVertices(0.6, 0.15, 0.1), cube_faces, shader_vertex_source, shader_fragment_source);
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
    objectS.setup();


    /*========================= DRAWING ========================= */
    GL.clearColor(0.0, 0.0, 0.0, 0.0);


    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);

    

    var prev_time = 0;
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
        

        // Richard 
        MODEL_MATRIX17 = LIBS.get_I4();
        LIBS.rotateY(MODEL_MATRIX17, THETA);
        LIBS.rotateX(MODEL_MATRIX17, ALPHA);
        head.MODEL_MATRIX = MODEL_MATRIX17;
        rightEar.MODEL_MATRIX = MODEL_MATRIX17;
        leftEar.MODEL_MATRIX = MODEL_MATRIX17;
        rightEye.MODEL_MATRIX = MODEL_MATRIX17;
        leftEye.MODEL_MATRIX = MODEL_MATRIX17;
        nose.MODEL_MATRIX = MODEL_MATRIX17;
        eyebrow.MODEL_MATRIX = MODEL_MATRIX17;
        head.render(VIEW_MATRIX, PROJECTION_MATRIX);

        // Kiko
        MODEL_MATRIX15 = LIBS.get_I4();
        LIBS.rotateY(MODEL_MATRIX15, THETA);
        LIBS.rotateX(MODEL_MATRIX15, ALPHA);
        LIBS.translateX(MODEL_MATRIX15, 4);

        MODEL_MATRIX16 = LIBS.get_I4();
        LIBS.rotateZ(MODEL_MATRIX16, 3.14);
        LIBS.rotateY(MODEL_MATRIX16, THETA);
        LIBS.rotateX(MODEL_MATRIX16, ALPHA);
        LIBS.translateX(MODEL_MATRIX16, 4);
   
        object.MODEL_MATRIX = MODEL_MATRIX15;
        object2.MODEL_MATRIX = MODEL_MATRIX15;
        object3.MODEL_MATRIX = MODEL_MATRIX15;
        object4.MODEL_MATRIX = MODEL_MATRIX15;
        object5.MODEL_MATRIX = MODEL_MATRIX15;
        object6.MODEL_MATRIX = MODEL_MATRIX15;
        object7.MODEL_MATRIX = MODEL_MATRIX15;
        object8.MODEL_MATRIX = MODEL_MATRIX15;
        object9.MODEL_MATRIX = MODEL_MATRIX16;
        object10.MODEL_MATRIX = MODEL_MATRIX15;
        object11.MODEL_MATRIX = MODEL_MATRIX15;
        object12.MODEL_MATRIX = MODEL_MATRIX15;
        object13.MODEL_MATRIX = MODEL_MATRIX15;

        object.render(VIEW_MATRIX, PROJECTION_MATRIX);
        
        // Steve
        
        //head
        MODEL_MATRIX = LIBS.get_I4();
        //LIBS.translateX(MODEL_MATRIX, -4);
        LIBS.rotateY(MODEL_MATRIX, THETA);
        LIBS.rotateX(MODEL_MATRIX, ALPHA);
        LIBS.rotateX(MODEL_MATRIX, 90);
        LIBS.translateZ(MODEL_MATRIX, 6.2);
       

        //body
        MODEL_MATRIX2 = LIBS.get_I4();
        //LIBS.translateX(MODEL_MATRIX2, -4);
        //LIBS.rotateX(MODEL_MATRIX2, 90);
        LIBS.rotateY(MODEL_MATRIX2, THETA);
        LIBS.rotateX(MODEL_MATRIX2, ALPHA);
        LIBS.translateY(MODEL_MATRIX2, -2.6);
        LIBS.translateZ(MODEL_MATRIX2, 5);
       

        //eyeball right
        MODEL_MATRIX3 = LIBS.get_I4();
        
        LIBS.translateX(MODEL_MATRIX3, 0.5);
        LIBS.translateY(MODEL_MATRIX3, -1);
        LIBS.translateZ(MODEL_MATRIX3, 6.5);
        LIBS.rotateY(MODEL_MATRIX3, THETA);
        LIBS.rotateX(MODEL_MATRIX3, ALPHA);

        //eyeball left
        MODEL_MATRIX4 = LIBS.get_I4();
        LIBS.rotateY(MODEL_MATRIX4, THETA);
        LIBS.rotateX(MODEL_MATRIX4, ALPHA);
        LIBS.translateX(MODEL_MATRIX4, -0.5);
        LIBS.translateY(MODEL_MATRIX4, -1);
        LIBS.translateZ(MODEL_MATRIX4, 6.5);
        

        //iris left
        MODEL_MATRIX5 = LIBS.get_I4();
        LIBS.rotateY(MODEL_MATRIX5, THETA);
        LIBS.rotateX(MODEL_MATRIX5, ALPHA);
        LIBS.translateX(MODEL_MATRIX5, -0.4);
        LIBS.translateY(MODEL_MATRIX5, -1);
        LIBS.translateZ(MODEL_MATRIX5, 6.87);
       

        //iris right
        MODEL_MATRIX6 = LIBS.get_I4();
        LIBS.rotateY(MODEL_MATRIX6, THETA);
        LIBS.rotateX(MODEL_MATRIX6, ALPHA);
        LIBS.translateX(MODEL_MATRIX6, 0.4);
        LIBS.translateY(MODEL_MATRIX6, -1);
        LIBS.translateZ(MODEL_MATRIX6, 6.87);
    
        //upper beak
        MODEL_MATRIX7 = LIBS.get_I4();
        LIBS.rotateY(MODEL_MATRIX7, THETA);
        LIBS.rotateX(MODEL_MATRIX7, ALPHA);
        LIBS.rotateX(MODEL_MATRIX7, 90);
        LIBS.translateY(MODEL_MATRIX7, -1);
        LIBS.translateZ(MODEL_MATRIX7, 7.3);
        

        //bottom beak
        MODEL_MATRIX8 = LIBS.get_I4();
        //LIBS.translateX(MODEL_MATRIX8,2);
        LIBS.rotateX(MODEL_MATRIX8, 90);
        LIBS.rotateY(MODEL_MATRIX8, THETA);
        LIBS.rotateX(MODEL_MATRIX8, ALPHA);
        LIBS.translateY(MODEL_MATRIX8, -1.85);
        LIBS.translateZ(MODEL_MATRIX8, 6.9);
        

        //cheeks
        MODEL_MATRIX9 = LIBS.get_I4();
        //LIBS.translateX(MODEL_MATRIX8,2);
        LIBS.rotateX(MODEL_MATRIX9, 90);
        LIBS.rotateY(MODEL_MATRIX9, THETA);
        LIBS.rotateX(MODEL_MATRIX9, ALPHA);
        LIBS.translateX(MODEL_MATRIX9, 0.9);
        LIBS.translateY(MODEL_MATRIX9, -1.65);
        LIBS.translateZ(MODEL_MATRIX9, 6.4);
        
        //cheek
        MODEL_MATRIX10 = LIBS.get_I4();
        //LIBS.translateX(MODEL_MATRIX8,2);
        LIBS.rotateX(MODEL_MATRIX10, 90);
        LIBS.rotateY(MODEL_MATRIX10, THETA);
        LIBS.rotateX(MODEL_MATRIX10, ALPHA);
        LIBS.translateX(MODEL_MATRIX10, -0.9);
        LIBS.translateY(MODEL_MATRIX10, -1.65);
        LIBS.translateZ(MODEL_MATRIX10, 6.4);
      
        //eyebrow
        MODEL_MATRIX13 = LIBS.get_I4();
        //LIBS.translateX(MODEL_MATRIX8,2);
        LIBS.rotateY(MODEL_MATRIX13, THETA);
        LIBS.rotateX(MODEL_MATRIX13, ALPHA);
        LIBS.translateX(MODEL_MATRIX13, 0.7);
        LIBS.translateY(MODEL_MATRIX13, -0.5);
        LIBS.translateZ(MODEL_MATRIX13, 6.57);
        
        //eyebrow
        MODEL_MATRIX14 = LIBS.get_I4();
        LIBS.rotateY(MODEL_MATRIX14, 3);
        LIBS.rotateY(MODEL_MATRIX14, THETA);
        LIBS.rotateX(MODEL_MATRIX14, ALPHA);
        LIBS.translateX(MODEL_MATRIX14, -0.7);
        LIBS.translateY(MODEL_MATRIX14, -0.5);
        LIBS.translateZ(MODEL_MATRIX14, 6.57);
        
        //eyelid
        MODEL_MATRIX11 = LIBS.get_I4();
        LIBS.rotateX(MODEL_MATRIX11, -90);
        LIBS.rotateY(MODEL_MATRIX11, THETA);
        LIBS.rotateX(MODEL_MATRIX11, ALPHA);
        LIBS.translateX(MODEL_MATRIX11, -0.5);
        LIBS.translateY(MODEL_MATRIX11, -0.89);
        LIBS.translateZ(MODEL_MATRIX11, 6.51);
      

        //eyelid
        MODEL_MATRIX12 = LIBS.get_I4();
        
        LIBS.rotateX(MODEL_MATRIX12, -90);
        LIBS.rotateY(MODEL_MATRIX12, THETA);
        LIBS.rotateX(MODEL_MATRIX12, ALPHA);
        LIBS.translateX(MODEL_MATRIX12, 0.5);
        LIBS.translateY(MODEL_MATRIX12, -0.89);
        LIBS.translateZ(MODEL_MATRIX12, 6.51);
      

        objectS.MODEL_MATRIX = MODEL_MATRIX;
        object2S.MODEL_MATRIX = MODEL_MATRIX2;
        object3S.MODEL_MATRIX = MODEL_MATRIX3;
        object4S.MODEL_MATRIX = MODEL_MATRIX4;
        object5S.MODEL_MATRIX = MODEL_MATRIX5;
        object6S.MODEL_MATRIX = MODEL_MATRIX6;
        object7S.MODEL_MATRIX = MODEL_MATRIX7;
        object8S.MODEL_MATRIX = MODEL_MATRIX8;
        object9S.MODEL_MATRIX = MODEL_MATRIX9;
        object10S.MODEL_MATRIX = MODEL_MATRIX10;
        object11S.MODEL_MATRIX = MODEL_MATRIX11;
        object12S.MODEL_MATRIX = MODEL_MATRIX12;
        object13S.MODEL_MATRIX = MODEL_MATRIX13;
        object14S.MODEL_MATRIX = MODEL_MATRIX14;
        objectS.render(VIEW_MATRIX, PROJECTION_MATRIX);

        // // Combination Transformation Translation & Rotation
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
        GL.flush();
        prev_time = time;

        window.requestAnimationFrame(animate);
    };
    animate(0);
}
window.addEventListener('load', main);
