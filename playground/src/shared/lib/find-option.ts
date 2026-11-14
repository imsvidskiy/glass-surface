export function findOption<Value extends string>(options: readonly Value[], candidate: string): Value | undefined {
  return options.find((option) => {
    return option === candidate;
  });
}
