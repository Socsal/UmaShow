import { ArrowDown, ArrowUp } from 'lucide-react';

type Props = {
  label: string;
  index: number;
  count: number;
  onMove: (targetIndex: number) => void;
};

export default function ReorderControls({
  label,
  index,
  count,
  onMove,
}: Props) {
  return (
    <span className="inline-flex flex-none items-center gap-0.5">
      {([-1, 1] as const).map((direction) => {
        const targetIndex = index + direction;
        const unavailable = targetIndex < 0 || targetIndex >= count;
        const action = direction === -1 ? '上移' : '下移';
        const Icon = direction === -1 ? ArrowUp : ArrowDown;
        return (
          <button
            key={direction}
            type="button"
            aria-label={`${action}${label}`}
            // Keep focus when a move reaches the first or last position.
            aria-disabled={unavailable}
            title={`${action}${label}（当前第 ${index + 1} 项，共 ${count} 项）`}
            onClick={() => {
              if (!unavailable) onMove(targetIndex);
            }}
            className="flex h-8 w-8 min-h-8 min-w-8 flex-none items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
          >
            <Icon size={14} aria-hidden="true" />
          </button>
        );
      })}
    </span>
  );
}
