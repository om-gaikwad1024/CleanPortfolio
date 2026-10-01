// Easing, Framer-style transition resolver and a tiny tween timeline for the carousel.
// Ported from legacy/carousel.txt.

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

export type Ease = (t: number) => number

const outPow =
    (n: number): Ease =>
    (t) =>
        1 - Math.pow(1 - t, n)

const inOutPow =
    (n: number): Ease =>
    (t) =>
        t < 0.5 ? Math.pow(2 * t, n) / 2 : 1 - Math.pow(2 - 2 * t, n) / 2

export const OUT3 = outPow(3)
export const INOUT2 = inOutPow(2)
export const INOUT3 = inOutPow(3)

export const EXPO_INOUT: Ease = (t) =>
    t <= 0
        ? 0
        : t >= 1
          ? 1
          : t < 0.5
            ? Math.pow(2, 20 * t - 10) / 2
            : (2 - Math.pow(2, -20 * t + 10)) / 2

export interface FramerTransition {
    type?: string
    duration?: number
    delay?: number
    ease?: string | number[]
    stiffness?: number
    damping?: number
    mass?: number
    bounce?: number
}

function cubicBezier(x1: number, y1: number, x2: number, y2: number): Ease {
    const a = (u: number, v: number) => 1 - 3 * v + 3 * u
    const b = (u: number, v: number) => 3 * v - 6 * u
    const c = (u: number) => 3 * u
    const calc = (t: number, u: number, v: number) =>
        ((a(u, v) * t + b(u, v)) * t + c(u)) * t
    const slope = (t: number, u: number, v: number) =>
        3 * a(u, v) * t * t + 2 * b(u, v) * t + c(u)
    return (p) => {
        if (p <= 0) return 0
        if (p >= 1) return 1
        let t = p
        for (let i = 0; i < 8; i++) {
            const s = slope(t, x1, x2)
            if (Math.abs(s) < 1e-6) break
            t -= (calc(t, x1, x2) - p) / s
        }
        return calc(clamp01(t), y1, y2)
    }
}

const NAMED_EASES: Record<string, [number, number, number, number]> = {
    linear: [0, 0, 1, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
    circIn: [0.55, 0, 1, 0.45],
    circOut: [0, 0.55, 0.45, 1],
    circInOut: [0.85, 0, 0.15, 1],
    backIn: [0.36, 0, 0.66, -0.56],
    backOut: [0.34, 1.56, 0.64, 1],
    backInOut: [0.68, -0.6, 0.32, 1.6],
    anticipate: [0.38, -0.4, 0.6, 1],
}

function springCurve(stiffness: number, damping: number, mass: number) {
    const w0 = Math.sqrt(Math.max(stiffness, 1) / Math.max(mass, 0.01))
    const zeta = damping / (2 * Math.sqrt(Math.max(stiffness, 1) * Math.max(mass, 0.01)))
    let at: (t: number) => number
    if (zeta < 1) {
        const wd = w0 * Math.sqrt(1 - zeta * zeta)
        at = (t) =>
            1 -
            Math.exp(-zeta * w0 * t) *
                (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t))
    } else if (zeta === 1) {
        at = (t) => 1 - Math.exp(-w0 * t) * (1 + w0 * t)
    } else {
        const s = w0 * Math.sqrt(zeta * zeta - 1)
        const r1 = -zeta * w0 + s
        const r2 = -zeta * w0 - s
        at = (t) => 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1)
    }

    let duration = 6
    for (let t = 0.02; t <= 6; t += 0.02) {
        if (Math.abs(1 - at(t)) < 0.004) {
            duration = t
            break
        }
    }
    return { at, duration }
}

const transitionCache = new Map<string, { duration: number; ease: Ease; delay: number }>()

export function resolveTransition(t: FramerTransition | undefined, unit: number) {
    const key = `${unit}:${JSON.stringify(t ?? null)}`
    const hit = transitionCache.get(key)
    if (hit) return hit

    let duration = unit
    let ease: Ease = OUT3
    const delay = typeof t?.delay === "number" ? t.delay : -1

    const isSpring =
        t?.type === "spring" ||
        (t != null && t.type == null && (t.stiffness != null || t.bounce != null))

    if (isSpring && t) {
        if (t.bounce != null && t.duration != null) {
            const zeta = clamp(1 - t.bounce, 0.05, 1.5)
            const d = Math.max(0.05, t.duration)
            const w0 = 8 / d
            const curve = springCurve(w0 * w0, 2 * zeta * w0, 1)
            duration = curve.duration

            ease = (u) => (u >= 1 ? 1 : curve.at(u * duration))
        } else {
            const curve = springCurve(
                t.stiffness ?? 300,
                t.damping ?? 30,
                t.mass ?? 1
            )
            duration = curve.duration

            ease = (u) => (u >= 1 ? 1 : curve.at(u * duration))
        }
    } else if (t) {
        if (typeof t.duration === "number" && t.duration > 0) duration = t.duration
        const e = t.ease
        if (Array.isArray(e) && e.length === 4) {
            ease = cubicBezier(e[0], e[1], e[2], e[3])
        } else if (typeof e === "string" && NAMED_EASES[e]) {
            const p = NAMED_EASES[e]
            ease = cubicBezier(p[0], p[1], p[2], p[3])
        }
    }

    const out = { duration: clamp(duration, 0.05, 20), ease, delay }

    if (transitionCache.size > 64) transitionCache.clear()
    transitionCache.set(key, out)
    return out
}

export type NumBag = Record<string, number>

export const bag = (a: number[]) => a as unknown as NumBag

interface Track {
    obj: NumBag
    key: string
    from: number | null
    to: number
    dur: number
    at: number
    ease: Ease
}

export class Timeline {
    private tracks: Track[] = []
    private calls: { at: number; fn: () => void; fired: boolean }[] = []
    private time: number
    private dead = false

    constructor(delay = 0) {
        this.time = -delay
    }

    to(
        obj: NumBag,
        key: string | number,
        to: number,
        dur: number,
        ease: Ease,
        at = 0
    ) {
        this.tracks.push({
            obj,
            key: String(key),
            from: null,
            to,
            dur: Math.max(0.0001, dur),
            at,
            ease,
        })
        return this
    }

    call(fn: () => void, at: number) {
        this.calls.push({ at, fn, fired: false })
        return this
    }

    step(dt: number) {
        if (this.dead) return
        this.time += dt
        for (const tr of this.tracks) {
            const u = (this.time - tr.at) / tr.dur
            if (u < 0) continue
            if (tr.from === null) tr.from = tr.obj[tr.key] ?? 0
            tr.obj[tr.key] = tr.from + (tr.to - tr.from) * tr.ease(clamp01(u))
        }
        for (const c of this.calls) {
            if (!c.fired && this.time >= c.at) {
                c.fired = true
                c.fn()
            }
        }
    }

    kill() {
        this.dead = true
        this.tracks.length = 0
        this.calls.length = 0
    }
}
