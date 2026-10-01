"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { clamp } from "@/lib/clamp";
import { FRAG, VERT } from "./dither.shader";
import styles from "./DitherReveal.module.css";

// Ported from legacy/dither.txt (Dither Reveal — Originkit).

const DITHER_INDEX = { bayer8: 0, lines: 1, noise: 2 } as const;

export type DitherSettings = {
  fit?: "cover" | "contain";
  /** Vertical focus when cropping, 0–100. */
  focusY?: number;
  ditherStyle?: keyof typeof DITHER_INDEX;
  dotSize?: number;
  /** Radius (px) of the full-colour circle around the pointer. */
  revealRadius?: number;
  revealSoftness?: number;
  wave?: boolean;
  waveSpeed?: number;
  waveDensity?: number;
};

type Props = DitherSettings & {
  src: string;
  className?: string;
  style?: CSSProperties;
};

function uniforms(p: Required<DitherSettings>) {
  const speed = p.wave ? clamp(p.waveSpeed, 1, 100) / 100 : 0;
  return {
    fit: p.fit === "contain" ? 1 : 0,
    focusY: clamp(p.focusY, 0, 100) / 100,
    ditherStyle: DITHER_INDEX[p.ditherStyle] ?? 0,
    pixelSize: clamp(p.dotSize, 1, 20) / 2,
    revealRadius: clamp(p.revealRadius, 20, 600),
    revealSoftness: clamp(p.revealSoftness, 0, 100) / 100,
    waveSpeed: speed,
    waveFrequency: clamp(p.waveDensity, 5, 100) / 10,
    waveAmplitude: speed * 0.4,
    waveMargin: speed * 0.4 * 0.15,
  };
}

// Image rendered as an animated dither; the pointer reveals the real colours
// underneath. Only renders while on screen.
export default function DitherReveal({
  src,
  fit = "cover",
  focusY = 50,
  ditherStyle = "bayer8",
  dotSize = 5,
  revealRadius = 100,
  revealSoftness = 50,
  wave = true,
  waveSpeed = 82,
  waveDensity = 25,
  className,
  style,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const S = uniforms({ fit, focusY, ditherStyle, dotSize, revealRadius, revealSoftness, wave, waveSpeed, waveDensity });
  const liveRef = useRef(S);
  useEffect(() => {
    liveRef.current = S;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, source);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("DitherReveal shader:", gl.getShaderInfoLog(sh));
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("DitherReveal link:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const U = {
      time: u("uTime"),
      mouse: u("uMouse"),
      mouseActive: u("uMouseActive"),
      revealRadius: u("uRevealRadius"),
      revealSoftness: u("uRevealSoftness"),
      pixelSize: u("uPixelSize"),
      ditherStyle: u("uDitherStyle"),
      waveSpeed: u("uWaveSpeed"),
      waveFrequency: u("uWaveFrequency"),
      waveAmplitude: u("uWaveAmplitude"),
      waveMargin: u("uWaveMargin"),
      canvasAspect: u("uCanvasAspect"),
      imageAspect: u("uImageAspect"),
      resolution: u("uResolution"),
      fit: u("uFit"),
      focusY: u("uFocusY"),
    };

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let imgAspect = 1.5;
    const img = new Image();
    img.onload = () => {
      if (img.naturalHeight > 0) imgAspect = img.naturalWidth / img.naturalHeight;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    };
    img.onerror = () => console.warn("DitherReveal: image failed to load:", src);
    img.src = src;

    // Pointer is tracked on the window so content layered over the canvas
    // doesn't block the reveal.
    const mouse = { x: 0.5, y: 0.5, active: 0, target: 0, entered: false };
    const onMove = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      if (inside) {
        mouse.x = x;
        mouse.y = y;
        mouse.entered = true;
      }
      mouse.target = inside ? 1 : 0;
    };
    const onLeaveWindow = () => (mouse.target = 0);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(container.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(container.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const start = performance.now();
    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      const L = liveRef.current;
      mouse.active += (mouse.target - mouse.active) * 0.08;

      gl.uniform1f(U.time, (performance.now() - start) / 1000);
      gl.uniform2f(U.mouse, mouse.x, mouse.y);
      gl.uniform1f(U.mouseActive, mouse.entered ? mouse.active : 0);
      gl.uniform1f(U.revealRadius, L.revealRadius);
      gl.uniform1f(U.revealSoftness, L.revealSoftness);
      gl.uniform1f(U.pixelSize, L.pixelSize);
      gl.uniform1f(U.ditherStyle, L.ditherStyle);
      gl.uniform1f(U.waveSpeed, L.waveSpeed);
      gl.uniform1f(U.waveFrequency, L.waveFrequency);
      gl.uniform1f(U.waveAmplitude, L.waveAmplitude);
      gl.uniform1f(U.waveMargin, L.waveMargin);
      gl.uniform1f(U.canvasAspect, canvas.width / canvas.height);
      gl.uniform1f(U.imageAspect, imgAspect);
      gl.uniform2f(U.resolution, container.clientWidth || 1, container.clientHeight || 1);
      gl.uniform1f(U.fit, L.fit);
      gl.uniform1f(U.focusY, L.focusY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // Render loop only runs while the canvas is on screen.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !raf) raf = requestAnimationFrame(render);
      if (!entry.isIntersecting && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      img.onload = null;
      img.onerror = null;
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
    };
  }, [src]);

  return (
    <div ref={containerRef} className={className ? `${styles.root} ${className}` : styles.root} style={style}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
