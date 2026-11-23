"use client";

import { memo } from "react";
import type { AudioStatus } from "@/lib/music/audio/engine";
import { NO_SOUND } from "./copy";
import { MAX_BPM, MIN_BPM } from "./model";
import "./Transport.css";

type Props = {
  playing: boolean;
  bpm: number;
  loop: boolean;
  audioStatus: AudioStatus;
  onTogglePlay: () => void;
  onBpm: (bpm: number) => void;
  onLoop: (loop: boolean) => void;
};

/** Play/stop, tempo and Loop, with a line when sound isn't available (Q8). */
export const Transport = memo(function Transport({
  playing,
  bpm,
  loop,
  audioStatus,
  onTogglePlay,
  onBpm,
  onLoop,
}: Props) {
  return (
    <>
      <div className="transport">
        <button
          type="button"
          className="transport__play"
          data-playing={playing || undefined}
          aria-label={playing ? "Stop progression" : "Play progression"}
          onClick={onTogglePlay}
        >
          <svg
            className="transport__icon transport__icon--play"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M6 3.5v13l11-6.5z" fill="currentColor" />
          </svg>
          <svg
            className="transport__icon transport__icon--stop"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="12" height="12" rx="2.5" fill="currentColor" />
          </svg>
        </button>
        <label className="transport__tempo">
          Tempo{" "}
          <input
            type="range"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpm}
            onChange={(event) => onBpm(Number(event.target.value))}
          />{" "}
          <span>
            <output>{bpm}</output> BPM
          </span>
        </label>
        <button
          type="button"
          className="nashville-lab__ghost"
          aria-pressed={loop}
          onClick={() => onLoop(!loop)}
        >
          Loop
        </button>
      </div>
      {audioStatus === "unavailable" ? <p className="transport__no-sound">{NO_SOUND}</p> : null}
    </>
  );
});
