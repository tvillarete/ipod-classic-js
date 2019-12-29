export const slideRightAnimation = {
  variants: {
    closed: { x: "100%" },
    open: {
      x: 0,
      transition: { duration: 0.3, type: "tween" }
    },
    closing: {
      x: "100%",
      transition: { duration: 0.3, type: "tween" }
    }
  },
  initial: "closed",
  animate: "open",
  exit: "closing"
};

export const fade = {
  variants: {
    closed: { opacity: 0 },
    open: { opacity: 1 },
    closing: {
      opacity: 0,
      transition: { duration: 0.3, type: "tween" }
    }
  },
  initial: "closed",
  animate: "open",
  exit: "closing"
};

export const fadeScale = {
  variants: {
    closed: { opacity: 0, scale: 0.5 },
    open: { opacity: 1, scale: 1 },
    closing: {
      opacity: 0,
      scale: 0.5,
      transition: { duration: 0.3, type: "tween" }
    }
  },
  initial: "closed",
  animate: "open",
  exit: "closing"
};

export const noAnimation = {
  variants: {
    closed: {},
    open: {},
    closing: {
      opacity: 0,
      transition: { duration: 0.3, type: "tween" }
    }
  },
  initial: "closed",
  animate: "open",
  exit: "closing"
};
