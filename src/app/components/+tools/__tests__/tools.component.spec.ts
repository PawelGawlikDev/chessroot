import { TestBed } from '@angular/core/testing';
import { Component, input, output } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ToolsComponent } from '../tools.component';
import { Insights } from '../models';
import { Platform } from '@enums';
import { USER_DATA_FEATURE_KEY } from '@state/selectors';
import { INITIAL_TIME_CONTROLS } from '@model';

@Component({ selector: 'cr-game-fetch-panel', template: '', standalone: true })
class MockGameFetchPanelComponent {
  public readonly title = input('');
  public readonly buttonLabel = input('');
  public readonly isLoading = input(false);
  public readonly progress = input(0);
  public readonly gameCount = input(0);
  public readonly gamesAnalyzed = input(0);
  public readonly totalGames = input(0);
  public readonly username = input('');
  public readonly usernameChange = output<string>();
  public readonly fetch = output<void>();
}

@Component({ selector: 'cr-insights-summary', template: '', standalone: true })
class MockInsightsSummaryComponent {
  public readonly totalGames = input(0);
  public readonly winRate = input(0);
  public readonly wins = input(0);
  public readonly losses = input(0);
  public readonly draws = input(0);
}

@Component({ selector: 'cr-insights-donut', template: '', standalone: true })
class MockInsightsDonutComponent {
  public readonly totalGames = input(0);
  public readonly wins = input(0);
  public readonly losses = input(0);
  public readonly draws = input(0);
  public readonly whiteWins = input(0);
  public readonly whiteLosses = input(0);
  public readonly whiteDraws = input(0);
  public readonly whiteGames = input(0);
  public readonly blackWins = input(0);
  public readonly blackLosses = input(0);
  public readonly blackDraws = input(0);
  public readonly blackGames = input(0);
}

@Component({ selector: 'cr-bar-chart', template: '', standalone: true })
class MockBarChartComponent {
  public readonly title = input('');
  public readonly rows = input<unknown[]>([]);
  public readonly barColor = input('');
}

const initialState = {
  [USER_DATA_FEATURE_KEY]: {
    platform: Platform.Lichess,
    playerColor: 'white',
    fromDate: null,
    toDate: null,
    timeControls: { ...INITIAL_TIME_CONTROLS },
  },
};

describe('ToolsComponent', () => {
  function createComponent() {
    const fixture = TestBed.createComponent(ToolsComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ToolsComponent,
        MockGameFetchPanelComponent,
        MockInsightsSummaryComponent,
        MockInsightsDonutComponent,
        MockBarChartComponent,
      ],
      providers: [provideNativeDateAdapter(), provideMockStore({ initialState })],
    });
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should set username', () => {
    const { component } = createComponent();
    component.$username.set('testuser');
    expect(component.$username()).toBe('testuser');
  });

  it('should compute isButtonDisabled when username is empty', () => {
    const { component } = createComponent();
    expect(component.$isButtonDisabled()).toBe(true);
  });

  it('should compute isButtonDisabled when username is set and not loading', () => {
    const { component } = createComponent();
    component.$username.set('testuser');
    expect(component.$isButtonDisabled()).toBe(false);
  });

  it('should compute isButtonDisabled when loading', () => {
    const { component } = createComponent();
    component.$username.set('testuser');
    component.$isLoading.set(true);
    expect(component.$isButtonDisabled()).toBe(true);
  });

  it('should compute progress with total games', () => {
    const { component } = createComponent();
    component.$totalGames.set(100);
    component.$gamesAnalyzed.set(50);
    expect(component.$progress()).toBe(50);
  });

  it('should cap progress at 100', () => {
    const { component } = createComponent();
    component.$totalGames.set(100);
    component.$gamesAnalyzed.set(150);
    expect(component.$progress()).toBe(100);
  });

  it('should compute progress with 0 total games using gameCount as denominator', () => {
    const { component } = createComponent();
    component.$totalGames.set(0);
    component.$gameCount.set(20);
    component.$gamesAnalyzed.set(5);
    expect(component.$progress()).toBe(25);
  });

  it('should return 0 progress when no games', () => {
    const { component } = createComponent();
    expect(component.$progress()).toBe(0);
  });

  it('should compute win rate', () => {
    const { component } = createComponent();
    component.$insights.set({
      totalGames: 100,
      wins: 60,
      losses: 30,
      draws: 10,
      winsAsWhite: 30,
      lossesAsWhite: 15,
      drawsAsWhite: 5,
      whiteGames: 50,
      winsAsBlack: 30,
      lossesAsBlack: 15,
      drawsAsBlack: 5,
      blackGames: 50,
      openings: [],
      topOpponents: [],
      timeControls: [],
    });
    expect(component.$winRate()).toBe(60);
  });

  it('should return 0 win rate when no data', () => {
    const { component } = createComponent();
    expect(component.$winRate()).toBe(0);
  });

  it('should compute top openings sorted by count', () => {
    const { component } = createComponent();
    component.$insights.set({
      totalGames: 3,
      wins: 2,
      losses: 1,
      draws: 0,
      winsAsWhite: 0,
      lossesAsWhite: 0,
      drawsAsWhite: 0,
      whiteGames: 0,
      winsAsBlack: 0,
      lossesAsBlack: 0,
      drawsAsBlack: 0,
      blackGames: 0,
      openings: [
        { name: 'Sicilian Defense', count: 3, wins: 2, losses: 1, draws: 0 },
        { name: 'Italian Game', count: 1, wins: 1, losses: 0, draws: 0 },
      ],
      topOpponents: [],
      timeControls: [],
    });
    const top = component.$topOpenings();
    expect(top.length).toBe(2);
    expect(top[0].label).toBe('Sicilian Defense');
    expect(top[0].count).toBe(3);
    expect(top[1].label).toBe('Italian Game');
  });

  it('should return empty top openings when no insights', () => {
    const { component } = createComponent();
    expect(component.$topOpenings()).toEqual([]);
  });

  it('should limit top openings to 10', () => {
    const { component } = createComponent();
    const openings = Array.from({ length: 15 }, (_, i) => ({
      name: `Opening ${i}`,
      count: 15 - i,
      wins: 0,
      losses: 0,
      draws: 0,
    }));
    component.$insights.set({
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winsAsWhite: 0,
      lossesAsWhite: 0,
      drawsAsWhite: 0,
      whiteGames: 0,
      winsAsBlack: 0,
      lossesAsBlack: 0,
      drawsAsBlack: 0,
      blackGames: 0,
      openings,
      topOpponents: [],
      timeControls: [],
    });
    expect(component.$topOpenings().length).toBe(10);
  });

  it('should compute top opponents sorted by games', () => {
    const { component } = createComponent();
    component.$insights.set({
      totalGames: 5,
      wins: 3,
      losses: 2,
      draws: 0,
      winsAsWhite: 0,
      lossesAsWhite: 0,
      drawsAsWhite: 0,
      whiteGames: 0,
      winsAsBlack: 0,
      lossesAsBlack: 0,
      drawsAsBlack: 0,
      blackGames: 0,
      openings: [],
      topOpponents: [
        { username: 'player2', games: 3, wins: 2, losses: 1, draws: 0 },
        { username: 'player1', games: 2, wins: 1, losses: 1, draws: 0 },
      ],
      timeControls: [],
    });
    const opps = component.$topOpponentsList();
    expect(opps.length).toBe(2);
    expect(opps[0].label).toBe('player2');
    expect(opps[0].count).toBe(3);
  });

  it('should return empty top opponents when no insights', () => {
    const { component } = createComponent();
    expect(component.$topOpponentsList()).toEqual([]);
  });

  it('should compute time control stats sorted by total', () => {
    const { component } = createComponent();
    component.$insights.set({
      totalGames: 5,
      wins: 3,
      losses: 2,
      draws: 0,
      winsAsWhite: 0,
      lossesAsWhite: 0,
      drawsAsWhite: 0,
      whiteGames: 0,
      winsAsBlack: 0,
      lossesAsBlack: 0,
      drawsAsBlack: 0,
      blackGames: 0,
      openings: [],
      topOpponents: [],
      timeControls: [
        { name: 'Blitz', total: 3, wins: 2, losses: 1, draws: 0 },
        { name: 'Rapid', total: 2, wins: 1, losses: 1, draws: 0 },
      ],
    });
    const tcs = component.$timeControlStats();
    expect(tcs.length).toBe(2);
    expect(tcs[0].label).toBe('Blitz');
    expect(tcs[0].count).toBe(3);
  });

  it('should return empty time control stats when no insights', () => {
    const { component } = createComponent();
    expect(component.$timeControlStats()).toEqual([]);
  });

  it('should set loading state during fetch', () => {
    const { component } = createComponent();
    component.$username.set('testuser');

    component.fetchGames();

    expect(component.$isLoading()).toBe(true);
    expect(component.$gameCount()).toBe(0);
  });

  it('should reset insights during fetch start', () => {
    const { component } = createComponent();
    component.$insights.set({} as Insights);
    component.$username.set('testuser');
    component.fetchGames();
    expect(component.$insights()).toBeNull();
  });
});
