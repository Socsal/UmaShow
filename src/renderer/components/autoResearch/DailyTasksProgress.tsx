/* eslint-disable no-nested-ternary */
import { CheckCircle2, CircleAlert, LoaderCircle } from 'lucide-react';
import { DailyTasksConfig } from './types';

const taskNames: Record<string, string> = {
  account: '刷新账号资源',
  daily_race: '每日赛事',
  daily_legend_race: '传奇赛事',
  team_stadium: '团队竞技场',
  limited_shop: '限时商店',
};

export default function DailyTasksProgress({
  daily,
}: {
  daily?: DailyTasksConfig;
}) {
  const current = daily?.current_task ?? 'account';
  return (
    <section
      className="rounded-xl border border-indigo-100 bg-white p-5 sm:p-6"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <LoaderCircle
          size={26}
          className="shrink-0 animate-spin text-indigo-500 motion-reduce:animate-none"
        />
        <div>
          <h2 className="text-section font-semibold text-slate-800">
            正在执行日常
          </h2>
          <p className="uma-prose mt-1 text-data text-slate-600">
            日常完成后会自动开始育成。
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        {Object.entries(taskNames)
          .filter(
            ([key]) =>
              key === 'account' ||
              daily?.[
                key as
                  | 'daily_race'
                  | 'daily_legend_race'
                  | 'team_stadium'
                  | 'limited_shop'
              ]?.enabled ||
              daily?.task_results?.[key],
          )
          .map(([key, name]) => {
            const result = daily?.task_results?.[key];
            const active = key === current;
            const done =
              Boolean(result) ||
              (key === 'account' && current !== 'account') ||
              (key === 'daily_race' && daily?.daily_race_done) ||
              (key === 'daily_legend_race' && daily?.daily_legend_race_done);
            return (
              <div
                key={key}
                className={`rounded-lg px-4 py-3 ${active ? 'bg-indigo-50' : 'bg-slate-50'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-data">
                  <span className="font-semibold text-slate-700">{name}</span>
                  {active ? (
                    <span className="flex shrink-0 items-center gap-1.5 text-label font-medium text-indigo-700">
                      <LoaderCircle
                        size={14}
                        className="animate-spin motion-reduce:animate-none"
                      />
                      执行中
                    </span>
                  ) : done ? (
                    <span
                      className={`flex shrink-0 items-center gap-1.5 text-label font-medium ${result?.status === 'error' ? 'text-amber-700' : 'text-emerald-700'}`}
                    >
                      {result?.status === 'error' ? (
                        <CircleAlert size={14} />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                      {result?.status === 'error'
                        ? '执行失败'
                        : result?.status === 'skipped'
                          ? '已跳过'
                          : '已完成'}
                    </span>
                  ) : (
                    <span className="shrink-0 text-label text-slate-600">
                      待执行
                    </span>
                  )}
                </div>
                {result?.detail ? (
                  <p
                    className={`uma-prose mt-1 text-label ${active ? 'text-indigo-700' : 'text-slate-600'}`}
                  >
                    {result.detail}
                  </p>
                ) : null}
              </div>
            );
          })}
      </div>
    </section>
  );
}
