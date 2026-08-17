import { render, screen, fireEvent } from '@testing-library/react';
import { MultiviewView } from './multiview-view';

vi.mock('./multiview-player', () => ({
  MultiviewPlayer: ({
    src,
    isSolo,
    onExitSolo,
  }: {
    src: string;
    isSolo?: boolean;
    onExitSolo?: () => void;
  }) => (
    <div>
      <div data-testid="player-src">{src}</div>
      <div data-testid="is-solo">{String(Boolean(isSolo))}</div>
      <button data-testid="exit-solo" onClick={() => onExitSolo?.()} />
    </div>
  ),
}));

// Live source previews use hls.js; stub it out for the grid.
vi.mock('./live-preview', () => ({
  LivePreview: () => <div data-testid="live-preview" />,
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
const clickFeature = (label: string) =>
  fireEvent.click(
    screen.getByRole('button', { name: new RegExp(`feature ${label}`, 'i') })
  );
const clickSolo = (label: string) =>
  fireEvent.click(
    screen.getByRole('button', {
      name: new RegExp(`full screen ${label}`, 'i'),
    })
  );

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
    expect(p.sources).toEqual(['f1', 'nascar', 'football']);
    expect(p.path).toBe('f1');
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

  it('moves the featured feed to the primary position without changing the layout', () => {
    render(<MultiviewView />);

    clickFeature('nascar');
    const p = parse(src());

    expect(p.layout).toBe('3EL');
    expect(p.sources).toEqual(['nascar', 'f1', 'football']);
    expect(p.path).toBe('nascar');
  });

  it('keeps an equal layout when featuring a feed (2EH stays 2EH)', () => {
    render(<MultiviewView />);
    clickLayout('2EH');

    clickFeature('nascar');
    const p = parse(src());

    expect(p.layout).toBe('2EH');
    expect(p.sources).toEqual(['nascar', 'f1']);
    expect(p.path).toBe('nascar');
  });

  it('features a feed inside a grid layout without switching to primary', () => {
    render(<MultiviewView />);
    clickLayout('4E');

    clickFeature('football');
    const p = parse(src());

    expect(p.layout).toBe('4E');
    expect(p.sources).toEqual(['football', 'f1', 'nascar', 'tennis']);
  });

  it('solos a feed (single-view, no multiview query) and back restores the composition', () => {
    render(<MultiviewView />);
    const before = src();

    clickSolo('nascar');
    expect(isSolo()).toBe(true);
    const solo = parse(src());
    expect(solo.isMultiview).toBe(false);
    expect(solo.path).toBe('nascar');

    fireEvent.click(screen.getByTestId('exit-solo'));
    expect(isSolo()).toBe(false);
    expect(src()).toBe(before);
  });

  it('does not change the layout when soloing then going back (no side effect)', () => {
    render(<MultiviewView />);
    clickLayout('4E');
    const before = src();

    clickSolo('nascar');
    fireEvent.click(screen.getByTestId('exit-solo'));

    expect(src()).toBe(before);
    expect(parse(src()).layout).toBe('4E');
  });

  it('back after a focus returns to the focused composition, not a further change', () => {
    render(<MultiviewView />);
    clickLayout('4E');
    clickFeature('nascar'); // reorders within 4E, no layout change
    const focused = src();
    expect(parse(focused).layout).toBe('4E');
    expect(parse(focused).sources).toEqual([
      'nascar',
      'f1',
      'football',
      'tennis',
    ]);

    clickSolo('football');
    fireEvent.click(screen.getByTestId('exit-solo'));

    expect(src()).toBe(focused);
  });

  it('auto-fills new tiles when enlarging the layout', () => {
    render(<MultiviewView />);
    clickLayout('4E');

    expect(parse(src()).sources).toEqual([
      'f1',
      'nascar',
      'football',
      'tennis',
    ]);
  });

  it('drops the composition when a tile is unassigned and restores it when reassigned', () => {
    render(<MultiviewView />);

    fireEvent.click(screen.getByRole('button', { name: /^f1$/i }));
    expect(src()).toBe('');

    fireEvent.click(screen.getByRole('button', { name: /^f1$/i }));
    expect(parse(src()).sources).toEqual(['f1', 'nascar', 'football']);
  });

  it('disables unselected feeds when every tile is filled', () => {
    render(<MultiviewView />);

    const tennis = screen.getByRole('button', {
      name: /^tennis$/i,
    }) as HTMLButtonElement;

    expect(tennis.disabled).toBe(true);
  });
});
