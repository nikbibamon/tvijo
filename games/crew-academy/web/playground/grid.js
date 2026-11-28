export const directions = {
  up: [0, -1],
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0]
};

export const directionNames = {up:'вверх', right:'вправо', down:'вниз', left:'влево'};

export function neighbor(width, height, index, [dx, dy]) {
  const x = index % width + dx;
  const y = Math.floor(index / width) + dy;
  return x < 0 || x >= width || y < 0 || y >= height ? -1 : y * width + x;
}

export function seededRandom(seed) {
  let state = seed >>> 0;
  return size => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return Math.floor((state / 4294967296) * size);
  };
}

export function shuffled(values, pick) {
  const pool = values.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = pick(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}
