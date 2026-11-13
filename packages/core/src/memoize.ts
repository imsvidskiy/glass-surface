type Memo<Input, Output> = {
  input: Input;
  output: Output;
};

function isFresh<Input extends object, Output>(
  memo: Memo<Input, Output> | null,
  input: Input
): memo is Memo<Input, Output> {
  if (memo === null) {
    return false;
  }

  return haveSameValues(memo.input, input);
}

export function haveSameValues<Value extends object>(left: Value, right: Value): boolean {
  const keys = Object.keys(left) as (keyof Value)[];

  return keys.every((key) => {
    return Object.is(left[key], right[key]);
  });
}

export function memoizeLatest<Input extends object, Output>(
  create: (input: Input) => Output
): (input: Input) => Output {
  let latest: Memo<Input, Output> | null = null;

  return (input) => {
    if (!isFresh(latest, input)) {
      latest = {
        input,
        output: create(input),
      };
    }

    return latest.output;
  };
}
