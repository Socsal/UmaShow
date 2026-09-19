import { useState } from 'react';
import { DailyAssetSnapshot } from './types';
import './History.css';

const items = [
  ['jewels', '宝石'],
  ['support_tickets', '协助卡招募券'],
  ['character_tickets', '优俊少女招募券'],
  ['energy_drinks', '能量饮料'],
] as const;

type AssetKey = (typeof items)[number][0];
const dayNumber = (day: string) =>
  Date.parse(`${day}T00:00:00+08:00`) / 86400000;

export function assetHistoryRows(
  snapshots: DailyAssetSnapshot[],
  key: AssetKey,
) {
  const ordered = [...snapshots].sort((a, b) =>
    a.business_day.localeCompare(b.business_day),
  );
  return ordered.map((snapshot, index) => {
    const previous = ordered[index - 1];
    const consecutive =
      previous &&
      dayNumber(snapshot.business_day) - dayNumber(previous.business_day) === 1;
    return {
      ...snapshot,
      value: snapshot[key],
      delta: consecutive ? snapshot[key] - previous[key] : null,
    };
  });
}

const formatDelta = (delta: number | null) =>
  delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta.toLocaleString()}`;

export default function AssetTracking({
  snapshots,
  loading,
}: {
  snapshots: DailyAssetSnapshot[];
  loading: boolean;
}) {
  const [selected, setSelected] = useState<AssetKey>('jewels');
  const rows = assetHistoryRows(snapshots, selected);
  const latest = rows.at(-1);
  const name = items.find(([key]) => key === selected)![1];
  const maximum = Math.max(1, ...rows.map((row) => row.value));
  const firstDay = rows.length ? dayNumber(rows[0].business_day) : 0;
  const span = latest ? dayNumber(latest.business_day) - firstDay : 0;
  const points = rows.map((row) => ({
    x: span
      ? 96 + ((dayNumber(row.business_day) - firstDay) / span) * 520
      : 356,
    y: 170 - (row.value / maximum) * 138,
  }));

  return (
    <section className="historyTracking" aria-busy={loading}>
      <div
        className="historyAssetSwitch"
        role="group"
        aria-label="选择追踪物品"
      >
        {items.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={selected === key}
            onClick={() => setSelected(key)}
            className={`rounded-lg border px-3 py-2 text-label font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              selected === key
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {latest ? (
        <>
          <div className="historyAssetOverview">
            <div>
              <h3 className="text-section font-semibold text-slate-800">
                {name}持有量
              </h3>
              <p className="mt-2 text-title font-semibold tabular-nums text-indigo-700">
                {latest.value.toLocaleString()}
              </p>
              <p className="mt-1 text-caption text-slate-500">
                最新记录 · {latest.business_day}
              </p>
              <p className="mt-3 text-label text-slate-600">
                较前日{' '}
                <strong className="tabular-nums text-slate-700">
                  {formatDelta(latest.delta)}
                </strong>
              </p>
            </div>
            <div className="historyAssetChart">
              <svg
                viewBox="0 0 640 212"
                className="w-full"
                role="img"
                aria-label={`${name}每日持有量趋势`}
              >
                <title>{`${name}每日持有量趋势，详细数量见下方表格`}</title>
                {[0, 0.5, 1].map((ratio) => (
                  <g key={ratio}>
                    <line
                      x1="96"
                      x2="616"
                      y1={170 - ratio * 138}
                      y2={170 - ratio * 138}
                      stroke="#e2e8f0"
                    />
                  </g>
                ))}
                {rows.map((row, index) => {
                  const point = points[index];
                  const previous = points[index - 1];
                  return (
                    <g key={row.business_day}>
                      {previous && row.delta !== null ? (
                        <line
                          x1={previous.x}
                          y1={previous.y}
                          x2={point.x}
                          y2={point.y}
                          stroke="#6366f1"
                          strokeWidth="2"
                        />
                      ) : null}
                      <circle cx={point.x} cy={point.y} r="3.5" fill="#6366f1">
                        <title>
                          {`${row.business_day}：${row.value.toLocaleString()}，较前日 ${formatDelta(row.delta)}`}
                        </title>
                      </circle>
                    </g>
                  );
                })}
              </svg>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 text-caption tabular-nums text-slate-600"
              >
                {[0, 0.5, 1].map((ratio) => (
                  <span
                    key={ratio}
                    className="absolute -translate-y-1/2"
                    style={{
                      right: '87.5%',
                      top: `${((170 - ratio * 138) / 212) * 100}%`,
                    }}
                  >
                    {(maximum * ratio).toLocaleString('zh-CN', {
                      notation: 'compact',
                      maximumFractionDigits: 1,
                    })}
                  </span>
                ))}
                <span className="absolute bottom-0 left-[15%]">
                  {rows[0].business_day}
                </span>
                {rows.length > 1 ? (
                  <span className="absolute bottom-0 right-[3.75%]">
                    {latest.business_day}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="historyAssetTable">
              <caption className="sr-only">{name}每日持有量与变化</caption>
              <thead className="border-y border-slate-200 bg-slate-50 text-caption text-slate-600">
                <tr>
                  <th scope="col">游戏日</th>
                  <th scope="col" className="text-right">
                    持有量
                  </th>
                  <th scope="col" className="text-right">
                    较前日
                  </th>
                  <th scope="col" className="historyAssetCapture text-right">
                    记录时间（北京）
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...rows].reverse().map((row) => (
                  <tr
                    key={row.business_day}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="text-slate-600">
                      {row.business_day}
                      <span className="historyAssetCaptureMobile">
                        记录于{' '}
                        {new Date(row.captured_at).toLocaleString('zh-CN', {
                          timeZone: 'Asia/Shanghai',
                          hour12: false,
                        })}
                        （北京）
                      </span>
                    </td>
                    <td className="text-right font-semibold tabular-nums text-slate-800">
                      {row.value.toLocaleString()}
                    </td>
                    <td
                      className={`text-right font-semibold tabular-nums ${row.delta && row.delta > 0 ? 'text-emerald-700' : 'text-slate-600'}`}
                    >
                      {formatDelta(row.delta)}
                    </td>
                    <td className="historyAssetCapture text-right text-caption text-slate-600">
                      {new Date(row.captured_at).toLocaleString('zh-CN', {
                        timeZone: 'Asia/Shanghai',
                        hour12: false,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p role="status" className="py-14 text-center text-data text-slate-600">
          {loading
            ? '正在读取追踪记录…'
            : '暂无追踪记录，下次启动任务时会自动记录。'}
        </p>
      )}
    </section>
  );
}
