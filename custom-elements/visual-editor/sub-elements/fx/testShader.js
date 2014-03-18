/**
 * original @author stemkoski / http://github.com/stemkoski
 * modified by @kaosat-dev / http://github.com/kaosat-dev
 * Blend three textures additively
 * texel1 + texel2
 * + vec4(0.5, 0.75, 1.0, 1.0)
 */

THREE.TestShader = {
    uniforms: {
        "tDiffuse2": { type: "t", value: null }
    },

    vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"

    ].join("\n"),

    fragmentShader: [
        "uniform sampler2D tDiffuse2;",
        "varying vec2 vUv;",
        "void main() {",
            "vec4 colorTexel = texture2D( tDiffuse2, vUv );",
            "gl_FragColor = colorTexel;",
        "}"
    ].join("\n")
};
