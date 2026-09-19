import { fireEvent, render, screen } from '@testing-library/react';
import AssetTracking, { assetHistoryRows } from './AssetTracking';
import DailyTasksProgress from './DailyTasksProgress';
import { DailyAssetSnapshot, DailyTasksConfig } from './types';

const snapshots: DailyAssetSnapshot[] = [
  {
    business_day: '2026-09-22',
    captured_at: '2026-09-22T08:00:00+08:00',
    jewels: 80,
    support_tickets: 1,
    character_tickets: 2,
    energy_drinks: 0,
  },
  {
    business_day: '2026-09-19',
    captured_at: '2026-09-19T08:00:00+08:00',
    jewels: 100,
    support_tickets: 2,
    character_tickets: 2,
    energy_drinks: 3,
  },
  {
    business_day: '2026-09-20',
    captured_at: '2026-09-20T08:00:00+08:00',
    jewels: 120,
    support_tickets: 2,
    character_tickets: 4,
    energy_drinks: 2,
  },
];

test('compares adjacent game days without presenting missing days as zero', () => {
  expect(assetHistoryRows(snapshots, 'jewels').map((row) => row.delta)).toEqual(
    [null, 20, null],
  );
  expect(
    assetHistoryRows(snapshots, 'energy_drinks').map((row) => row.delta),
  ).toEqual([null, -1, null]);
});

test('switching the tracked item updates the chart and daily changes', () => {
  render(<AssetTracking snapshots={snapshots} loading={false} />);
  expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
    '宝石每日持有量趋势',
  );
  expect(screen.getByText('+20')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '优俊少女招募券' }));
  expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
    '优俊少女招募券每日持有量趋势',
  );
  expect(screen.getByText('+2')).toBeTruthy();
  expect(screen.queryByText('+20')).toBeNull();
});

test('daily work shows the current task and completed results as updates arrive', () => {
  const daily: DailyTasksConfig = {
    run_with_career: true,
    daily_race: {
      enabled: true,
      daily_race_id: 1,
      trained_chara_id: 1,
      running_style: 1,
    },
    daily_legend_race: {
      enabled: false,
      daily_legend_race_id: 0,
      trained_chara_id: 0,
      running_style: 0,
    },
    team_stadium: { enabled: true, opponent_strength: 3 },
    limited_shop: { enabled: false, buy_all: true },
    status: 'running',
    current_task: 'daily_race',
  };
  const { rerender } = render(<DailyTasksProgress daily={daily} />);
  expect(screen.getByText('正在执行日常')).toBeTruthy();
  expect(screen.getByText('执行中').parentElement?.textContent).toContain(
    '每日赛事',
  );
  rerender(
    <DailyTasksProgress
      daily={{
        ...daily,
        current_task: 'team_stadium',
        task_results: {
          daily_race: { status: 'completed', detail: '已使用 3 张入场券' },
        },
      }}
    />,
  );
  expect(screen.getByText('执行中').parentElement?.textContent).toContain(
    '团队竞技场',
  );
  expect(screen.getByText('已使用 3 张入场券')).toBeTruthy();
});
