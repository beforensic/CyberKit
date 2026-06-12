import confetti from 'canvas-confetti';

const BRAND_COLORS = ['#E8650A', '#f97316', '#fb923c', '#ffffff'];

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function fireQuizCompletionConfetti(score: number): void {
  if (prefersReducedMotion()) return;

  void confetti({
    particleCount: 90,
    spread: 72,
    startVelocity: 38,
    origin: { y: 0.55 },
    colors: BRAND_COLORS,
    disableForReducedMotion: true,
  });

  if (score >= 70) {
    window.setTimeout(() => {
      void confetti({
        particleCount: 45,
        angle: 60,
        spread: 50,
        origin: { x: 0, y: 0.65 },
        colors: BRAND_COLORS,
        disableForReducedMotion: true,
      });
      void confetti({
        particleCount: 45,
        angle: 120,
        spread: 50,
        origin: { x: 1, y: 0.65 },
        colors: BRAND_COLORS,
        disableForReducedMotion: true,
      });
    }, 180);
  }
}
