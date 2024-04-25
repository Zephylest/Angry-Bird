var LIBS = {
    
    scale: function (matrix, scale) {
        // Scale along the x-axis
        matrix[0] *= scale;
        matrix[1] *= scale;
        matrix[2] *= scale;

        // Scale along the y-axis
        matrix[4] *= scale;
        matrix[5] *= scale;
        matrix[6] *= scale;

        // Scale along the z-axis
        matrix[8] *= scale;
        matrix[9] *= scale;
        matrix[10] *= scale;
        return matrix;
    },
    degToRad: function (angle) {

        return (angle * Math.PI / 180);

    },

    multiply: function(m1, m2){
        res = this.get_I4();
        for(var i = 0; i < 4; i++){
            for (var j = 0; j < 4; j++){
                res[i * 4 + j] = 0;
                for(var k = 0; k < 4; k++){
                    res[i * 4 + j] += m1[i*4 + k] * m2[k*4+j];
                }
            }
        }
        return res;
    },



    get_projection: function (angle, a, zMin, zMax) {

        var tan = Math.tan(LIBS.degToRad(0.5 * angle)),

            A = -(zMax + zMin) / (zMax - zMin),

            B = (-2 * zMax * zMin) / (zMax - zMin);



        return [

            0.5 / tan, 0, 0, 0,

            0, 0.5 * a / tan, 0, 0,

            0, 0, A, -1,

            0, 0, B, 0

        ];

    },

    get_I4: function () {

        return [1, 0, 0, 0,

            0, 1, 0, 0,

            0, 0, 1, 0,

            0, 0, 0, 1];

    },



    rotateX: function (m, angle) {

        var c = Math.cos(angle);

        var s = Math.sin(angle);

        var mv1 = m[1], mv5 = m[5], mv9 = m[9];

        m[1] = m[1] * c - m[2] * s;

        m[5] = m[5] * c - m[6] * s;

        m[9] = m[9] * c - m[10] * s;



        m[2] = m[2] * c + mv1 * s;

        m[6] = m[6] * c + mv5 * s;

        m[10] = m[10] * c + mv9 * s;

    },



    rotateY: function (m, angle) {

        var c = Math.cos(angle);

        var s = Math.sin(angle);

        var mv0 = m[0], mv4 = m[4], mv8 = m[8];

        m[0] = c * m[0] + s * m[2];

        m[4] = c * m[4] + s * m[6];

        m[8] = c * m[8] + s * m[10];



        m[2] = c * m[2] - s * mv0;

        m[6] = c * m[6] - s * mv4;

        m[10] = c * m[10] - s * mv8;

    },



    rotateZ: function (m, angle) {

        var c = Math.cos(angle);

        var s = Math.sin(angle);

        var mv0 = m[0], mv4 = m[4], mv8 = m[8];

        m[0] = c * m[0] - s * m[1];

        m[4] = c * m[4] - s * m[5];

        m[8] = c * m[8] - s * m[9];



        m[1] = c * m[1] + s * mv0;

        m[5] = c * m[5] + s * mv4;

        m[9] = c * m[9] + s * mv8;

    },

    translateZ: function (m, t) {

        m[14] += t;

    },
    translateX: function (m, t) {

        m[12] += t;

    },
    translateY: function (m, t) {

        m[13] += t;

    },
    set_position: function(m, a, b, c){
        m[12]=a, m[13]=b, m[14]=c;
    }
};
