import { useRef, useCallback, useMemo } from "react";

const WRONG_SOUNDS = [
  "/sounds/aww-man.mp3",
  "/sounds/noooo-ans.mp3",
  "/sounds/wrong-ans.mp3",
];

export default function useSoundManager() {
  const musicRef = useRef(null);
  const typingRef = useRef(null);
  const wheelRef = useRef(null);
  const glitchRef = useRef(null);
  const correctRef = useRef(null);
  const yayRef = useRef(null);
  const isMutedRef = useRef(true);
  const musicStartedRef = useRef(false);
  const lastWrongIdxRef = useRef(-1);
  const normalMusicVol = useRef(0.25);

  /* ---- lazy initializers ---- */
  const getMusic = useCallback(() => {
    if (!musicRef.current) {
      const a = new Audio("/sounds/piano.mp3");
      a.loop = true;
      a.volume = 0;
      musicRef.current = a;
    }
    return musicRef.current;
  }, []);

  const getTyping = useCallback(() => {
    if (!typingRef.current) {
      const a = new Audio("/sounds/keyboard-typing.mp3");
      a.volume = 0.2;
      a.loop = false;
      typingRef.current = a;
    }
    return typingRef.current;
  }, []);

  const getWheel = useCallback(() => {
    if (!wheelRef.current) {
      const a = new Audio("/sounds/spinning-wheel.mp3");
      a.volume = 1.0;
      a.loop = false;
      wheelRef.current = a;
    }
    return wheelRef.current;
  }, []);

  const getGlitch = useCallback(() => {
    if (!glitchRef.current) {
      const a = new Audio("/sounds/glitch.mp3");
      a.volume = 0.5;
      a.loop = false;
      glitchRef.current = a;
    }
    return glitchRef.current;
  }, []);

  const getCorrect = useCallback(() => {
    if (!correctRef.current) {
      const a = new Audio("/sounds/correct.mp3");
      a.volume = 0.4;
      a.loop = false;
      correctRef.current = a;
    }
    return correctRef.current;
  }, []);

  const getYay = useCallback(() => {
    if (!yayRef.current) {
      const a = new Audio("/sounds/yayyy.mp3");
      a.volume = 0.5;
      a.loop = false;
      yayRef.current = a;
    }
    return yayRef.current;
  }, []);

  /* ---- duck music while SFX plays ---- */
  const duckMusic = useCallback(() => {
    const m = musicRef.current;
    if (m && !isMutedRef.current) {
      m.volume = Math.min(m.volume, 0.08);
    }
  }, []);

  const restoreMusic = useCallback(() => {
    const m = musicRef.current;
    if (m && !isMutedRef.current) {
      m.volume = normalMusicVol.current;
    }
  }, []);

  /* helper: play an SFX with auto-duck */
  const playSfx = useCallback(
    (audio, restoreDelay = 1500) => {
      duckMusic();
      audio.currentTime = 0;
      audio.play().catch(() => {});
      // restore music after SFX ends or after timeout
      const restore = () => restoreMusic();
      audio.addEventListener("ended", restore, { once: true });
      // safety fallback
      setTimeout(restore, restoreDelay);
    },
    [duckMusic, restoreMusic]
  );

  /* ---- actions ---- */
  const playTyping = useCallback(() => {
    const a = getTyping();
    if (a.paused) {
      a.currentTime = 0;
      a.play().catch(() => {});
    }
  }, [getTyping]);

  const stopTyping = useCallback(() => {
    const a = getTyping();
    a.pause();
    a.currentTime = 0;
  }, [getTyping]);

  const playWheel = useCallback(() => {
    const a = getWheel();
    duckMusic();
    a.currentTime = 0;
    a.play().catch(() => {});
  }, [getWheel, duckMusic]);

  const stopWheel = useCallback(() => {
    const a = getWheel();
    a.pause();
    a.currentTime = 0;
    restoreMusic();
  }, [getWheel, restoreMusic]);

  const playGlitch = useCallback(() => {
    const a = getGlitch();
    playSfx(a, 3000);
  }, [getGlitch, playSfx]);

  const playCorrect = useCallback(() => {
    const a = getCorrect();
    playSfx(a, 2000);
  }, [getCorrect, playSfx]);

  const playRandomWrong = useCallback(() => {
    // pick a random index that is NOT the same as the last one
    let idx;
    do {
      idx = Math.floor(Math.random() * WRONG_SOUNDS.length);
    } while (idx === lastWrongIdxRef.current && WRONG_SOUNDS.length > 1);
    lastWrongIdxRef.current = idx;

    try {
      const a = new Audio(WRONG_SOUNDS[idx]);
      a.volume = 0.4;
      duckMusic();
      a.play().catch(() => {});
      a.addEventListener("ended", () => restoreMusic(), { once: true });
      setTimeout(() => restoreMusic(), 2000);
    } catch {
      // graceful fallback
    }
  }, [duckMusic, restoreMusic]);

  const playYay = useCallback(() => {
    const a = getYay();
    playSfx(a, 4000);
  }, [getYay, playSfx]);

  /* ---- background music with fade-in ---- */
  const startMusic = useCallback(() => {
    const a = getMusic();
    if (musicStartedRef.current) return;
    musicStartedRef.current = true;
    isMutedRef.current = false;
    a.volume = 0;
    a.play().catch(() => {});
    // fade in over 2 seconds
    let vol = 0;
    const target = 0.25;
    const step = target / 40;
    const fadeInterval = setInterval(() => {
      vol += step;
      if (vol >= target) {
        vol = target;
        clearInterval(fadeInterval);
      }
      a.volume = vol;
      normalMusicVol.current = vol;
    }, 50);
  }, [getMusic]);

  const toggleMusic = useCallback(() => {
    const a = getMusic();
    if (isMutedRef.current) {
      a.play().catch(() => {});
      a.volume = normalMusicVol.current;
      isMutedRef.current = false;
    } else {
      a.pause();
      isMutedRef.current = true;
    }
    return !isMutedRef.current;
  }, [getMusic]);

  const setMusicVolume = useCallback(
    (vol) => {
      const v = Math.min(1, Math.max(0, vol));
      normalMusicVol.current = v;
      const a = getMusic();
      if (!isMutedRef.current) {
        a.volume = v;
      }
    },
    [getMusic]
  );

  const isMusicMuted = useCallback(() => isMutedRef.current, []);

  return useMemo(
    () => ({
      playTyping,
      stopTyping,
      playWheel,
      stopWheel,
      playGlitch,
      playCorrect,
      playRandomWrong,
      playYay,
      startMusic,
      toggleMusic,
      setMusicVolume,
      isMusicMuted,
    }),
    [
      playTyping, stopTyping, playWheel, stopWheel, playGlitch,
      playCorrect, playRandomWrong, playYay, startMusic, toggleMusic,
      setMusicVolume, isMusicMuted,
    ]
  );
}
