import { render, screen, fireEvent } from '@testing-library/react';
import { MultiviewView } from './multiview-view';

vi.mock('./multiview-player', () => ({
  MultiviewPlayer: ({
    src,
    isSolo,
    onFocusTile,
    onSoloTile,
    onExitSolo,
  }: {
    src: string;
    isSolo?: boolean;
    onFocusTile?: (index: number) => void;
    onSoloTile?: (index: number) => void;
    onExitSolo?: () => void;
  }) => (
    <div>
      <div data-testid="player-src">{src}</div>
      <div data-testid="is-solo">{String(Boolean(isSolo))}</div>
      {[0, 1, 2, 3].map((i) => (
        <button
          key={`f${i}`}
          data-testid={`focus-${i}`}
          onClick={() => onFocusTile?.(i)}
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <button
          key={`s${i}`}
          data-testid={`solo-${i}`}
          onClick={() => onSoloTile?.(i)}
        />
      ))}
      <button data-testid="exit-solo" onClick={() => onExitSolo?.()} />
    </div>
  ),
}));

const src = () => screen.getByTestId('player-src').textContent ?? '';
const isSolo = () => screen.getByTestId('is-solo').textContent === 'true';

const parse = (url: string) => ({
  path: url.match(/MultiView-Preview-test\/([^/]+)\/cmaf-mv-endpoint/)?.[1],
  layout: url.match(/layout:([0-9A-Za-z]+)%3B/)?.[1],
  sources: url.match(/sources:([^&]+)$/)?.[1]?.split(','),
  isMultiview: url.includes('aws.multiview'),
});

const clickLayout = (code: string) =>
  fireEvent.click(screen.getByRole('button', { name: new RegExp(code, 'i') }));

describe('MultiviewView', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_MULTIVIEW_EGRESS_DOMAIN', 'egress.example.com');
    vi.stubEnv('VITE_MULTIVIEW_CHANNEL_GROUP', 'MultiView-Preview-test');
    vi.stubEnv('VITE_MULTIVIEW_ENDPOINT_NAME', 'cmaf-mv-endpoint');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('starts on 3EL with the first three feeds and the path on the first source', () => {
    render(<MultiviewView />);
    const p = parse(src());

    expect(p.layout).toBe('3EL');
    expect(p.sources).toEqual(['soccer', 'motorsport', 'basketball']);
    expect(p.path).toBe('soccer');
  });

  it.each([
    ['2EH', 2],
    ['2PL', 2],
    ['3EL', 3],
    ['3PL', 3],
    ['4E', 4],
    ['4PL', 4],
  ])('composes %s with %i feeds', (code, count) => {
    render(<MultiviewView />);
    clickLayout(code);
    const p = parse(src());

    expect(p.layout).toBe(code);
    expect(p.sources).toHaveLength(count);
    expect(p.path).toBe(p.sources?.[0]);
  });

  it('promotes the focused tile to the primary layout and reorders sources', () => {
    render(<MultiviewView />);

    fireEvent.click(screen.getByTestId('focus-1')); // motorsport
    const p = parse(src());

    expect(p.layout).toBe('3PL');
    expect(p.sources).toEqual(['motorsport', 'soccer', 'basketball']);
    expect(p.path).toBe('motorsport');
  });

  it('focuses within a four-tile layout to 4PL', () => {
    render(<MultiviewView />);
    clickLayout('4E');

    fireEvent.click(screen.getByTestId('focus-2')); // basketball
    const p = parse(src());

    expect(p.layout).toBe('4PL');
    expect(p.sources).toEqual([
      'basketball',
      'soccer',
      'motorsport',
      'football',
    ]);
  });

  it('solos a feed (single-view, no multiview query) and back restores the composition', () => {
    render(<MultiviewView />);
    const before = src();

    fireEvent.click(screen.getByTestId('solo-1')); // motorsport
    expect(isSolo()).toBe(true);
    const solo = parse(src());
    expect(solo.isMultiview).toBe(false);
    expect(solo.path).toBe('motorsport');

    fireEvent.click(screen.getByTestId('exit-solo'));
    expect(isSolo()).toBe(false);
    expect(src()).toBe(before);
  });

  it('does not change the layout when soloing then going back (no side effect)', () => {
    render(<MultiviewView />);
    clickLayout('4E');
    const before = src();

    fireEvent.click(screen.getByTestId('solo-1'));
    fireEvent.click(screen.getByTestId('exit-solo'));

    expect(src()).toBe(before);
    expect(parse(src()).layout).toBe('4E');
  });

  it('back after a focus returns to the focused composition, not a further change', () => {
    render(<MultiviewView />);
    clickLayout('4E');
    fireEvent.click(screen.getByTestId('focus-0')); // explicit focus -> 4PL
    const focused = src();
    expect(parse(focused).layout).toBe('4PL');

    fireEvent.click(screen.getByTestId('solo-2'));
    fireEvent.click(screen.getByTestId('exit-solo'));

    expect(src()).toBe(focused);
  });

  it('auto-fills new tiles when enlarging the layout', () => {
    render(<MultiviewView />);
    clickLayout('4E');

    expect(parse(src()).sources).toEqual([
      'soccer',
      'motorsport',
      'basketball',
      'football',
    ]);
  });

  it('drops the composition when a tile is unassigned and restores it when reassigned', () => {
    render(<MultiviewView />);

    fireEvent.click(screen.getByRole('button', { name: /soccer/i }));
    expect(src()).toBe('');

    fireEvent.click(screen.getByRole('button', { name: /soccer/i }));
    expect(parse(src()).sources).toEqual([
      'soccer',
      'motorsport',
      'basketball',
    ]);
  });

  it('disables unselected feeds when every tile is filled', () => {
    render(<MultiviewView />);

    const football = screen.getByRole('button', {
      name: /football/i,
    }) as HTMLButtonElement;

    expect(football.disabled).toBe(true);
  });
});
