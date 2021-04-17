export const slideRightAnimation = {
  variants: {
    closed: { x: '100%' },
    open: {
      x: 0,
      transition: { duration: 0.3, type: 'tween' },
    },
    closing: {
      x: '100%',
      transition: { duration: 0.3, type: 'tween' },
    },
  },
  initial: 'closed',
  animate: 'open',
  exit: 'closing',
};

export const slideLeftAnimation = {
  variants: {
    closed: { x: '-110%' },
    open: {
      x: 0,
      transition: { duration: 0.3, type: 'tween' },
    },
    closing: {
      x: '-110%',
      transition: { duration: 0.3, type: 'tween' },
    },
  },
  initial: 'closed',
  animate: 'open',
  exit: 'closing',
};

export const slideUpAnimation = {
  variants: {
    closed: { y: '110%' },
    open: {
      y: 0,
      transition: { duration: 0.3, type: 'tween' },
    },
    closing: {
      y: '110%',
      transition: { duration: 0.3, type: 'tween' },
    },
  },
  initial: 'closed',
  animate: 'open',
  exit: 'closing',
};

export const popInAnimation = {
  variants: {
    closed: { scale: 0.6, opacity: 0 },
    open: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3, type: 'spring' },
    },
    closing: {
      scale: 0.6,
      opacity: 0,
      transition: { duration: 0.3, type: 'spring' },
    },
  },
  initial: 'closed',
  animate: 'open',
  exit: 'closing',
};

export const fade = {
  variants: {
    closed: { opacity: 0 },
    open: { opacity: 1 },
    closing: {
      opacity: 0,
      transition: { duration: 0.3, type: 'tween' },
    },
  },
  initial: 'closed',
  animate: 'open',
  exit: 'closing',
};

export const fadeScale = {
  variants: {
    closed: { opacity: 0, scale: 0.3 },
    open: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, type: 'tween' },
    },
    closing: {
      opacity: 0,
      scale: 0.3,
      transition: { duration: 0.3, type: 'tween' },
    },
  },
  initial: 'closed',
  animate: 'open',
  exit: 'closing',
};

export const previewSlideRight = {
  variants: {
    closed: { x: '130%', opacity: 0 },
    open: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, type: 'tween' },
    },
    closing: {
      x: '130%',
      opacity: 0,
      transition: { duration: 0.4, type: 'tween' },
    },
  },
  initial: 'closed',
  animate: 'open',
  exit: 'closing',
};

export const noAnimation = {
  variants: {
    closed: {},
    open: {},
    closing: {
      opacity: 0,
      transition: { duration: 0.3, type: 'tween' },
    },
  },
  initial: 'closed',
  animate: 'open',
  exit: 'closing',
};
