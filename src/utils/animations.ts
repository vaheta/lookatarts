// Spring animation for elements that need a bouncy feel
export const springTransition = {
    type: "spring",
    damping: 30,
    stiffness: 300,
  };
  
// 20 300

// Standard smooth transition with material-design-like easing
export const smoothTransition = {
    duration: 0.4,
    ease: [0.4, 0, 0.2, 1], // Material Design standard easing
    exit: { duration: 0 },
}; 

// Standard container variant with stagger effect and exit animation
export const staggerContainerVariant = {
  hidden: { opacity: 1 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: "afterChildren"
    }
  }
};

// Child animation variant - consistent across all files
export const childVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
    }
  }
};

