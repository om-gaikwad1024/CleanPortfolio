"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import ArrowButton from "@/components/ArrowButton/ArrowButton";
import { latest } from "@/content/latest";
import styles from "./LatestProject.module.css";

type Props = {
  /** Root card (positioned and scaled by Experience on wide screens). */
  ref?: Ref<HTMLElement>;
  /** Fill of the "scroll to next section" bar (scaled 0–1 by Experience). */
  fillRef?: Ref<HTMLSpanElement>;
};

// The latest project: a looping preview video (muted, with a speaker toggle),
// then tag, title, description, tech stack and links — plus a bar showing how
// much scrolling is left before Experience.
export default function LatestProject({ ref, fillRef }: Props) {
  const { labels } = latest;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  // Only play while the video is actually on screen.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    if (!video.muted) video.play().catch(() => {});
    setMuted(video.muted);
  };

  return (
    <article ref={ref} className={styles.card} aria-label={latest.tag}>
      <div className={styles.imageBox}>
        <video
          ref={videoRef}
          className={styles.image}
          src={latest.video.src}
          aria-label={latest.video.label}
          muted
          loop
          playsInline
          preload="metadata"
        />
        <button
          type="button"
          className={styles.sound}
          onClick={toggleSound}
          aria-label={muted ? labels.unmute : labels.mute}
          aria-pressed={!muted}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path className={styles.speaker} d="M11 5 6 9H3v6h3l5 4V5z" />
            {muted ? (
              <path d="M16 9.5l5 5M21 9.5l-5 5" />
            ) : (
              <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
            )}
          </svg>
        </button>
      </div>
      <div className={styles.text}>
        <p className={styles.tag}>{latest.tag}</p>
        <h3 className={styles.title}>{latest.title}</h3>
        <p className={styles.desc}>{latest.description}</p>
        <ul className={styles.stack} aria-label={labels.stack}>
          {latest.stack.map((tech) => (
            <li key={tech} className={styles.chip}>
              {tech}
            </li>
          ))}
        </ul>
        <div className={styles.links}>
          {latest.live?.trim() && (
            <ArrowButton href={latest.live} target="_blank" rel="noopener noreferrer">
              {labels.live}
            </ArrowButton>
          )}
          <ArrowButton href={latest.github} variant="outline" target="_blank" rel="noopener noreferrer">
            {labels.github}
          </ArrowButton>
        </div>
        <div className={styles.next} aria-hidden="true">
          <span>{labels.next}</span>
          <span className={styles.bar}>
            <span ref={fillRef} className={styles.fill} />
          </span>
        </div>
      </div>
    </article>
  );
}
