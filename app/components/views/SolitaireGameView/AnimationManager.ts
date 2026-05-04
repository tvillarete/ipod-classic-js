import { Card, Position } from "./types";

export interface CardAnimation {
  cards: Card[];
  from: Position;
  to: Position;
  startTime: number;
  duration: number;
  overlap: number;
  /** If true, draw card backs instead of faces */
  faceDown?: boolean;
}

export interface InterpolatedAnimation {
  cards: Card[];
  position: Position;
  overlap: number;
  progress: number;
  faceDown?: boolean;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export class AnimationManager {
  private queue: CardAnimation[] = [];
  private onCompleteCallback: (() => void) | null = null;

  enqueue(anim: CardAnimation): void {
    this.queue.push(anim);
  }

  isAnimating(): boolean {
    return this.queue.length > 0;
  }

  /** Register a callback that fires once when all animations finish */
  onAllComplete(cb: () => void): void {
    this.onCompleteCallback = cb;
  }

  getActiveAnimations(now: number): InterpolatedAnimation[] {
    const result: InterpolatedAnimation[] = [];

    for (const anim of this.queue) {
      const elapsed = now - anim.startTime;
      if (elapsed < 0) continue; // not started yet (staggered)

      const rawT = Math.min(1, elapsed / anim.duration);
      const t = easeOutCubic(rawT);

      result.push({
        cards: anim.cards,
        position: {
          x: lerp(anim.from.x, anim.to.x, t),
          y: lerp(anim.from.y, anim.to.y, t),
        },
        overlap: anim.overlap,
        progress: rawT,
        faceDown: anim.faceDown,
      });
    }

    return result;
  }

  tick(now: number): void {
    const before = this.queue.length;
    this.queue = this.queue.filter((anim) => {
      const elapsed = now - anim.startTime;
      return elapsed < anim.duration;
    });

    if (before > 0 && this.queue.length === 0 && this.onCompleteCallback) {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = null;
      cb();
    }
  }

  clear(): void {
    this.queue = [];
    this.onCompleteCallback = null;
  }
}
