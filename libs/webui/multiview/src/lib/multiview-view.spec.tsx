import { render, screen, fireEvent } from '@testing-library/react';
import { MultiviewView } from './multiview-view';

vi.mock('./multiview-player', () => ({
  MultiviewPlayer: ({
    src,
    onFocusTile,
    onSoloTile,
  }: {
    src: string;
    onFocusTile?: (index: number) => void;
    onSoloTile?: (index: number) => void;
  }) => (
    <div>
      <div data-testid="player-src">{src}</div>
      <button data-testid="focus-tile-1" onClick={() => onFocusTile?.(1)}>
        focus
      </button>
      <button data-testid="solo-tile-1" onClick={() => onSoloTile?.(1)}>
        solo
      </button>
    </div>
  ),
}));

const playerSrc = () => screen.getByTestId('player-src').textContent ?? '';

describe('MultiviewView', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_MULTIVIEW_EGRESS_DOMAIN', 'egress.example.com');
    vi.stubEnv('VITE_MULTIVIEW_CHANNEL_GROUP', 'MultiView-Preview-test');
    vi.stubEnv('VITE_MULTIVIEW_ENDPOINT_NAME', 'cmaf-mv-endpoint');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders successfully', () => {
    const { baseElement } = render(<MultiviewView />);

    expect(baseElement).toBeTruthy();
  });

  it('composes a real multiview url from the pre-assigned feeds', () => {
    render(<MultiviewView />);

    const src = playerSrc();

    expect(src).toContain(
      '/out/v1/MultiView-Preview-test/soccer/cmaf-mv-endpoint/index.m3u8'
    );
    expect(src).toContain(
      'aws.multiview=layout:3EL%3Bsources:soccer,motorsport,basketball'
    );
  });

  it('shrinks to two sources when a two-tile layout is selected', () => {
    render(<MultiviewView />);

    fireEvent.click(screen.getByRole('button', { name: /2EH/i }));

    expect(playerSrc()).toContain(
      'aws.multiview=layout:2EH%3Bsources:soccer,motorsport'
    );
  });

  it('auto-fills the new tile with an unused feed when a larger layout is selected', () => {
    render(<MultiviewView />);

    fireEvent.click(screen.getByRole('button', { name: /4E/i }));

    expect(playerSrc()).toContain(
      'aws.multiview=layout:4E%3Bsources:soccer,motorsport,basketball,football'
    );
  });

  it('produces no composition while a tile is left unassigned', () => {
    render(<MultiviewView />);

    fireEvent.click(screen.getByRole('button', { name: /soccer/i }));

    expect(playerSrc()).toBe('');
  });

  it('promotes a tile to the primary view on focus', () => {
    render(<MultiviewView />);

    fireEvent.click(screen.getByTestId('focus-tile-1'));

    const src = playerSrc();
    expect(src).toContain('/motorsport/cmaf-mv-endpoint/index.m3u8');
    expect(src).toContain(
      'aws.multiview=layout:3PL%3Bsources:motorsport,soccer,basketball'
    );
  });

  it('plays a single feed without the multiview query on solo', () => {
    render(<MultiviewView />);

    fireEvent.click(screen.getByTestId('solo-tile-1'));

    const src = playerSrc();
    expect(src).toBe(
      'https://egress.example.com/out/v1/MultiView-Preview-test/motorsport/cmaf-mv-endpoint/index.m3u8'
    );
    expect(src).not.toContain('aws.multiview');
  });

  it('disables unselected feeds when every tile is filled', () => {
    render(<MultiviewView />);

    const football = screen.getByRole('button', {
      name: /football/i,
    }) as HTMLButtonElement;
    const soccer = screen.getByRole('button', {
      name: /soccer/i,
    }) as HTMLButtonElement;

    expect(football.disabled).toBe(true);
    expect(soccer.disabled).toBe(false);
  });
});
