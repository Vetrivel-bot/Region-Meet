// components/DarkVeilGL.js
import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Surface } from 'gl-react-expo';
import { Node, Shaders, GLSL } from 'gl-react';

// paste shader code into GLSL template; MUST adapt any JS helper functions to pure GLSL
const shaders = Shaders.create({
  Veil: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float uTime;
uniform vec2 uResolution;
uniform float uHueShift;
uniform float uNoise;
uniform float uScan;
uniform float uScanFreq;
uniform float uWarp;

/* Adapt your shader helpers here: rand(), hueShiftRGB(), cppn_fn(), etc.
   Must convert functions to GLSL compatible with gl-react. For brevity, use a simpler shader below. */

void main() {
  vec2 fragCoord = uv * uResolution;
  vec2 p = (fragCoord / uResolution.xy) * 2.0 - 1.0;
  float t = uTime * 0.3;
  vec3 col = vec3(
    0.5 + 0.5 * sin(p.x*3.0 + t),
    0.5 + 0.5 * sin(p.y*4.0 + t*1.2),
    0.5 + 0.5 * sin((p.x+p.y)*2.0 + t*0.7)
  );
  gl_FragColor = vec4(col, 1.0);
}`,
  },
});

export default function DarkVeilGL({ style }) {
  const timeRef = useRef(0);
  useEffect(() => {
    let raf = requestAnimationFrame(function tick() {
      timeRef.current += 1 / 60;
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Surface style={[styles.surface, style]}>
      <Node
        shader={shaders.Veil}
        uniforms={{
          uTime: timeRef.current,
          uResolution: [styles.surface.width || 400, styles.surface.height || 800],
          uHueShift: 0,
          uNoise: 0,
          uScan: 0,
          uScanFreq: 0,
          uWarp: 0,
        }}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
