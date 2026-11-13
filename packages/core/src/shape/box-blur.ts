type BlurLine = {
  length: number;
  offset: number;
  radius: number;
  stride: number;
};

const PASSES = 3;

function blurLine(source: Float32Array, target: Float32Array, line: BlurLine): void {
  const { length, offset, radius, stride } = line;

  const weight = 1 / (2 * radius + 1);

  function read(index: number): number {
    return source[offset + Math.min(Math.max(index, 0), length - 1) * stride];
  }

  let sum = read(0) * (radius + 1);

  for (let index = 1; index <= radius; index += 1) {
    sum += read(index);
  }

  for (let index = 0; index < length; index += 1) {
    target[offset + index * stride] = sum * weight;
    sum += read(index + radius + 1) - read(index - radius);
  }
}

export function boxBlur(grid: Float32Array, columns: number, rows: number, radius: number): void {
  const buffer = new Float32Array(grid.length);

  for (let pass = 0; pass < PASSES; pass += 1) {
    for (let row = 0; row < rows; row += 1) {
      blurLine(grid, buffer, {
        length: columns,
        offset: row * columns,
        radius,
        stride: 1,
      });
    }

    for (let column = 0; column < columns; column += 1) {
      blurLine(buffer, grid, {
        length: rows,
        offset: column,
        radius,
        stride: columns,
      });
    }
  }
}
