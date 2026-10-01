"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { clamp } from "@/lib/clamp";
import { parseColor } from "@/lib/parseColor";
import { FRAG, VERT } from "./shader";
import styles from "./LiquidOrb.module.css";

const STYLE_INDEX = {
  wave: 0, ember: 1, mint: 2, frost: 3, sky: 4,
  storm: 5, coral: 6, ice: 7, magenta: 8,
} as const;

export type OrbStyle = keyof typeof STYLE_INDEX;

export type OrbPointer = { hover: number; reach: number; sensitivity: number };

export type OrbSettings = {
  orbStyle?: OrbStyle;
  tint?: string;
  core?: string;
  highlight?: string;
  speed?: number;
  ripples?: number;
  amplitude?: number;
};

export type LiquidOrbProps = OrbSettings & {
  background?: string;
  pointer?: Partial<OrbPointer>;
  style?: CSSProperties;
};

const SPEED_REFERENCE = 50;
const MAX_DT = 0.05;
const MAX_DPR = 1.5;
const DEFAULT_POINTER: OrbPointer = { hover: 123, reach: 51, sensitivity: 177 };
const SENS_BASE = 0.4;
const SPIN_DAMP = 2.2;
const MAX_SPIN = 12;
const HOVER_RATE = 8;

// WebGL2 liquid sphere: drag to spin (with inertia), hover to swell, click for a ripple.
export default function LiquidOrb({
  background = "#000000",
  orbStyle = "mint",
  tint = "#00FEFF",
  core = "#FFFFFF",
  highlight = "#FFFFFF",
  speed = 50,
  ripples = 125,
  amplitude = 160,
  pointer,
  style,
}: LiquidOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptr: OrbPointer = { ...DEFAULT_POINTER, ...pointer };
  const live = { orbStyle, tint, core, highlight, speed, ripples, amplitude, ptr };

  // Latest props for the render loop, which is set up once.
  const liveRef = useRef(live);
  useEffect(() => {
    liveRef.current = live;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("LiquidOrb shader:", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("LiquidOrb link:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const U = {
      size: gl.getUniformLocation(program, "uSize"),
      time: gl.getUniformLocation(program, "uTime"),
      style: gl.getUniformLocation(program, "uStyle"),
      speed: gl.getUniformLocation(program, "uSpeed"),
      waveFreq: gl.getUniformLocation(program, "uWaveFreq"),
      amplitude: gl.getUniformLocation(program, "uAmplitude"),
      tint: gl.getUniformLocation(program, "uTint"),
      core: gl.getUniformLocation(program, "uCore"),
      highlight: gl.getUniformLocation(program, "uHighlight"),
      pointer: gl.getUniformLocation(program, "uPointer"),
      hover: gl.getUniformLocation(program, "uHover"),
      reach: gl.getUniformLocation(program, "uReach"),
      click: gl.getUniformLocation(program, "uClick"),
      rot: gl.getUniformLocation(program, "uRot"),
    };

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let bw = 1;
    let bh = 1;
    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      bw = Math.max(1, Math.round(w * dpr));
      bh = Math.max(1, Math.round(h * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      gl.viewport(0, 0, bw, bh);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const ptrState = { fx: 0.5, fy: 0.5, presence: 0, target: 0 };
    const clickState = { fx: 0.5, fy: 0.5, start: 0 };
    const spin = { yaw: 0, pitch: 0, vYaw: 0, vPitch: 0 };
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastMove = performance.now();

    const radPerPx = () =>
      ((SENS_BASE * Math.max(0, liveRef.current.ptr.sensitivity)) / 100) *
      (Math.PI / 180);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const fx = (e.clientX - r.left) / r.width;
      const fy = (e.clientY - r.top) / r.height;
      ptrState.fx = fx;
      ptrState.fy = fy;
      const inside = fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1;
      ptrState.target = inside || dragging ? 1 : 0;

      if (!dragging) return;
      const now = performance.now();
      const dt = Math.max((now - lastMove) / 1000, 1 / 240);
      lastMove = now;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      const k = radPerPx();
      spin.yaw += dx * k;
      spin.pitch += dy * k;

      spin.vYaw = clamp((dx * k) / dt, -MAX_SPIN, MAX_SPIN);
      spin.vPitch = clamp((dy * k) / dt, -MAX_SPIN, MAX_SPIN);
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      lastMove = performance.now();

      spin.vYaw = 0;
      spin.vPitch = 0;

      const r = canvas.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        clickState.fx = (e.clientX - r.left) / r.width;
        clickState.fy = (e.clientY - r.top) / r.height;
        clickState.start = performance.now();
      }
    };

    const onUp = () => {
      dragging = false;
    };

    const onLeave = () => {
      if (!dragging) ptrState.target = 0;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    let raf = 0;
    let last = performance.now();
    let clock = 0;

    const tick = (now: number) => {
      const dt = clamp((now - last) / 1000, 0, MAX_DT);
      last = now;

      const L = liveRef.current;
      clock = (clock + dt * (L.speed / SPEED_REFERENCE)) % 100000;

      ptrState.presence +=
        (ptrState.target - ptrState.presence) *
        (1 - Math.exp(-dt * HOVER_RATE));

      if (!dragging) {
        spin.yaw += spin.vYaw * dt;
        spin.pitch += spin.vPitch * dt;
        const decay = Math.exp(-dt * SPIN_DAMP);
        spin.vYaw *= decay;
        spin.vPitch *= decay;
      }

      const cy = Math.cos(spin.yaw);
      const sy = Math.sin(spin.yaw);
      const cp = Math.cos(spin.pitch);
      const sp = Math.sin(spin.pitch);
      const rot = new Float32Array([
        cy, 0, -sy, sy * sp, cp, cy * sp, sy * cp, -sp, cy * cp,
      ]);

      const minSide = Math.min(bw, bh);
      const puX = ((ptrState.fx - 0.5) * bw * 2) / minSide;
      const puY = ((ptrState.fy - 0.5) * bh * 2) / minSide;
      const cuX = ((clickState.fx - 0.5) * bw * 2) / minSide;
      const cuY = ((clickState.fy - 0.5) * bh * 2) / minSide;
      const clickAge = (now - clickState.start) / 1000;

      const tintRgb = parseColor(L.tint, [0.176, 0.031, 0.702]);
      const coreRgb = parseColor(L.core, [0.51, 0.243, 0.922]);
      const hlRgb = parseColor(L.highlight, [1, 1, 1]);

      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(U.size, bw, bh);

      gl.uniform1f(U.time, clock);
      gl.uniform1f(U.speed, 1);
      gl.uniform1f(U.style, STYLE_INDEX[L.orbStyle] ?? 0);
      gl.uniform1f(U.waveFreq, clamp(L.ripples, 1, 400) / 100);
      gl.uniform1f(U.amplitude, Math.max(0, L.amplitude) / 100);
      gl.uniform3f(U.tint, tintRgb[0], tintRgb[1], tintRgb[2]);
      gl.uniform3f(U.core, coreRgb[0], coreRgb[1], coreRgb[2]);
      gl.uniform3f(U.highlight, hlRgb[0], hlRgb[1], hlRgb[2]);
      gl.uniform3f(U.pointer, puX, puY, ptrState.presence);
      gl.uniform3f(U.click, cuX, cuY, clickAge);
      gl.uniform1f(U.hover, Math.max(0, L.ptr.hover) / 100);
      gl.uniform1f(U.reach, clamp(L.ptr.reach, 1, 200) / 100);
      gl.uniformMatrix3fv(U.rot, false, rot);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div className={styles.root} style={{ background, ...style }}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
