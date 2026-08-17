import { render, screen, fireEvent } from '@testing-library/react';
import { MultiviewView } from './multiview-view';

vi.mock('./multiview-player', () => ({
  MultiviewPlayer: ({ src }: { src: string }) => (
    <div data-testid="player-src">{src}</div>
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

  it('produces no composition while a tile is left unassigned', () => {
    render(<MultiviewView />);

    fireEvent.click(screen.getByRole('button', { name: /soccer/i }));

    expect(playerSrc()).toBe('');
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
