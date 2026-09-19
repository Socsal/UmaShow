import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import OfflineCareerSettings from './OfflineCareerSettings';
import {
  createDefaultOfflineFactorSelection,
  createDefaultOfflineSkillSettings,
  skillPurchaseTurnLabel,
} from './shared';
import { OfflineSingleModeSetup, RaceOption } from './types';

jest.mock('renderer/utils/umdb', () => ({ UMDB: {} }));
jest.mock('renderer/components/trainingHistory/AssetIcon', () => () => null);

test('a nested race picker keeps its selection and closes before the deck editor', () => {
  const saveDeck = jest.fn().mockResolvedValue(true);
  const race = {
    id: 201001,
    program_id: 1001,
    turn: 25,
    name: '测试比赛',
    date: '经典级1月上半月',
    type: 'G1',
  } as RaceOption;
  const setup = {
    scenario_id: 1,
    required_race_array: [],
    race_decks: [{ deck_num: 1, deck_name: '测试赛程', race_array: [] }],
  } as unknown as OfflineSingleModeSetup;
  const { container } = render(
    <OfflineCareerSettings
      setup={setup}
      selectedScenarioId={1}
      races={[race]}
      selectedDeckNum={1}
      setSelectedDeckNum={jest.fn()}
      busy=""
      prepare={jest.fn().mockResolvedValue(setup)}
      saveDeck={saveDeck}
      factorSelection={createDefaultOfflineFactorSelection()}
      setFactorSelection={jest.fn()}
      parents={[]}
      umas={[]}
      skills={[]}
      prioritySkillIds={[]}
      setPrioritySkillIds={jest.fn()}
      skillSettings={createDefaultOfflineSkillSettings()}
      setSkillSettings={jest.fn()}
    />,
  );

  fireEvent.click(screen.getAllByRole('button', { name: '编辑' })[0]);
  const editor = screen.getByRole('dialog', { name: '编辑游戏赛程槽位 1' });
  const dateLabel = skillPurchaseTurnLabel(race.turn);
  fireEvent.click(
    within(editor).getByRole('button', { name: `${dateLabel}，未选择比赛` }),
  );
  const picker = screen.getByRole('dialog', { name: `${dateLabel}比赛选择` });
  expect(container).not.toContainElement(picker);
  fireEvent.click(within(picker).getByRole('radio'));
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(picker).not.toBeInTheDocument();
  expect(editor).toBeInTheDocument();
  expect(
    within(editor).getByRole('button', {
      name: `${dateLabel}，已选择测试比赛`,
    }),
  ).toBeInTheDocument();
  expect(saveDeck).not.toHaveBeenCalled();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(editor).not.toBeInTheDocument();
});
