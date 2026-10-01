// Three.js engine for the Liquid Glass Carousel. Ported from legacy/carousel.txt.

import * as THREE from "three"
import { lensFragmentShader, lensVertexShader } from "./lens.shader"
import {
    EXPO_INOUT,
    INOUT2,
    INOUT3,
    OUT3,
    Timeline,
    bag,
    clamp,
    clamp01,
    resolveTransition,
    type FramerTransition,
    type NumBag,
} from "./timeline"

interface EntryOffset {
    x: number
    y: number
}

type EntryPattern = (index: number, count: number, slot: number) => EntryOffset

const FROM_BOTTOM: EntryOffset = { x: 0, y: -1 }
const FROM_TOP: EntryOffset = { x: 0, y: 1 }

const ENTRY_PATTERNS: Record<string, EntryPattern> = {
    bottom: () => FROM_BOTTOM,
    top: () => FROM_TOP,

    alternate: (index) => (index % 2 === 0 ? FROM_TOP : FROM_BOTTOM),
}

interface CardScale {
    w: number
    h: number
}

type CardSizing = (index: number) => CardScale

const UNIFORM: CardScale = { w: 1, h: 1 }

const ALTERNATE_NARROW = 0.62

const hash01 = (n: number) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
    return x - Math.floor(x)
}

const SIZE_MODES: Record<string, CardSizing> = {
    same: () => UNIFORM,
    alternate: (i) => (i % 2 === 0 ? UNIFORM : { w: ALTERNATE_NARROW, h: 1 }),
    random: (i) => ({
        w: 0.6 + 0.4 * hash01(i),
        h: 0.7 + 0.3 * hash01(i + 97),
    }),

    image: () => UNIFORM,
}

export type ImageValue = string | { src?: string } | null | undefined

export interface CarouselItem {
    image?: ImageValue
    offsetY?: number
}

export type ItemValue = CarouselItem | ImageValue

const isItemObject = (v: ItemValue): v is CarouselItem =>
    typeof v === "object" && v !== null && ("image" in v || "offsetY" in v)

export const imageOf = (v: ItemValue): ImageValue => (isItemObject(v) ? v.image : v)

const offsetOf = (v: ItemValue): number => {
    if (!isItemObject(v)) return 0
    return typeof v.offsetY === "number" ? v.offsetY : 0
}

export interface LensSettings {
    shape?: "circle" | "square"
    width?: number
    height?: number
    rotation?: number
    dispersion?: number
    ringColor?: string
    /** Strength of the coloured ring + glow on the lens edge (0 = none). */
    ring?: number
}

export interface MotionSettings {
    sensitivity?: number
    glide?: number
    snap?: boolean
}

export interface EntrySettings {
    enabled?: boolean
    transition?: FramerTransition
    enterFrom?: string
}

export interface InteractionSettings {
    wheel?: boolean
    drag?: boolean
    clickToFocus?: boolean
    focusTransition?: FramerTransition
}

export interface CarouselSettings {
    items?: ItemValue[]
    background?: string
    sizeMode?: string
    cardWidth?: number
    cardHeight?: number

    panelHeight?: number
    gap?: number
    lens?: LensSettings
    motion?: MotionSettings
    entry?: EntrySettings
    interaction?: InteractionSettings
}

export const srcOf = (v: ImageValue): string =>
    typeof v === "string" ? v : typeof v?.src === "string" ? v.src : ""

function alphaOf(css: string): number {
    const rgba = /rgba?\(([^)]+)\)/i.exec(css)
    if (rgba) {
        const parts = rgba[1].split(/[\s,/]+/).filter(Boolean)
        return parts.length >= 4 ? clamp01(parseFloat(parts[3])) : 1
    }
    const hex = css.trim()
    if (/^#[0-9a-f]{8}$/i.test(hex)) return parseInt(hex.slice(7, 9), 16) / 255
    if (/^#[0-9a-f]{4}$/i.test(hex)) return parseInt(hex[4] + hex[4], 16) / 255
    return 1
}

export function makeParams(p: CarouselSettings) {
    const m = p.motion ?? {}
    const e = p.entry ?? {}
    const it = p.interaction ?? {}
    const l = p.lens ?? {}

    const sens = clamp(m.sensitivity ?? 5, 0.2, 10)
    const glide = clamp(m.glide ?? 5, 0, 10)

    const et = resolveTransition(e.transition, 1.0)
    const ts = et.duration / 1.0
    const ft = resolveTransition(it.focusTransition, 0.7)
    const fs = ft.duration / 0.7

    const lensAlpha = alphaOf(l.ringColor ?? "#009dff")

    const ease = clamp(0.18 * Math.pow(0.5, glide / 5), 0.02, 0.4)

    return {
        itemOffsets: (p.items ?? []).filter(Boolean).map(offsetOf),
        panelH: clamp(p.cardHeight ?? p.panelHeight ?? 450, 60, 1200),
        cardW: clamp(p.cardWidth ?? 340, 40, 1600),
        sizeMode: SIZE_MODES[p.sizeMode ?? "same"] ? p.sizeMode ?? "same" : "same",
        gap: clamp(p.gap ?? 12, 0, 200),
        shrinkMax: 0.25,
        shrinkSpeed: 60,
        shrinkAttack: 0.25,
        shrinkDecay: 0.06,

        ease,
        snapEase: ease * 0.56,
        wheelSpeed: 0.28 * sens,
        dragSpeed: 0.32 * sens,
        touchDrag: 1.0,
        touchEase: 0.22,
        friction: 0.865,
        snap: m.snap !== false,
        snapIdleMs: 120,
        clickSlop: 6,
        touchClickSlop: 12,
        flickIdleMs: 90,

        wheel: it.wheel !== false,
        drag: it.drag !== false,
        clickToFocus: it.clickToFocus !== false,

        focus: {
            cardDuration: ft.duration,
            focusDuration: 0.9 * fs,
            stagger: 0.06 * fs,
            dropDist: 1.4,
            centerScale: 1.18,
            lensFade: 0.85 * fs,
            ease: ft.ease,
        },

        entry: {
            enabled: e.enabled !== false,
            delay: et.delay >= 0 ? et.delay : 0.5 * ts,
            startH: 80,
            riseDuration: et.duration,
            ease: et.ease,
            stagger: 0.07 * ts,
            travel: 0.9,

            pattern:
                ENTRY_PATTERNS[e.enterFrom ?? "bottom"] ?? ENTRY_PATTERNS.bottom,
            growDelay: 0.25 * ts,
            growDuration: 2.15 * ts,
            growStagger: 0.085 * ts,
            outward: false,
            lensBloom: 1.4 * ts,
        },

        lens: {
            enabled: true,
            square: l.shape === "square",
            round: 0,
            sizeX: clamp(l.width ?? 0.565, 0.05, 3),
            sizeY: clamp(l.height ?? 1, 0.05, 3),
            posX: 0.5,
            posY: 0.5,
            rotation: l.rotation ?? 65,
            spin: 0,
            zoom: 0,
            dispersion: clamp(l.dispersion ?? 11, 0, 60),
            blur: 0,
            glow: 3,
            whiteGlow: 0.08,
            novaSize: 12,
            ring: clamp(l.ring ?? 1, 0, 4) * lensAlpha,
            ringRadius: 0.49,
            ringWidth: 0.014,
            ringColor: l.ringColor ?? "#009dff",
            shimmer: true,
            shimmerFreq: 12,
            shimmerSpeed: 3.5,
            shimmerDepth: 0.12,
            rimStart: 0.578,
            rimTangential: 0.6,
            rimInward: 0,
            rimFreq1: 2,
            rimFreq2: 1,
            rimLine: 0,
            rimLinePos: 0.488,
            rimLineWidth: 0.003,
            vignette: 0,
            vignetteSize: 0.3,
            samples: 16,
        },

        background: p.background ?? "#000000",
        cardColor: "#262626",
    }
}

export type Params = ReturnType<typeof makeParams>

const PLACEHOLDER_ASPECTS = [1.5, 0.78, 1.33, 1.0, 1.62, 0.72, 1.2, 1.45, 0.86, 1.7]

function placeholderTexture(index: number, aspect: number, color: string) {
    const h = 320
    const w = Math.max(1, Math.round(h * aspect))
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const g = canvas.getContext("2d")
    if (g) {
        g.fillStyle = color
        g.fillRect(0, 0, w, h)
        const grad = g.createLinearGradient(0, 0, w, h)
        grad.addColorStop(0, "rgba(255,255,255,0.16)")
        grad.addColorStop(0.55, "rgba(255,255,255,0.02)")
        grad.addColorStop(1, "rgba(255,255,255,0.1)")
        g.fillStyle = grad
        g.fillRect(0, 0, w, h)
        g.fillStyle = "rgba(255,255,255,0.6)"
        g.font = `500 ${Math.round(h * 0.14)}px ui-sans-serif, system-ui, -apple-system, sans-serif`
        g.textAlign = "center"
        g.textBaseline = "middle"
        g.fillText(String(index + 1).padStart(2, "0"), w / 2, h / 2)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.minFilter = THREE.LinearMipmapLinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = true
    return tex
}

const REPEATS = 4

interface EngineItem {
    src: string
    aspect: number | null
}

interface Source {
    tex: THREE.Texture | null
    aspect: number
    locked: boolean
    ph: boolean
}

interface Panel {
    mesh: THREE.Mesh
    mat: THREE.MeshBasicMaterial
    srcIndex: number
    bound: boolean
}

interface PanelRect {
    left: number
    right: number
    top: number
    bottom: number
    poolIdx: number
    srcIndex: number
    centerX: number
}

export interface EngineHooks {
    onEntryComplete?: () => void
}

export function createEngine(
    mount: HTMLElement,
    getParams: () => Params,
    getHooks: () => EngineHooks = () => ({})
) {
    let pp = getParams()
    const still = false
    let disposed = false

    let W = Math.max(1, mount.clientWidth)
    let H = Math.max(1, mount.clientHeight)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    renderer.setPixelRatio(still ? 1 : Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(W, H)

    const clearColor = new THREE.Color()
    let clearKey = ""
    function applyClear() {
        if (pp.background === clearKey) return
        clearKey = pp.background
        try {
            clearColor.set(pp.background)
        } catch {
            clearColor.set("#ffffff")
        }
        renderer.setClearColor(clearColor, 1)
    }
    applyClear()

    const el = renderer.domElement
    el.style.position = "absolute"
    el.style.left = "0"
    el.style.top = "0"
    el.style.display = "block"

    el.style.touchAction = "pan-y"
    el.style.userSelect = "none"
    el.style.setProperty("-webkit-user-select", "none")
    el.style.setProperty("-webkit-touch-callout", "none")
    el.style.setProperty("-webkit-tap-highlight-color", "transparent")
    mount.appendChild(el)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(
        -W / 2,
        W / 2,
        H / 2,
        -H / 2,
        -100,
        100
    )
    camera.position.z = 10

    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin("anonymous")

    let sources: Source[] = []
    let pool: Panel[] = []
    let owned: THREE.Texture[] = []
    let offsets: number[] = []
    let totalWidth = 0

    function panelHeight() {
        return Math.min(pp.panelH, Math.max(40, H * 0.86))
    }

    function sizing(srcIndex: number) {
        return (SIZE_MODES[pp.sizeMode] ?? SIZE_MODES.same)(srcIndex)
    }

    function cardHeight(srcIndex: number) {
        return panelHeight() * sizing(srcIndex).h
    }

    function widthAt(srcIndex: number, h: number) {
        if (pp.sizeMode === "image") return sources[srcIndex].aspect * h
        const rest = cardHeight(srcIndex)
        return pp.cardW * sizing(srcIndex).w * (rest > 0 ? h / rest : 1)
    }

    function slotWidth(srcIndex: number) {
        return widthAt(srcIndex, cardHeight(srcIndex)) + pp.gap
    }

    function coverWindow(srcIndex: number) {
        const h = cardHeight(srcIndex)
        const card = h > 0 ? widthAt(srcIndex, h) / h : 1
        const art = sources[srcIndex].aspect || 1
        if (Math.abs(card - art) < 1e-6) return { rx: 1, ox: 0, ry: 1, oy: 0 }
        if (card > art) {
            const ry = art / card
            return { rx: 1, ox: 0, ry, oy: (1 - ry) / 2 }
        }
        const rx = card / art
        return { rx, ox: (1 - rx) / 2, ry: 1, oy: 0 }
    }

    function recomputeTotal() {
        offsets = []
        let acc = 0
        for (let i = 0; i < sources.length; i++) {
            offsets.push(acc)
            acc += slotWidth(i)
        }
        totalWidth = acc
    }

    function centerForIndex(idx: number) {
        const N = sources.length
        if (!N) return 0
        const loop = Math.floor(idx / N)
        const s = ((idx % N) + N) % N
        return offsets[s] + slotWidth(s) / 2 - pp.gap / 2 + loop * totalWidth
    }

    function nearestIndex(value: number) {
        const N = sources.length
        if (!totalWidth || !N) return 0
        let best = 0
        let bestDist = Infinity
        for (let i = 0; i < N; i++) {
            const center = offsets[i] + slotWidth(i) / 2 - pp.gap / 2
            const k = Math.round((value - center) / totalWidth)
            const dist = Math.abs(center + k * totalWidth - value)
            if (dist < bestDist) {
                bestDist = dist
                best = i + k * N
            }
        }
        return best
    }

    function centerIndex(value: number) {
        if (!totalWidth || !sources.length) return 0
        let bestI = 0
        let bestDist = Infinity
        for (let i = 0; i < sources.length; i++) {
            const center = offsets[i] + slotWidth(i) / 2 - pp.gap / 2
            const k = Math.round((value - center) / totalWidth)
            const dist = Math.abs(center + k * totalWidth - value)
            if (dist < bestDist) {
                bestDist = dist
                bestI = i
            }
        }
        return bestI
    }

    let scroll = 0
    let target = 0
    let velocity = 0
    let prevScroll = 0
    let scrollEnergy = 0
    let pendingFocus: { srcIndex: number } | null = null
    let lastInput = performance.now()
    let snapped = false

    const focusState = {
        active: false,
        srcIndex: -1,
        poolIdx: -1,
        lensFx: 1,
    }
    const focusZoom = { v: 1 }
    let drop: number[] = []
    let pEntry: number[] = []
    let growArr: number[] = []
    let lastCenterX: (number | undefined)[] = []
    let entryActive = false
    let entrySettled = false
    let closing = false
    let focusTl: Timeline | null = null
    let entryTl: Timeline | null = null

    const dpr = renderer.getPixelRatio()
    const rt = new THREE.WebGLRenderTarget(
        Math.max(1, Math.round(W * dpr)),
        Math.max(1, Math.round(H * dpr))
    )
    const lensScene = new THREE.Scene()
    const lensCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const lensU = {
        uTex: { value: rt.texture as THREE.Texture },
        uRes: { value: new THREE.Vector2(W * dpr, H * dpr) },
        uCenter: { value: new THREE.Vector2(0.5, 0.5) },
        uSizeX: { value: 0.565 },
        uSizeY: { value: 1 },
        uShape: { value: 0 },
        uSquareRound: { value: 0 },
        uRotation: { value: 0 },
        uAspect: { value: W / H },
        uZoom: { value: 0 },
        uDispersion: { value: 11 },
        uBlur: { value: 0 },
        uGlow: { value: 4.2 },
        uWhiteGlow: { value: 0.24 },
        uNovaSize: { value: 12 },
        uBlueRing: { value: 6 },
        uRingRadius: { value: 0.49 },
        uRingWidth: { value: 0.014 },
        uShimmer: { value: 1 },
        uShimmerFreq: { value: 12 },
        uShimmerSpeed: { value: 3.5 },
        uShimmerDepth: { value: 0.12 },
        uTime: { value: 0 },
        uRimStart: { value: 0.578 },
        uRimTangential: { value: 0.6 },
        uRimInward: { value: 0 },
        uRimFreq1: { value: 2 },
        uRimFreq2: { value: 1 },
        uBlueColor: { value: new THREE.Color("#009dff") },
        uRimLine: { value: 1.4 },
        uRimLinePos: { value: 0.488 },
        uRimLineWidth: { value: 0.003 },
        uVignette: { value: 0 },
        uVignetteSize: { value: 0.3 },
        uSamples: { value: 16 },
    }
    const lensMat = new THREE.ShaderMaterial({
        uniforms: lensU,
        vertexShader: lensVertexShader,
        fragmentShader: lensFragmentShader,
    })
    const lensQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lensMat)
    lensScene.add(lensQuad)

    try {
        renderer.compile(lensScene, lensCam)
    } catch {}

    let ringKey = ""
    function syncLens(now: number) {
        const L = pp.lens
        const rad = (a: number) => (a * Math.PI) / 180
        lensU.uCenter.value.set(L.posX, L.posY)
        lensU.uAspect.value = W / H
        lensU.uTime.value = now * 0.001
        lensU.uRotation.value = rad(L.rotation) + rad(L.spin) * (now * 0.001)
        lensU.uSizeX.value = L.sizeX
        lensU.uSizeY.value = L.sizeY
        lensU.uShape.value = L.square ? 1 : 0
        lensU.uSquareRound.value = L.round
        lensU.uBlur.value = L.blur
        lensU.uGlow.value = L.glow
        lensU.uWhiteGlow.value = L.whiteGlow
        lensU.uNovaSize.value = L.novaSize
        lensU.uRingRadius.value = L.ringRadius
        lensU.uRingWidth.value = L.ringWidth
        lensU.uShimmer.value = L.shimmer ? 1 : 0
        lensU.uShimmerFreq.value = L.shimmerFreq
        lensU.uShimmerSpeed.value = L.shimmerSpeed
        lensU.uShimmerDepth.value = L.shimmerDepth
        lensU.uRimStart.value = L.rimStart
        lensU.uRimFreq1.value = L.rimFreq1
        lensU.uRimFreq2.value = L.rimFreq2
        lensU.uRimLinePos.value = L.rimLinePos
        lensU.uRimLineWidth.value = L.rimLineWidth
        lensU.uVignetteSize.value = L.vignetteSize
        lensU.uSamples.value = L.samples
        if (L.ringColor !== ringKey) {
            ringKey = L.ringColor
            try {
                lensU.uBlueColor.value.set(L.ringColor)
            } catch {
                lensU.uBlueColor.value.set("#009dff")
            }
        }

        const fx = focusState.lensFx
        lensU.uDispersion.value = L.dispersion * fx
        lensU.uBlueRing.value = L.ring * fx
        lensU.uRimLine.value = L.rimLine * fx
        lensU.uVignette.value = L.vignette * fx
        lensU.uZoom.value = L.zoom * fx
        lensU.uRimTangential.value = L.rimTangential * fx
        lensU.uRimInward.value = L.rimInward * fx
    }

    function disposeContent() {
        pool.forEach((p) => {
            scene.remove(p.mesh)
            p.mesh.geometry.dispose()
            p.mat.dispose()
        })
        pool = []
        owned.forEach((t) => t.dispose())
        owned = []
        sources = []
    }

    let generation = 0

    let ready = false
    let awaiting = 0
    let bootTimer: ReturnType<typeof setTimeout> | null = null

    function boot() {
        if (disposed || ready) return
        if (bootTimer !== null) {
            clearTimeout(bootTimer)
            bootTimer = null
        }
        ready = true
        recomputeTotal()

        scroll = centerForIndex(nearestIndex(scroll))
        target = scroll
        prevScroll = scroll
        if (!still && pp.entry.enabled) {
            // Park the cards below the frame until play() is called.
            armEntry()
            if (playRequested) playEntry()
        } else {
            entryActive = false
            entrySettled = false
            getHooks().onEntryComplete?.()
        }
        if (still) frame()
    }

    // The intro waits for play() (e.g. when the carousel scrolls into view).
    let playRequested = false
    function play() {
        if (playRequested) return
        playRequested = true
        if (ready && pp.entry.enabled) playEntry()
    }

    function setItems(list: EngineItem[]) {
        if (disposed) return
        pp = getParams()
        disposeContent()
        const gen = ++generation
        ready = false
        if (bootTimer !== null) clearTimeout(bootTimer)
        awaiting = list.filter((item) => !!item.src).length

        bootTimer =
            awaiting > 0 ? setTimeout(boot, 6000) : null

        sources = list.map((item, i) => {
            const s: Source = {
                tex: null,
                aspect: item.aspect || 1,
                locked: item.aspect != null,
                ph: false,
            }
            if (!item.src) {
                s.ph = true
                s.tex = placeholderTexture(i, s.aspect, pp.cardColor)
                owned.push(s.tex)
                return s
            }
            loader.load(
                item.src,
                (tex) => {
                    if (disposed || gen !== generation) {
                        tex.dispose()
                        return
                    }

                    tex.minFilter = THREE.LinearMipmapLinearFilter
                    tex.magFilter = THREE.LinearFilter
                    tex.generateMipmaps = true
                    tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
                    tex.colorSpace = THREE.SRGBColorSpace
                    if (!s.locked && tex.image)
                        s.aspect = tex.image.width / tex.image.height
                    s.tex = tex
                    owned.push(tex)

                    try {
                        renderer.initTexture(tex)
                    } catch {}
                    recomputeTotal()
                    if (--awaiting <= 0) boot()
                    else if (still) frame()
                },
                undefined,
                () => {
                    if (disposed || gen !== generation) return
                    s.ph = true
                    s.tex = placeholderTexture(i, s.aspect, pp.cardColor)
                    owned.push(s.tex)
                    if (--awaiting <= 0) boot()
                    else if (still) frame()
                }
            )
            return s
        })

        for (let r = 0; r < REPEATS; r++) {
            for (let i = 0; i < sources.length; i++) {
                const mat = new THREE.MeshBasicMaterial({
                    color: 0xdddddd,
                    transparent: true,
                })
                const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), mat)
                mesh.visible = false
                scene.add(mesh)
                pool.push({ mesh, mat, srcIndex: i, bound: false })
            }
        }

        recomputeTotal()
        cardKey = pp.cardColor
        const n = pool.length
        drop = new Array(n).fill(0)
        pEntry = new Array(n).fill(1)
        growArr = new Array(n).fill(1)
        lastCenterX = new Array(n)
        focusState.active = false
        focusState.srcIndex = -1
        focusState.poolIdx = -1
        focusState.lensFx = 1
        focusZoom.v = 1
        velocity = 0
        scroll = centerForIndex(0)
        target = scroll
        prevScroll = scroll

        if (focusTl) focusTl.kill()
        focusTl = null
        if (entryTl) entryTl.kill()
        entryTl = null

        if (awaiting <= 0) boot()
    }

    function syncWindows() {
        for (let i = 0; i < sources.length; i++) {
            const tex = sources[i].tex
            if (!tex) continue
            const base = coverWindow(i)
            const t = clamp((pp.itemOffsets[i] ?? 0) / 250, -1, 1)
            const slack = 1 - base.ry
            tex.repeat.set(base.rx, base.ry)

            tex.offset.set(base.ox, slack * (0.5 + 0.5 * t))
        }
    }

    let cardKey = ""
    function syncCardColor() {
        if (pp.cardColor === cardKey) return
        cardKey = pp.cardColor
        sources.forEach((s, i) => {
            if (!s.ph) return
            const old = s.tex
            s.tex = placeholderTexture(i, s.aspect, pp.cardColor)
            owned.push(s.tex)
            if (old) {
                owned = owned.filter((t) => t !== old)
                old.dispose()
            }
            pool.forEach((p) => {
                if (p.srcIndex !== i) return
                p.mat.map = s.tex
                p.mat.needsUpdate = true
            })
        })
    }

    let panelRects: PanelRect[] = []
    let centeredPanel: {
        srcIndex: number
        centerX: number
        wPx: number
        h: number
        poolIdx: number
    } | null = null

    function layout() {
        panelRects = []
        centeredPanel = null
        let centeredDist = Infinity
        const N = sources.length
        if (!N || !totalWidth || !ready) {
            for (const p of pool) p.mesh.visible = false
            return
        }
        const half = W / 2
        const panelH = panelHeight()
        const buffer = panelH
        const E = pp.entry

        pool.forEach((p, poolIdx) => {
            const rep = Math.floor(poolIdx / N)
            const i = p.srcIndex
            const src = sources[i]

            const slotCenterInLoop = offsets[i] + slotWidth(i) / 2 - pp.gap / 2
            let x = slotCenterInLoop - scroll
            x = ((x % totalWidth) + totalWidth) % totalWidth
            x += (rep - Math.floor(REPEATS / 2)) * totalWidth
            if (x > half + totalWidth) x -= totalWidth * REPEATS

            const centerX = x
            const inEntry = entryActive || entrySettled
            if (!inEntry && (centerX < -half - buffer || centerX > half + buffer)) {
                p.mesh.visible = false
                lastCenterX[poolIdx] = undefined
                return
            }
            lastCenterX[poolIdx] = centerX

            const shrink = 1 - pp.shrinkMax * scrollEnergy
            const h = cardHeight(i) * shrink
            const wPx = widthAt(i, h)

            if (src.tex && !p.bound) {
                p.mat.map = src.tex
                p.mat.color.set(0xffffff)
                p.mat.needsUpdate = true
                p.bound = true
            }

            let y = 0

            const isFocused = focusState.active && focusState.poolIdx === poolIdx
            const d = drop[poolIdx] || 0
            let drawW = wPx
            let drawH = h
            if (isFocused) {
                drawW = wPx * focusZoom.v
                drawH = h * focusZoom.v
            } else if (d > 0) {
                y -= d * H * pp.focus.dropDist
            }

            p.mesh.visible = true

            let finalX = centerX
            let finalY = y
            let finalW = drawW
            let finalH = drawH

            if (inEntry) {
                const pe = pEntry[poolIdx] || 0
                const g = growArr[poolIdx] || 0

                const startH = Math.min(E.startH, panelH * 0.5)
                const curH = startH + (drawH - startH) * g
                finalH = curH
                finalW = widthAt(i, curH)

                const midRep = Math.floor(REPEATS / 2)
                if (rep !== midRep) {
                    p.mesh.visible = false
                    lastCenterX[poolIdx] = undefined
                    return
                }
                const cSrc = centerIndex(scroll)
                let di = i - cSrc
                if (di > N / 2) di -= N
                if (di < -N / 2) di += N
                const slotH = (s: number) => {
                    const gg = growArr[midRep * N + s] || 0
                    return startH + (cardHeight(s) - startH) * gg
                }
                let off = 0
                if (di > 0) {
                    for (let k = 0; k < di; k++) {
                        const sa = (((cSrc + k) % N) + N) % N
                        const sb = (((cSrc + k + 1) % N) + N) % N
                        off +=
                            (widthAt(sa, slotH(sa)) + widthAt(sb, slotH(sb))) /
                                2 +
                            pp.gap
                    }
                } else if (di < 0) {
                    for (let k = 0; k < -di; k++) {
                        const sa = (((cSrc - k) % N) + N) % N
                        const sb = (((cSrc - k - 1) % N) + N) % N
                        off -=
                            (widthAt(sa, slotH(sa)) + widthAt(sb, slotH(sb))) /
                                2 +
                            pp.gap
                    }
                }
                finalX = off
                if (finalX < -half - buffer || finalX > half + buffer) {
                    p.mesh.visible = false
                    lastCenterX[poolIdx] = undefined
                    return
                }

                const dir = E.pattern(i, N, di)
                const fromX = finalX + dir.x * W * E.travel
                const fromY = dir.y * H * E.travel
                finalX = fromX + (finalX - fromX) * pe
                finalY = fromY + (y - fromY) * pe
            }

            p.mesh.position.set(finalX, finalY, 0)
            p.mesh.scale.set(Math.max(1, finalW), Math.max(1, finalH), 1)

            const sx = centerX + W / 2
            const sy = H / 2 - y
            panelRects.push({
                left: sx - drawW / 2,
                right: sx + drawW / 2,
                top: sy - drawH / 2,
                bottom: sy + drawH / 2,
                poolIdx,
                srcIndex: i,
                centerX,
            })

            if (Math.abs(centerX) < centeredDist) {
                centeredDist = Math.abs(centerX)
                centeredPanel = { srcIndex: i, centerX, wPx, h, poolIdx }
            }
        })
    }

    function panelAtPointer(px: number, py: number) {
        for (let i = 0; i < panelRects.length; i++) {
            const r = panelRects[i]
            if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom)
                return r
        }
        return null
    }

    let bounds = mount.getBoundingClientRect()
    const readBounds = () => {
        bounds = mount.getBoundingClientRect()
    }

    let dragging = false
    let dragPointerId: number | null = null
    let dragLastX = 0
    let dragDist = 0
    let dragVel = 0
    let dragMoveT = 0
    let suppressClick = false
    let dragPointerType = "mouse"
    let lastPointerX = NaN
    let lastPointerY = NaN
    let pointerInside = false
    let lastPointerType = "mouse"

    let hoverPanel = false
    let hoverFocused = false

    let cursorNow = ""
    function setCursor(v: string) {
        if (v === cursorNow) return
        cursorNow = v
        el.style.cursor = v
    }

    function updateCursor() {
        if (entryActive || entrySettled) return setCursor("")

        if (focusState.active) {
            return setCursor(hoverFocused ? "" : "zoom-out")
        }
        if (dragging) return setCursor("grabbing")
        if (!hoverPanel) return setCursor("")
        if (pp.drag) return setCursor("grab")
        return setCursor(pp.clickToFocus ? "pointer" : "")
    }

    function setHover(on: boolean) {
        hoverPanel = on
        updateCursor()
    }

    function refreshHover() {
        if (!pointerInside || lastPointerType !== "mouse") return
        if (!Number.isFinite(lastPointerX)) return
        if (focusState.active) {
            const on = panelAtPointer(lastPointerX, lastPointerY)
            hoverFocused = !!on && on.poolIdx === focusState.poolIdx
            setHover(false)
            return
        }
        hoverFocused = false
        setHover(panelAtPointer(lastPointerX, lastPointerY) !== null)
    }

    function inputLocked() {
        return focusState.active || entryActive || entrySettled
    }

    function onWheel(e: WheelEvent) {
        if (!pp.wheel) return
        // Only sideways gestures (trackpad swipe, shift+wheel) spin the carousel;
        // vertical wheel falls through so the page keeps scrolling. Same split
        // as Lenis' data-lenis-prevent-horizontal on the container.
        if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return
        e.preventDefault()
        if (inputLocked()) return
        pendingFocus = null
        target += e.deltaX * pp.wheelSpeed
        lastInput = performance.now()
        snapped = false
    }

    function onPointerDown(e: PointerEvent) {
        suppressClick = false
        readBounds()
        if (!pp.drag || inputLocked()) return
        if (dragging) return
        if (e.button !== 0 && e.pointerType === "mouse") return
        dragging = true
        dragPointerId = e.pointerId
        dragPointerType = e.pointerType || "mouse"
        try {
            el.setPointerCapture(e.pointerId)
        } catch {}
        dragLastX = e.clientX
        lastPointerX = e.clientX - bounds.left
        lastPointerY = e.clientY - bounds.top
        dragDist = 0
        dragVel = 0
        dragMoveT = performance.now()
        updateCursor()
        velocity = 0
        pendingFocus = null
        snapped = false
        lastInput = dragMoveT
    }

    function onPointerMove(e: PointerEvent) {
        if (dragging && e.pointerId === dragPointerId) {
            const sens =
                dragPointerType === "mouse" ? pp.dragSpeed : pp.touchDrag
            const dx = e.clientX - dragLastX
            dragLastX = e.clientX
            dragDist += Math.abs(dx)
            target -= dx * sens

            dragVel = dragVel * 0.6 + -dx * sens * 0.4
            dragMoveT = performance.now()
            lastInput = dragMoveT
            snapped = false
        }
        lastPointerX = e.clientX - bounds.left
        lastPointerY = e.clientY - bounds.top
        lastPointerType = e.pointerType || "mouse"
        pointerInside = true

        if (e.pointerType !== "mouse") return
        if (focusState.active) {
            setHover(false)
            return
        }
        setHover(panelAtPointer(lastPointerX, lastPointerY) !== null)
    }

    function onPointerUp(e?: PointerEvent) {
        if (!dragging) return

        if (e && dragPointerId !== null && e.pointerId !== dragPointerId) return
        dragging = false
        if (dragPointerId !== null) {
            try {
                el.releasePointerCapture(dragPointerId)
            } catch {}
            dragPointerId = null
        }

        velocity =
            performance.now() - dragMoveT > pp.flickIdleMs ? 0 : dragVel
        dragVel = 0
        lastInput = performance.now()
        snapped = false
        suppressClick =
            dragDist >
            (dragPointerType === "mouse" ? pp.clickSlop : pp.touchClickSlop)
        if (dragPointerType === "mouse")
            setHover(panelAtPointer(lastPointerX, lastPointerY) !== null)
        else updateCursor()
    }

    function onEnter(e: PointerEvent) {
        pointerInside = true
        lastPointerType = e.pointerType || "mouse"
        readBounds()
    }

    function onLeave() {
        pointerInside = false
        setHover(false)
    }

    function onKeyDown(e: KeyboardEvent) {
        if (e.key !== "Escape" || !focusState.active) return
        e.preventDefault()
        closeFocus()
    }

    function onClick(e: MouseEvent) {
        if (!pp.clickToFocus) return
        if (suppressClick) {
            suppressClick = false
            return
        }

        if (focusState.active) {
            const on = panelAtPointer(
                e.clientX - bounds.left,
                e.clientY - bounds.top
            )
            if (!on || on.poolIdx !== focusState.poolIdx) closeFocus()
            return
        }
        if (inputLocked()) return
        const hit = panelAtPointer(e.clientX - bounds.left, e.clientY - bounds.top)
        if (!hit) return

        if (centeredPanel && hit.poolIdx === centeredPanel.poolIdx) {
            pendingFocus = null
            openFocus()
            return
        }
        velocity = 0
        target = centerForIndex(nearestIndex(scroll + hit.centerX))
        snapped = true
        pendingFocus = { srcIndex: hit.srcIndex }
        updateCursor()
    }

    function openFocus() {
        if (focusState.active || !centeredPanel) return
        const F = pp.focus
        const panel = centeredPanel
        const src = sources[panel.srcIndex]
        if (!src || !src.tex) return

        focusState.active = true
        closing = false
        focusState.srcIndex = panel.srcIndex
        focusState.poolIdx = panel.poolIdx

        target = centerForIndex(nearestIndex(scroll))

        const focusX = lastCenterX[panel.poolIdx] || 0
        const others = pool
            .map((p, idx) => ({ idx, x: lastCenterX[idx] }))
            .filter((o) => o.idx !== panel.poolIdx && o.x !== undefined)
            .map((o) => ({ idx: o.idx, dist: Math.abs((o.x as number) - focusX) }))
            .sort((a, b) => a.dist - b.dist)

        let rank = 0
        let prevDist = -1
        const ranked = others.map((o) => {
            if (prevDist >= 0 && o.dist - prevDist > 1) rank++
            prevDist = o.dist
            return { idx: o.idx, rank }
        })

        if (focusTl) focusTl.kill()
        const tl = new Timeline()
        tl.to(focusState as unknown as NumBag, "lensFx", 0, F.lensFade, OUT3, 0)
        tl.to(focusZoom, "v", F.centerScale, F.focusDuration, F.ease, 0)
        ranked.forEach((o) => {
            tl.to(bag(drop), o.idx, 1, F.cardDuration, F.ease, o.rank * F.stagger)
        })
        focusTl = tl

        updateCursor()
    }

    function closeFocus() {
        if (!focusState.active || closing) return
        closing = true
        const F = pp.focus
        if (focusTl) focusTl.kill()

        const focusX = lastCenterX[focusState.poolIdx] || 0
        const others = pool
            .map((p, idx) => ({ idx, x: lastCenterX[idx] }))
            .filter((o) => o.x !== undefined && (drop[o.idx] || 0) > 0)
            .map((o) => ({ idx: o.idx, dist: Math.abs((o.x as number) - focusX) }))
            .sort((a, b) => b.dist - a.dist)

        let rank = 0
        let prevDist = -1
        const ranked = others.map((o) => {
            if (prevDist >= 0 && prevDist - o.dist > 1) rank++
            prevDist = o.dist
            return { idx: o.idx, rank }
        })

        const tl = new Timeline()
        tl.to(
            focusState as unknown as NumBag,
            "lensFx",
            1,
            F.lensFade * 0.8,
            INOUT3,
            0
        )
        tl.to(focusZoom, "v", 1, F.focusDuration * 0.85, F.ease, 0)
        let end = Math.max(F.lensFade * 0.8, F.focusDuration * 0.85)
        ranked.forEach((o) => {
            const at = o.rank * F.stagger * 0.7
            end = Math.max(end, at + F.cardDuration * 0.85)
            tl.to(bag(drop), o.idx, 0, F.cardDuration * 0.85, F.ease, at)
        })
        tl.call(() => {
            focusState.active = false
            focusState.srcIndex = -1
            focusState.poolIdx = -1
            closing = false
            updateCursor()
        }, end)
        focusTl = tl
    }

    function armEntry() {
        for (let k = 0; k < pEntry.length; k++) pEntry[k] = 0
        for (let k = 0; k < growArr.length; k++) growArr[k] = 0
        entryActive = true
        entrySettled = false
        focusState.lensFx = 0

        target = centerForIndex(nearestIndex(scroll))
        scroll = target
        velocity = 0
        snapped = true
    }

    function playEntry() {
        if (!sources.length) return
        const E = pp.entry
        if (entryTl) entryTl.kill()
        const N = sources.length
        armEntry()

        layout()
        const visible: number[] = []
        for (let k = 0; k < lastCenterX.length; k++) {
            if (lastCenterX[k] !== undefined) visible.push(k)
        }

        const tl = new Timeline(E.delay)

        const spread = E.stagger * Math.max(visible.length - 1, 1)
        let lastRiseEnd = 0
        visible.forEach((idx) => {
            const at = Math.random() * spread
            lastRiseEnd = Math.max(lastRiseEnd, at + E.riseDuration)
            tl.to(bag(pEntry), idx, 1, E.riseDuration, E.ease, at)
        })

        tl.call(() => {
            entryActive = false
            entrySettled = true
        }, lastRiseEnd)

        const cSrcG = centerIndex(scroll)
        const midRepG = Math.floor(REPEATS / 2)
        const growList: { idx: number; rank: number }[] = []
        let maxRank = 0
        for (let k = 0; k < lastCenterX.length; k++) {
            if (lastCenterX[k] === undefined) continue
            if (Math.floor(k / N) !== midRepG) continue
            let di = (k % N) - cSrcG
            if (di > N / 2) di -= N
            if (di < -N / 2) di += N
            const r = Math.abs(di)
            maxRank = Math.max(maxRank, r)
            growList.push({ idx: k, rank: r })
        }

        const growStart = lastRiseEnd + E.growDelay
        let growEnd = growStart

        tl.to(
            focusState as unknown as NumBag,
            "lensFx",
            1,
            E.lensBloom,
            INOUT2,
            growStart
        )

        growList.forEach((o) => {
            const rank = E.outward ? o.rank : maxRank - o.rank
            const at = growStart + rank * E.growStagger
            growEnd = Math.max(growEnd, at + E.growDuration)
            tl.to(bag(growArr), o.idx, 1, E.growDuration, EXPO_INOUT, at)
        })

        tl.call(() => {
            entrySettled = false
            for (let k = 0; k < growArr.length; k++) growArr[k] = 1
            updateCursor()
            getHooks().onEntryComplete?.()
        }, growEnd)
        entryTl = tl
    }

    let raf = 0
    let lastT = performance.now()

    function step(dt: number) {
        pp = getParams()
        applyClear()
        const now = performance.now()

        const f = clamp(dt * 60, 0.1, 4)
        const lerp = (k: number) => 1 - Math.pow(1 - clamp01(k), f)

        if (entryTl) entryTl.step(dt)
        if (focusTl) focusTl.step(dt)

        if (!dragging) {
            target += velocity * f
            velocity *= Math.pow(pp.friction, f)
            if (Math.abs(velocity) < 0.05) velocity = 0

            if (
                pp.snap &&
                !snapped &&
                !focusState.active &&
                now - lastInput > pp.snapIdleMs
            ) {
                target = centerForIndex(nearestIndex(scroll))
                snapped = true
            }
        }

        const base =
            dragging && dragPointerType !== "mouse"
                ? pp.touchEase
                : snapped && !pendingFocus
                  ? pp.snapEase
                  : pp.ease
        scroll += (target - scroll) * lerp(base)

        const rawSpeed = (scroll - prevScroll) / f
        prevScroll = scroll
        const norm = Math.min(1, Math.abs(rawSpeed) / Math.max(1, pp.shrinkSpeed))
        const k = norm > scrollEnergy ? pp.shrinkAttack : pp.shrinkDecay
        scrollEnergy += (norm - scrollEnergy) * lerp(k)

        syncCardColor()
        syncWindows()
        layout()
        refreshHover()

        if (pendingFocus && !focusState.active) {
            if (Math.abs(target - scroll) < 0.5) {
                const pf = pendingFocus
                pendingFocus = null
                if (centeredPanel && centeredPanel.srcIndex === pf.srcIndex)
                    openFocus()
            }
        }

        syncLens(now)
        draw()
    }

    function draw() {
        if (pp.lens.enabled) {
            renderer.setRenderTarget(rt)
            renderer.render(scene, camera)
            renderer.setRenderTarget(null)
            renderer.render(lensScene, lensCam)
        } else {
            renderer.setRenderTarget(null)
            renderer.render(scene, camera)
        }
    }

    let frameReq = 0
    function paintOnce() {
        if (disposed) return
        pp = getParams()
        applyClear()
        syncCardColor()
        syncWindows()
        layout()
        syncLens(performance.now())
        draw()
    }
    function frame() {
        if (disposed || !still) return
        if (frameReq) return
        frameReq = requestAnimationFrame(() => {
            frameReq = 0
            paintOnce()
        })
    }

    function tick(t: number) {
        raf = requestAnimationFrame(tick)
        const dt = Math.min(0.05, Math.max(0, (t - lastT) / 1000))
        lastT = t
        step(dt)
    }

    // Stops/starts the render loop (e.g. while the carousel is off-screen).
    let active = true
    function setActive(on: boolean) {
        if (disposed || on === active) return
        active = on
        if (on) {
            lastT = performance.now()
            raf = requestAnimationFrame(tick)
        } else {
            cancelAnimationFrame(raf)
            raf = 0
        }
    }

    function resize() {
        const nw = Math.max(1, mount.clientWidth)
        const nh = Math.max(1, mount.clientHeight)
        if (nw === W && nh === H) return
        W = nw
        H = nh
        renderer.setSize(W, H)
        camera.left = -W / 2
        camera.right = W / 2
        camera.top = H / 2
        camera.bottom = -H / 2
        camera.updateProjectionMatrix()
        rt.setSize(Math.max(1, Math.round(W * dpr)), Math.max(1, Math.round(H * dpr)))
        lensU.uRes.value.set(W * dpr, H * dpr)
        readBounds()
    }

    const ro = new ResizeObserver(() => {
        resize()
        if (still) frame()
    })
    ro.observe(mount)

    if (!still) {
        el.addEventListener("wheel", onWheel, { passive: false })
        el.addEventListener("pointerdown", onPointerDown)
        el.addEventListener("pointermove", onPointerMove)
        el.addEventListener("pointerup", onPointerUp)
        el.addEventListener("pointercancel", onPointerUp)
        el.addEventListener("pointerenter", onEnter)
        el.addEventListener("pointerleave", onLeave)
        el.addEventListener("click", onClick)
        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("scroll", readBounds, { passive: true })
        window.addEventListener("resize", readBounds)
        raf = requestAnimationFrame(tick)
    }

    function destroy() {
        disposed = true
        if (bootTimer !== null) clearTimeout(bootTimer)
        if (frameReq) cancelAnimationFrame(frameReq)
        cancelAnimationFrame(raf)
        ro.disconnect()
        el.removeEventListener("wheel", onWheel)
        el.removeEventListener("pointerdown", onPointerDown)
        el.removeEventListener("pointermove", onPointerMove)
        el.removeEventListener("pointerup", onPointerUp)
        el.removeEventListener("pointercancel", onPointerUp)
        el.removeEventListener("pointerenter", onEnter)
        el.removeEventListener("pointerleave", onLeave)
        el.removeEventListener("click", onClick)
        window.removeEventListener("keydown", onKeyDown)
        window.removeEventListener("scroll", readBounds)
        window.removeEventListener("resize", readBounds)
        if (focusTl) focusTl.kill()
        if (entryTl) entryTl.kill()
        disposeContent()
        rt.dispose()
        lensQuad.geometry.dispose()
        lensMat.dispose()

        renderer.dispose()
        renderer.forceContextLoss()
        if (el.parentNode) el.parentNode.removeChild(el)
    }

    return { setItems, closeFocus, replayEntry: playEntry, play, setActive, frame, destroy }
}

export type Engine = ReturnType<typeof createEngine>

interface ResolvedItem {
    src: string
    aspect: number | null
}

export function resolveItems(items?: ItemValue[]): ResolvedItem[] {
    const list = (items ?? []).filter(Boolean)
    if (!list.length) {
        return PLACEHOLDER_ASPECTS.map((a) => ({ src: "", aspect: a }))
    }
    return list.map((it, i) => {
        const src = srcOf(imageOf(it))
        return {
            src,

            aspect: src ? null : PLACEHOLDER_ASPECTS[i % PLACEHOLDER_ASPECTS.length],
        }
    })
}
