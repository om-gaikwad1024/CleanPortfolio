"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import {
  createEngine,
  imageOf,
  makeParams,
  resolveItems,
  srcOf,
  type CarouselSettings,
  type Engine,
  type EngineHooks,
} from "./engine";
import { markReady } from "@/lib/loading";
import styles from "./LiquidCarousel.module.css";

export type LiquidCarouselProps = CarouselSettings & {
  /** Plays the intro (rise → arrange → zoom) once true; cards wait hidden until then. */
  play?: boolean;
  /** Runs the render loop; turn off while the carousel is off-screen. */
  active?: boolean;
  onEntryComplete?: () => void;
  style?: CSSProperties;
};

// Liquid Glass Carousel (Three.js): drag / swipe to spin, click to center, click again to focus.
export default function LiquidCarousel({
  play = true,
  active = true,
  onEntryComplete,
  style,
  ...settings
}: LiquidCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);

  // Latest settings / callbacks, read by the engine every frame.
  const paramsRef = useRef(makeParams(settings));
  const hooksRef = useRef<EngineHooks>({ onEntryComplete });
  useEffect(() => {
    paramsRef.current = makeParams(settings);
    hooksRef.current = { onEntryComplete };
  });

  // Only reload textures when the image list actually changes.
  const itemsKey = (settings.items ?? []).map((it) => srcOf(imageOf(it))).join("~");
  const items = useMemo(
    () => resolveItems(itemsKey ? itemsKey.split("~") : []),
    [itemsKey],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let engine: Engine | null = null;
    try {
      engine = createEngine(
        container,
        () => paramsRef.current,
        () => hooksRef.current,
      );
    } catch {
      markReady("carousel");
      return;
    }
    // Renderer + lens shader are compiled; the heavy start-up is done.
    markReady("carousel");
    engineRef.current = engine;
    return () => {
      engineRef.current = null;
      engine?.destroy();
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setItems(items.map((i) => ({ src: i.src, aspect: i.aspect })));
  }, [items]);

  useEffect(() => {
    if (play) engineRef.current?.play();
  }, [play]);

  useEffect(() => {
    engineRef.current?.setActive(active);
  }, [active]);

  return (
    <div
      ref={containerRef}
      className={styles.root}
      // Sideways gestures belong to the carousel; vertical ones still scroll the page.
      data-lenis-prevent-horizontal=""
      style={{ background: settings.background ?? "#000000", ...style }}
    />
  );
}
