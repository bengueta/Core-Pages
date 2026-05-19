import type { Tokens } from "./tokens";
import { IOSInput } from "./IOSInput";
import { ListRow } from "./ListRow";

/**
 * Labeled input row for grouped sections.
 */
export function InputRow({
  tokens,
  label,
  sub,
  value,
  onChange,
  pre,
  suf,
  last = false,
}: {
  tokens: Tokens;
  label: string;
  sub?: string;
  value: number;
  onChange: (v: number) => void;
  pre?: string;
  suf?: string;
  last?: boolean;
}) {
  return (
    <ListRow
      tokens={tokens}
      label={label}
      sub={sub}
      last={last}
      right={<IOSInput tokens={tokens} value={value} onChange={onChange} pre={pre} suf={suf} />}
    />
  );
}

