// GLSL for the LiquidOrb: fullscreen triangle + raymarched liquid sphere.
// Copied verbatim from legacy/index.html.

export const VERT = `#version 300 es
precision highp float;
const vec2 P[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() { gl_Position = vec4(P[gl_VertexID], 0.0, 1.0); }
`;

export const FRAG = `#version 300 es

precision highp float;

uniform vec2 uSize;
uniform float uTime;
uniform float uStyle;
uniform float uSpeed;
uniform float uWaveFreq;
uniform float uAmplitude;
uniform vec3 uTint;
uniform vec3 uCore;
uniform vec3 uHighlight;

uniform vec3 uPointer;
uniform float uHover;
uniform float uReach;

uniform vec3 uClick;

uniform mat3 uRot;

const float HOVER_DEPTH = 1.6;
const float HOVER_CLARITY = 0.55;
const float HOVER_GLINT = 1.5;

const float CLICK_DEPTH = 1.3;
const float CLICK_CLARITY = 0.6;
const float CLICK_GLINT = 1.8;
const float CLICK_SPEED = 1.4;
const float CLICK_WIDTH = 0.30;
const float CLICK_LIFE = 1.6;

out vec4 fragColor;

vec2 goSph(vec3 ro, vec3 rd, float rad) {
    float b = dot(ro, rd);
    float c = dot(ro, ro) - rad * rad;
    float h = b * b - c;
    if (h < 0.0) return vec2(-1.0);
    float hs = sqrt(h);
    return vec2(-b - hs, -b + hs);
}

float goWaveDisp(vec3 p, float t, float fr, float amp, int style) {
    float disp = 0.0;
    if (style == 1) {
        vec3 q = normalize(p) * 3.0;
        float uu = q.x * 0.90 + q.y * 0.45 + q.z * 0.25;
        uu = uu + 0.35 * sin(q.y * 1.5 + t * 0.50);
        uu = uu + 0.18 * sin(q.z * 2.1 - t * 0.55);
        float vv = q.z * 0.70 + q.x * 0.55 + q.y * 0.45;
        vv = vv + 0.30 * sin(q.x * 1.6 - t * 0.55);
        vv = vv + 0.16 * sin(q.y * 2.0 + t * 0.60);
        disp = 0.040 * sin(uu * 5.5 * fr) + 0.032 * sin(vv * 5.0 * fr);
    } else if (style == 2) {
        vec3 q = normalize(p) * 4.0;
        float uu = q.x * 0.85 + q.y * 0.50 + q.z * 0.20;
        uu = uu + 0.25 * sin(q.y * 1.1 + t * 0.28);
        uu = uu + 0.15 * sin(q.z * 1.9 - t * 0.30);
        float vv = q.z * 0.70 + q.x * 0.55 + q.y * 0.45;
        vv = vv + 0.22 * sin(q.x * 1.3 - t * 0.30);
        vv = vv + 0.13 * sin(q.y * 2.0 + t * 0.32);
        disp = 0.026 * sin(uu * 9.0 * fr) + 0.022 * sin(vv * 8.5 * fr);
    } else if (style == 3) {
        vec3 q = normalize(p) * 3.5;
        float uu = q.x * 0.85 + q.y * 0.50 + q.z * 0.20;
        uu = uu + 0.30 * sin(q.y * 1.2 + t * 0.20);
        uu = uu + 0.18 * sin(q.z * 2.1 - t * 0.25);
        uu = uu + 0.10 * sin(q.y * 3.5 + q.z * 2.8 + t * 0.18);
        float vv = q.z * 0.70 + q.x * 0.55 + q.y * 0.45;
        vv = vv + 0.28 * sin(q.x * 1.3 - t * 0.22);
        vv = vv + 0.16 * sin(q.y * 2.4 + t * 0.30);
        vv = vv + 0.09 * sin(q.x * 3.2 + q.z * 2.5 - t * 0.20);
        disp = 0.038 * sin(uu * 7.5 * fr) + 0.030 * sin(vv * 7.0 * fr);
    } else if (style == 4) {
        vec3 q = normalize(p) * 3.0;
        float uu = q.x * 0.85 + q.y * 0.50 + q.z * 0.20;
        uu = uu + 0.28 * sin(q.y * 1.0 + t * 0.18);
        uu = uu + 0.14 * sin(q.z * 1.6 - t * 0.22);
        float vv = q.z * 0.70 + q.x * 0.55 + q.y * 0.45;
        vv = vv + 0.25 * sin(q.x * 1.1 - t * 0.20);
        vv = vv + 0.12 * sin(q.y * 1.7 + t * 0.24);
        disp = 0.022 * sin(uu * 6.5 * fr) + 0.018 * sin(vv * 6.0 * fr);
    } else if (style == 5) {
        vec3 q = normalize(p) * 3.5;
        float uu = q.x * 0.85 + q.y * 0.50 + q.z * 0.20;
        uu = uu + 0.32 * sin(q.y * 1.6 + t * 0.50);
        uu = uu + 0.20 * sin(q.z * 2.3 - t * 0.60);
        float vv = q.z * 0.70 + q.x * 0.55 + q.y * 0.45;
        vv = vv + 0.28 * sin(q.x * 1.7 + t * 0.55);
        vv = vv + 0.18 * sin(q.y * 2.4 - t * 0.70);
        disp = 0.042 * sin(uu * 6.5 * fr)
             + 0.034 * sin(vv * 6.0 * fr)
             + 0.018 * sin((uu + vv) * 8.5 * fr + t * 0.4);
    } else if (style == 6) {
        vec3 q = normalize(p) * 3.3;
        float uu = q.x * 0.85 + q.y * 0.50 + q.z * 0.20;
        uu = uu + 0.32 * sin(q.y * 1.2 + t * 0.30);
        uu = uu + 0.18 * sin(q.z * 1.8 - t * 0.28);
        float vv = -q.x * 0.55 + q.z * 0.65 + q.y * 0.40;
        vv = vv + 0.28 * sin(q.x * 1.3 + t * 0.35);
        vv = vv + 0.16 * sin(q.y * 2.0 - t * 0.25);
        disp = 0.040 * sin(uu * 6.5 * fr) + 0.034 * sin(vv * 6.0 * fr);
    } else if (style == 7) {
        vec3 q = normalize(p) * 4.0;
        float uu = q.x * 0.85 + q.y * 0.50 + q.z * 0.20;
        uu = uu + 0.22 * sin(q.y * 1.4 + t * 0.22);
        uu = uu + 0.13 * sin(q.z * 2.3 - t * 0.18);
        float vv = q.z * 0.70 + q.x * 0.55 + q.y * 0.45;
        vv = vv + 0.20 * sin(q.x * 1.5 - t * 0.22);
        vv = vv + 0.12 * sin(q.y * 2.5 + t * 0.20);
        disp = 0.030 * sin(uu * 10.0 * fr) + 0.025 * sin(vv * 9.5 * fr);
    } else if (style == 8) {
        vec3 q = normalize(p) * 4.0;
        float uu = q.x * 0.85 + q.y * 0.50 + q.z * 0.20;
        uu = uu + 0.25 * sin(q.y * 1.4 + t * 0.55);
        uu = uu + 0.14 * sin(q.z * 2.0 - t * 0.45);
        float vv = q.z * 0.70 + q.x * 0.55 + q.y * 0.45;
        vv = vv + 0.22 * sin(q.x * 1.5 - t * 0.50);
        vv = vv + 0.13 * sin(q.y * 2.2 + t * 0.45);
        disp = 0.030 * sin(uu * 9.5 * fr + t * 0.45) + 0.025 * sin(vv * 9.0 * fr - t * 0.40);
    } else {
        vec3 q = normalize(p) * 3.5;
        float uu = q.x * 0.85 + q.y * 0.50 + q.z * 0.20;
        uu = uu + 0.32 * sin(q.y * 1.0 + t * 0.30);
        uu = uu + 0.22 * sin(q.z * 1.3 - t * 0.35);
        uu = uu + 0.14 * sin(q.y * 1.9 + q.z * 1.6 + t * 0.25);
        float vv = q.z * 0.70 + q.x * 0.55 + q.y * 0.45;
        vv = vv + 0.30 * sin(q.x * 1.2 - t * 0.32);
        vv = vv + 0.20 * sin(q.y * 1.5 + t * 0.45);
        vv = vv + 0.14 * sin(q.z * 1.9 + q.x * 1.6 + t * 0.28);
        disp = 0.042 * sin(uu * 7.0 * fr) + 0.034 * sin(vv * 6.5 * fr);
    }
    return disp * amp;
}

float goMap(vec3 p, float t, float fr, float amp, int style) {
    return length(p) - 1.0 - goWaveDisp(p, t, fr, amp, style);
}

vec3 goNormal(vec3 p, float t, float e, float fr, float amp, int style) {
    vec2 k = vec2(1.0, -1.0);
    return normalize(
        k.xyy * goMap(p + k.xyy * e, t, fr, amp, style) +
        k.yyx * goMap(p + k.yyx * e, t, fr, amp, style) +
        k.yxy * goMap(p + k.yxy * e, t, fr, amp, style) +
        k.xxx * goMap(p + k.xxx * e, t, fr, amp, style)
    );
}

float goAmpSum(int style) {
    if (style == 1) return 0.072;
    if (style == 2) return 0.048;
    if (style == 3) return 0.068;
    if (style == 4) return 0.040;
    if (style == 5) return 0.094;
    if (style == 6) return 0.074;
    if (style == 7) return 0.055;
    if (style == 8) return 0.055;
    return 0.076;
}

float goLip(int style) {
    if (style == 1) return 2.5;
    if (style == 2) return 3.0;
    if (style == 3) return 2.8;
    if (style == 4) return 2.2;
    if (style == 5) return 3.0;
    if (style == 6) return 2.5;
    if (style == 7) return 3.5;
    if (style == 8) return 3.5;
    return 2.0;
}

vec3 goLight1(int style) {
    if (style == 1) return normalize(vec3(0.55, 0.80, 0.55));
    if (style == 2) return normalize(vec3(-0.45, 0.85, 0.55));
    if (style == 6) return normalize(vec3(-0.50, 0.85, 0.55));
    if (style == 7) return normalize(vec3(-0.50, 0.85, 0.55));
    if (style == 8) return normalize(vec3(-0.50, 0.85, 0.55));
    return normalize(vec3(-0.55, 0.85, 0.55));
}

vec3 goLight2(int style) {
    if (style == 1) return normalize(vec3(-0.40, 0.30, 0.80));
    if (style == 2) return normalize(vec3(0.50, 0.30, 0.75));
    if (style == 6) return normalize(vec3(0.50, 0.30, 0.75));
    if (style == 7) return normalize(vec3(0.45, 0.30, 0.80));
    if (style == 8) return normalize(vec3(0.45, 0.30, 0.80));
    return normalize(vec3(0.40, 0.30, 0.80));
}

void main() {
    vec2 size = uSize;

    vec2 pos = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
    vec2 uv = (pos - 0.5 * size) / min(size.x, size.y);
    uv = uv * 2.0;

    int style = int(uStyle);
    float fr = uWaveFreq;
    float t = uTime * uSpeed;

    vec3 ro = vec3(0.0, 0.0, 3.0);
    vec3 rd = normalize(vec3(uv, -1.8));

    float ampSum = goAmpSum(style);

    float rDial = 1.0 + ampSum * uAmplitude + 0.04;
    float orbUv = 1.8 * rDial / sqrt(max(9.0 - rDial * rDial, 1e-4));

    float reach = max(uReach * orbUv, 1e-4);

    float w = uPointer.z * (1.0 - smoothstep(0.0, reach, length(uv - uPointer.xy)));

    float clickAge = max(uClick.z, 0.0);
    float ringR = clickAge * CLICK_SPEED;
    float ringDist = length(uv - uClick.xy) - ringR;
    float ring = exp(-(ringDist * ringDist) / (CLICK_WIDTH * CLICK_WIDTH))
               * exp(-clickAge / CLICK_LIFE);

    float amp = uAmplitude * (1.0 + HOVER_DEPTH * uHover * w + CLICK_DEPTH * ring);

    float boundRad = 1.0 + ampSum * amp + 0.04;
    float lip = goLip(style) * max(1.0, fr) * max(1.0, amp);

    mat3 rInv = transpose(uRot);
    vec3 roO = rInv * ro;
    vec3 rdO = rInv * rd;

    vec2 hh = goSph(roO, rdO, boundRad);

    if (hh.x < 0.0) { fragColor = vec4(0.0); return; }

    float tHit = max(hh.x - 0.02, 0.0);
    float tMax = hh.y + 0.02;
    bool hit = false;
    vec3 pHit = vec3(0.0);
    for (int i = 0; i < 96; i++) {
        vec3 p = roO + rdO * tHit;
        float d = goMap(p, t, fr, amp, style) / lip;
        if (d < 0.0004) { hit = true; pHit = p; break; }
        tHit = tHit + d * 0.85;
        if (tHit > tMax) break;
    }
    if (!hit) { fragColor = vec4(0.0); return; }

    float chord = hh.y - hh.x;
    float graze = clamp(1.0 - chord / (2.5 * boundRad), 0.0, 1.0);
    float nEps = mix(0.0015, 0.0070, graze);
    vec3 n = goNormal(pHit, t, nEps, fr, amp, style);
    vec3 v = -rdO;
    float ndv = clamp(dot(n, v), 0.0, 1.0);

    vec3 L1 = rInv * goLight1(style);
    vec3 L2 = rInv * goLight2(style);
    vec3 baseTint = uTint * 2.0;

    vec3 absorption = 4.5 * (1.0 - uCore) * clamp(1.0 - HOVER_CLARITY * uHover * w - CLICK_CLARITY * ring, 0.0, 1.0);

    vec3 rIn = refract(rdO, n, 1.0 / 1.45);
    float tBack = 0.01;
    vec3 pBack = pHit + rIn * tBack;
    for (int i = 0; i < 32; i++) {
        pBack = pHit + rIn * tBack;
        float d = goMap(pBack, t, fr, amp, style);
        if (d > -0.0008) break;
        tBack = tBack + (-d) / lip * 0.85;
        if (tBack > 3.5) break;
    }
    vec3 transmit = exp(-absorption * tBack);

    vec3 nBack = goNormal(pBack, t, nEps, fr, amp, style);
    float bDiff = (dot(nBack, L1) * 0.5 + 0.5) * 0.65
                + (dot(nBack, L2) * 0.5 + 0.5) * 0.40;
    vec3 interior = baseTint * (0.20 + bDiff) * transmit;

    float fres = pow(1.0 - ndv, 3.5);
    interior = interior + baseTint * fres * 0.55;

    float exp1 = mix(380.0, 90.0, graze);
    float exp2 = mix(240.0, 60.0, graze);
    vec3 H1 = normalize(L1 + v);
    vec3 H2 = normalize(L2 + v);
    float spec1 = pow(clamp(dot(n, H1), 0.0, 1.0), exp1);
    float spec2 = pow(clamp(dot(n, H2), 0.0, 1.0), exp2);
    float gloss = pow(clamp(dot(n, H1), 0.0, 1.0), 40.0) * 0.10;

    vec3 hl = uHighlight * (1.0 + HOVER_GLINT * uHover * w + CLICK_GLINT * ring);
    vec3 col = interior;
    col = col + hl * spec1 * 6.5;
    col = col + hl * spec2 * 3.0;
    col = col + hl * gloss;

    col = col / (1.0 + col * 0.65);
    fragColor = vec4(col, 1.0);
}
`;
