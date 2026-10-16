export const UNREACHED = 1e20;

interface LineBuffers {
  boundaries: Float64Array;
  distances: Float64Array;
  values: Float64Array;
  vertices: Int32Array;
}

function intersect(
  values: Float64Array,
  vertex: number,
  position: number
): number {
  const rise =
    values[position] + position * position - (values[vertex] + vertex * vertex);

  return rise / (2 * position - 2 * vertex);
}

function transformLine(buffers: LineBuffers, length: number): void {
  const { values, distances, vertices, boundaries } = buffers;

  let hull = 0;

  vertices[0] = 0;
  boundaries[0] = -UNREACHED;
  boundaries[1] = UNREACHED;

  for (let position = 1; position < length; position += 1) {
    let boundary = intersect(values, vertices[hull], position);

    while (boundary <= boundaries[hull]) {
      hull -= 1;
      boundary = intersect(values, vertices[hull], position);
    }

    hull += 1;
    vertices[hull] = position;
    boundaries[hull] = boundary;
    boundaries[hull + 1] = UNREACHED;
  }

  hull = 0;

  for (let position = 0; position < length; position += 1) {
    while (boundaries[hull + 1] < position) {
      hull += 1;
    }

    const offset = position - vertices[hull];

    distances[position] = offset * offset + values[vertices[hull]];
  }
}

/**
 * Exact squared Euclidean distance transform (Felzenszwalb and Huttenlocher), in place.
 * Cells holding zero are sources; cells holding {@link UNREACHED} receive the squared distance to the nearest source.
 */
export function squaredDistanceTransform(
  grid: Float32Array,
  columns: number,
  rows: number
): void {
  const length = Math.max(columns, rows);

  const buffers: LineBuffers = {
    boundaries: new Float64Array(length + 1),
    distances: new Float64Array(length),
    values: new Float64Array(length),
    vertices: new Int32Array(length),
  };

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      buffers.values[row] = grid[row * columns + column];
    }

    transformLine(buffers, rows);

    for (let row = 0; row < rows; row += 1) {
      grid[row * columns + column] = buffers.distances[row];
    }
  }

  for (let row = 0; row < rows; row += 1) {
    const start = row * columns;

    buffers.values.set(grid.subarray(start, start + columns));
    transformLine(buffers, columns);
    grid.set(buffers.distances.subarray(0, columns), start);
  }
}
