/*
 * Copyright (C) 2009 Apple Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// J3DI (Jedi) - A support library for WebGL.

/*
    J3DI Math Classes. Currently includes:

        J3DIMatrix4 - A 4x4 Matrix
*/

/*
    J3DIMatrix4 class

    This class implements a 4x4 matrix. It has functions which duplicate the
    functionality of the OpenGL matrix stack and glut functions. On browsers
    that support it, CSSMatrix is used to accelerate operations.

    IDL:

    [
        Constructor(in J3DIMatrix4 matrix),                 // copy passed matrix into new J3DIMatrix4
        Constructor(in sequence[float] array)               // create new J3DIMatrix4 with 16 floats (row major)
        Constructor()                                       // create new J3DIMatrix4 with identity matrix
    ]
    interface J3DIMatrix4 {
        void load(in J3DIMatrix4 matrix);                   // copy the values from the passed matrix
        void load(in sequence[float] array);                // copy 16 floats into the matrix
        sequence[float] getAsArray();                       // return the matrix as an array of 16 floats
        Float32Array getAsFloat32Array();             // return the matrix as a Float32Array with 16 values
        void setUniform(in WebGLRenderingContext ctx,       // Send the matrix to the passed uniform location in the passed context
                        in WebGLUniformLocation loc,
                        in boolean transpose);
        void makeIdentity();                                // replace the matrix with identity
        void transpose();                                   // replace the matrix with its transpose
        void invert();                                      // replace the matrix with its inverse

        void translate(in float x, in float y, in float z); // multiply the matrix by passed translation values on the right
        void translate(in J3DVector3 v);                    // multiply the matrix by passed translation values on the right
        void scale(in float x, in float y, in float z);     // multiply the matrix by passed scale values on the right
        void scale(in J3DVector3 v);                        // multiply the matrix by passed scale values on the right
        void rotate(in float angle,                         // multiply the matrix by passed rotation values on the right
                    in float x, in float y, in float z);    // (angle is in degrees)
        void rotate(in float angle, in J3DVector3 v);       // multiply the matrix by passed rotation values on the right
                                                            // (angle is in degrees)
        void multiply(in CanvasMatrix matrix);              // multiply the matrix by the passed matrix on the right
        void divide(in float divisor);                      // divide the matrix by the passed divisor
        void ortho(in float left, in float right,           // multiply the matrix by the passed ortho values on the right
                   in float bottom, in float top,
                   in float near, in float far);
        void frustum(in float left, in float right,         // multiply the matrix by the passed frustum values on the right
                     in float bottom, in float top,
                     in float near, in float far);
        void perspective(in float fovy, in float aspect,    // multiply the matrix by the passed perspective values on the right
                         in float zNear, in float zFar);
        void lookat(in J3DVector3 eye,                      // multiply the matrix by the passed lookat
                in J3DVector3 center,  in J3DVector3 up);   // values on the right
         bool decompose(in J3DVector3 translate,            // decompose the matrix into the passed vector
                        in J3DVector3 rotate,
                        in J3DVector3 scale,
                        in J3DVector3 skew,
                        in sequence[float] perspective);
    }

    [
        Constructor(in J3DVector3 vector),                  // copy passed vector into new J3DVector3
        Constructor(in sequence[float] array)               // create new J3DVector3 with 3 floats from array
        Constructor(in float x, in float y, in float z)     // create new J3DVector3 with 3 floats
        Constructor()                                       // create new J3DVector3 with (0,0,0)
    ]
    interface J3DVector3 {
        void load(in J3DVector3 vector);                    // copy the values from the passed vector
        void load(in sequence[float] array);                // copy 3 floats into the vector from array
        void load(in float x, in float y, in float z);      // copy 3 floats into the vector
        sequence[float] getAsArray();                       // return the vector as an array of 3 floats
        Float32Array getAsFloat32Array();             // return the matrix as a Float32Array with 16 values
        void multMatrix(in J3DIMatrix4 matrix);             // multiply the vector by the passed matrix (on the right)
        float vectorLength();                               // return the length of the vector
        float dot();                                        // return the dot product of the vector
        void cross(in J3DVector3 v);                        // replace the vector with vector x v
        void divide(in float divisor);                      // divide the vector by the passed divisor
    }
*/
/**
* @class MEPH.math.J3DIVector3
*  [
*        Constructor(in J3DVector3 vector),                  // copy passed vector into new J3DVector3
*        Constructor(in sequence[float] array)               // create new J3DVector3 with 3 floats from array
*        Constructor(in float x, in float y, in float z)     // create new J3DVector3 with 3 floats
*        Constructor()                                       // create new J3DVector3 with (0,0,0)
*    ]
*    interface J3DVector3 {
*        void load(in J3DVector3 vector);                    // copy the values from the passed vector
*        void load(in sequence[float] array);                // copy 3 floats into the vector from array
*        void load(in float x, in float y, in float z);      // copy 3 floats into the vector
*        sequence[float] getAsArray();                       // return the vector as an array of 3 floats
*        Float32Array getAsFloat32Array();             // return the matrix as a Float32Array with 16 values
*        void multMatrix(in J3DIMatrix4 matrix);             // multiply the vector by the passed matrix (on the right)
*        float vectorLength();                               // return the length of the vector
*        float dot();                                        // return the dot product of the vector
*        void cross(in J3DVector3 v);                        // replace the vector with vector x v
*        void divide(in float divisor);                      // divide the vector by the passed divisor
*    }
*/
MEPH.define('MEPH.math.J3DIVector3', {
    alternateNames: 'J3DIVector3',
    //
    // J3DIVector3
    //
    initialize: function (x, y, z) {
        this.load(x, y, z);
    },

    load: function (x, y, z) {
        if (typeof x == 'object' && "length" in x) {
            this[0] = x[0];
            this[1] = x[1];
            this[2] = x[2];
        }
        else if (typeof x == 'number') {
            this[0] = x;
            this[1] = y;
            this[2] = z;
        }
        else {
            this[0] = 0;
            this[1] = 0;
            this[2] = 0;
        }
    },
    getAsArray: function () {
        return [this[0], this[1], this[2]];
    },

    getAsFloat32Array: function () {
        return new Float32Array(this.getAsArray());
    },

    vectorLength: function () {
        return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
    },

    divide: function (divisor) {
        this[0] /= divisor; this[1] /= divisor; this[2] /= divisor;
    },

    cross: function (v) {
        this[0] = this[1] * v[2] - this[2] * v[1];
        this[1] = -this[0] * v[2] + this[2] * v[0];
        this[2] = this[0] * v[1] - this[1] * v[0];
    },


    dot: function (v) {
        return this[0] * v[0] + this[1] * v[1] + this[2] * v[2];
    },

    combine: function (v, ascl, bscl) {
        this[0] = (ascl * this[0]) + (bscl * v[0]);
        this[1] = (ascl * this[1]) + (bscl * v[1]);
        this[2] = (ascl * this[2]) + (bscl * v[2]);
    },

    multVecMatrix: function (matrix) {
        var x = this[0];
        var y = this[1];
        var z = this[2];

        this[0] = matrix.$matrix.m41 + x * matrix.$matrix.m11 + y * matrix.$matrix.m21 + z * matrix.$matrix.m31;
        this[1] = matrix.$matrix.m42 + x * matrix.$matrix.m12 + y * matrix.$matrix.m22 + z * matrix.$matrix.m32;
        this[2] = matrix.$matrix.m43 + x * matrix.$matrix.m13 + y * matrix.$matrix.m23 + z * matrix.$matrix.m33;
        var w = matrix.$matrix.m44 + x * matrix.$matrix.m14 + y * matrix.$matrix.m24 + z * matrix.$matrix.m34;
        if (w != 1 && w != 0) {
            this[0] /= w;
            this[1] /= w;
            this[2] /= w;
        }
    },

    toString: function () {
        return "[" + this[0] + "," + this[1] + "," + this[2] + "]";
    }
});