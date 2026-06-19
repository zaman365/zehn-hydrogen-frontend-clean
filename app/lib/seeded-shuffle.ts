function seededRandom(seed: string) {
  let state = 0;

  for (let index = 0; index < seed.length; index++) {
    state = Math.imul(state, 31) + seed.charCodeAt(index);
    state >>>= 0;
  }

  return function random() {
    state = Math.imul(state, 1664525) + 1013904223;
    state >>>= 0;
    return state / 0x100000000;
  };
}

export function shuffleWithSeed<T>(items: T[], seed: string): T[] {
  const random = seededRandom(seed);
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}
