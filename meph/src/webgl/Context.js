/**
 * @class MEPH.webgl.Context
 * A context which handles the loading and unloading of programs and also draws to the canvas.
 **/
MEPH.define('MEPH.webgl.Context', {
    statics: {
        renderFloatingPointTextures: 'renderfloatingpointtextures',
        types: {
            fragment: 'fragment',
            vertex: 'vertex'
        } 
    },
    /**
     * Initializes the context, with the context from the canvas.
     * @param {Object} canvas
     * @param {Object} param
     * @param {Boolean} param.alpha If true, enables the alpha channel of the drawing buffer, default is true.
     * @param {Boolean} param.depth If supported and true, enables the depth buffer, default is true.
     * @param {Boolean} param.stencil If supported and true, enables the stencil buffer, default is false.
     * @param {Boolean} param.antialias If supported and true, enables antialiasing using an implementation-specifi c technique, defalt is false.
     * @param {Boolean} param.premultipliedAlpha If true, enables premultiplied alpha in the drawing buffer. Ignored if alpha is false, default is true.
     * @param {Boolean} param.preserveDrawingBuffer If supported and true, the drawing buff er is preserved until explicitly cleared, default is false.
     **/
    init: function (canvas, param) {
        var me = this;
        me.canvas = canvas;
        me.context = canvas.getContext("webgl", param) || canvas.getContext('experimental-webgl', param);
    },
    /**
     * Clears the context to transparent.s
     */
    clear: function () {
        var me = this, cbb = me.context.COLOR_BUFFER_BIT;
        me.context.clearColor(0, 0, 0, 0);
        me.context.clear(cbb);
    },
    /**
     * Create shader program.
     * @param {String} fragmentShader
     * @param {String} vertexShader
     * @return {Object} shaderProgram
     **/
    createShaderProgram: function (fragmentShader, vertexShader) {
        var me = this,
            gl = me.context;
        var fragmentshader = me.createShader(fragmentShader, MEPH.webgl.Context.types.fragment);
        var vertexshader = me.createShader(vertexShader, MEPH.webgl.Context.types.vertex);
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexshader);
        gl.attachShader(shaderProgram, fragmentshader);
        gl.linkProgram(shaderProgram);
        // If creating the shader program failed, alert

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Unable to initialize the shader program.");
        }
        return shaderProgram;
    },
    createShader: function (theSource, type) {
        var me = this,
            gl = me.context;

        // Now figure out what type of shader script we have,
        // based on its MIME type.

        var shader;

        if (type == MEPH.webgl.Context.types.fragment) {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        gl.shaderSource(shader, theSource);

        // Compile the shader program

        gl.compileShader(shader);

        // See if it compiled successfully

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    },
    /**
     * Creates a render buffer
     * @param {Object} options
     * @returns {Object} renderbuffer
     */
    createRenderBuffer: function (options) {
        var me = this,
            gl = me.context,
            internalformat;

        internalformat = gl.DEPTH_COMPONENT16;
        if (options.type === 'float') {
            if (!gl.getExtension('OES_texture_float')) {
                throw new Error('This option requires the OES_texture_float extension.');
            }
            var ext = (
              gl.getExtension("WEBGL_compressed_texture_s3tc") ||
              gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
              gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc")
            );

            internalformat = ext.COMPRESSED_RGBA_S3TC_DXT5_EXT;
            // gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, options.width, options.height);
        }
        var renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, internalformat, options.width, options.height);

        return renderbuffer;
    },
    /**
     * Can detect the ability of the passed option.
     * @param {String} param
     */
    can: function (option) {
        var me = this;
        switch (option) {
            case MEPH.webgl.Context.renderFloatingPointTextures:
                return me.canRenderFloatingPointTextures();
        }
    },
    viewport: function (x, y, width, height) {
        var me = this,
            gl = me.context;
        me.$viewport = { x: x, y: y, width: width, height: height };
        gl.viewport(x, y, width, height);

        return me.$viewport;
    },
    createFrameBuffer: function (texture, options) {
        var me = this,
            gl = me.context;
        options = options || {};
        MEPH.applyIf({
            colorAttachment: gl.COLOR_ATTACHMENT0
        }, options);
        // setup the framebuffer
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, options.colorAttachment, gl.TEXTURE_2D, texture, 0);
        return framebuffer;
    },
    /**
     * Can render a floating point texture.
     */
    canRenderFloatingPointTextures: function () {
        var me = this,
            height = 256,
            width = 256,
            gl = me.context;
        // setup the texture
        var texture = me.createFloatTexture({ width: width, height: height });

        // setup the framebuffer
        var framebuffer = me.createFrameBuffer(texture);

        // check the framebuffer
        var check = gl.checkFramebufferStatus(gl.FRAMEBUFFER);


        // cleanup
        gl.deleteTexture(texture);
        gl.deleteFramebuffer(framebuffer);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        //check != gl.FRAMEBUFFER_COMPLETE rendering to that texture is supported
        //check == gl.FRAMEBUFFER_COMPLETE rendering to that texture not supported

        return check === gl.FRAMEBUFFER_COMPLETE
    },
    getSizeNeeded: function (width, height, sizeofPixel) {
        return width * height * sizeofPixel;
    },
    createTexture: function (options) {
        var me = this,
            texture,
            gl = me.context;
        if (options.type === 'float') {
            if (!gl.getExtension('OES_texture_float')) {
                throw new Error('This option requires the OES_texture_float extension.');
            }
            var ext = (
              gl.getExtension("WEBGL_compressed_texture_s3tc") ||
              gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
              gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc")
            );

            texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            //The byteLength of the ArrayBufferView, pixels, passed to either 
            //compressedTexImage2D or compressedTexSubImage2D must match the following equation:
            var textureData = options.textureData;
            //floor((width + 3) / 4) * floor((height + 3) / 4) * 16
            //If it is not an INVALID_VALUE error is generated.
            //void texImage2D(GLenum target, GLint level, GLenum internalformat, 
            //       GLsizei width, GLsizei height, GLint border, GLenum format, 
            //       GLenum type, ArrayBufferView? pixels);
            //gl.texImage2D(gl.TEXTURE_2D, 0, gl.FLOAT,
            //    options.width, options.height, 0, gl.UNSIGNED_SHORT_4_4_4_4, gl.FLOAT, textureData);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
               options.width, options.height, 0, gl.RGBA, gl.FLOAT, textureData);

            //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, n, 0, gl.RGBA, gl.FLOAT, pixA);
            //gl.compressedTexImage2D(gl.TEXTURE_2D, 0, ext.COMPRESSED_RGBA_S3TC_DXT5_EXT,
            //    options.width, options.height, 0, textureData);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            return texture;
        }
    },

    createFloatTexture: function (options) {
        var me = this;
        MEPH.applyIf({
            width: 256,
            height: 256
        }, options);
        options.type = 'float';
        options.textureData = options.textureData || new Float32Array(me.getSizeNeeded(options.width, options.height, 4));
        return me.createTexture(options);
    }
});