import { Card, Position, SelectableTarget } from "./types";

export interface CardAnimation {
  cards: Card[];
  from: Position;
  to: Position;
  startTime: number;
  duration: number;
  overlap: number;
  /** If true, draw card backs instead of faces */
  faceDown?: boolean;
  /** Target to hide from static rendering while this animation is in flight */
  hideTarget?: SelectableTarget;
}

export interface InterpolatedAnimation {
  cards: Card[];
  position: Position;
  overlap: number;
  progress: number;
  faceDown?: boolean;
}

export interface FlipAnimation {
  card: Card;
  position: Position;
  startTime: number;
  duration: number;
  hideTarget: SelectableTarget;
}

export interface InterpolatedFlip {
  card: Card;
  position: Position;
  /** 0 to 1 overall progress */
  progress: number;
  /** X scale factor (1 → 0 → 1), drives the visual flip */
  scaleX: number;
  /** Whether to show card back (first half) or face (second half) */
  showBack: boolean;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export class AnimationManager {
  private queue: CardAnimation[] = [];
  private flipQueue: FlipAnimation[] = [];
  private onCompleteCallback: (() => void) | null = null;

  enqueue(anim: CardAnimation): void {
    this.queue.push(anim);
  }

  enqueueFlip(anim: FlipAnimation): void {
    this.flipQueue.push(anim);
  }

  isAnimating(): boolean {
    return this.queue.length > 0 || this.flipQueue.length > 0;
  }

  /** Returns targets that should be hidden from static rendering */
  getHiddenTargets(): SelectableTarget[] {
    const moveTargets = this.queue
      .filter((a) => a.hideTarget != null)
      .map((a) => a.hideTarget!);
    const flipTargets = this.flipQueue.map((a) => a.hideTarget);
    return [...moveTargets, ...flipTargets];
  }

  /** Register a callback that fires once when all animations finish */
  onAllComplete(cb: () => void): void {
    this.onCompleteCallback = cb;
  }

  getActiveAnimations(now: number): InterpolatedAnimation[] {
    const result: InterpolatedAnimation[] = [];

    for (const anim of this.queue) {
      const elapsed = now - anim.startTime;
      if (elapsed < 0) continue;

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

  getActiveFlips(now: number): InterpolatedFlip[] {
    const result: InterpolatedFlip[] = [];

    for (const anim of this.flipQueue) {
      const elapsed = now - anim.startTime;
      if (elapsed < 0) continue;

      const rawT = Math.min(1, elapsed / anim.duration);
      const halfT = rawT * 2;

      let scaleX: number;
      let showBack: boolean;

      if (halfT <= 1) {
        scaleX = 1 - easeOutCubic(halfT);
        showBack = true;
      } else {
        scaleX = easeOutCubic(halfT - 1);
        showBack = false;
      }

      result.push({
        card: anim.card,
        position: anim.position,
        progress: rawT,
        scaleX: Math.max(0.01, scaleX),
        showBack,
      });
    }

    return result;
  }

  tick(now: number): void {
    const beforeMove = this.queue.length;
    const beforeFlip = this.flipQueue.length;

    this.queue = this.queue.filter((anim) => {
      const elapsed = now - anim.startTime;
      return elapsed < anim.duration;
    });

    this.flipQueue = this.flipQueue.filter((anim) => {
      const elapsed = now - anim.startTime;
      return elapsed < anim.duration;
    });

    const totalBefore = beforeMove + beforeFlip;
    const totalAfter = this.queue.length + this.flipQueue.length;

    if (totalBefore > 0 && totalAfter === 0 && this.onCompleteCallback) {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = null;
      cb();
    }
  }

  clear(): void {
    this.queue = [];
    this.flipQueue = [];
    this.onCompleteCallback = null;
  }
}
