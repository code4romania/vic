import { act, renderHook } from '@testing-library/react-native';
import {
  HEXAGON_TONES,
  impactHexagonLabel,
  liquidY,
  STRIPE_BAR,
  STRIPE_PITCH,
  stripes,
  useCountUp,
} from './ImpactHexagon';
import { palette } from '../tokens';

// size 108 on Acasă: H = 119, R = 52, corners at y 7.5 and 111.5, headroom 21
const TOP = 7.5;
const BOTTOM = 111.5;
const HEADROOM = 21;

describe('ImpactHexagon liquid level', () => {
  it('hides the wave under the bottom corner when empty', () => {
    // the crest (middle line − amp) is still at the bottom corner
    expect(liquidY(0, TOP, BOTTOM, 7, HEADROOM) - 7).toBe(BOTTOM);
  });

  it('keeps the crest under the top corner when full, so the liquid still reads as liquid', () => {
    const middle = liquidY(1, TOP, BOTTOM, 7, HEADROOM);
    expect(middle - 7).toBeGreaterThan(TOP + 10);
  });

  it('42 aprobate + 1 respinsă (98%) still shows the crest below the top corner', () => {
    const middle = liquidY(42 / 43, TOP, BOTTOM, 7, HEADROOM);
    expect(middle - 7).toBeGreaterThan(TOP + 10);
    expect(middle).toBeGreaterThan(liquidY(1, TOP, BOTTOM, 7, HEADROOM));
  });

  it('rises with the level and clamps outside 0–1', () => {
    expect(liquidY(0.5, TOP, BOTTOM, 7, HEADROOM)).toBeLessThan(
      liquidY(0.25, TOP, BOTTOM, 7, HEADROOM),
    );
    expect(liquidY(2, TOP, BOTTOM, 7, HEADROOM)).toBe(liquidY(1, TOP, BOTTOM, 7, HEADROOM));
    expect(liquidY(-1, TOP, BOTTOM, 7, HEADROOM)).toBe(liquidY(0, TOP, BOTTOM, 7, HEADROOM));
  });

  it('labels the hours in Romanian', () => {
    expect(impactHexagonLabel(42, 0, 1)).toBe('42 de ore aprobate, 1 oră respinsă');
    expect(impactHexagonLabel(42, 5, 0)).toBe('42 de ore aprobate, 5 ore în așteptare');
  });
});

describe('useCountUp', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('counts again from 0 when the replay key changes (each focus of Acasă)', async () => {
    const hook = await renderHook(
      ({ replay }: { replay: number }) => useCountUp(42, false, replay),
      { initialProps: { replay: 1 } },
    );
    await act(async () => {
      jest.advanceTimersByTime(1200);
    });
    expect(hook.result.current).toBe(42);
    await hook.rerender({ replay: 2 });
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    expect(hook.result.current).toBeLessThan(42);
    await act(async () => {
      jest.advanceTimersByTime(1200);
    });
    expect(hook.result.current).toBe(42);
  });

  it('shows the number at once with Reduce Motion', async () => {
    const hook = await renderHook(() => useCountUp(42, true, 1));
    expect(hook.result.current).toBe(42);
  });
});

describe('ImpactHexagon pending stripes', () => {
  it('Ore (onLight) draws navy stripes on white, like the prototype Ore card', () => {
    expect(HEXAGON_TONES.onLight.stripe).toBe('#01344F');
    expect(HEXAGON_TONES.onLight.stripeBg).toBe('#FFFFFF');
    expect(HEXAGON_TONES.onLight.empty).toBe('#EAE5D8');
    expect(HEXAGON_TONES.onLight.outline).toBe(palette.navy);
  });

  it('Acasă (onNavy) keeps yellow stripes on #012A40 over a #001A29 hexagon', () => {
    expect(HEXAGON_TONES.onNavy.stripe).toBe('#FFD209');
    expect(HEXAGON_TONES.onNavy.stripeBg).toBe('#012A40');
    expect(HEXAGON_TONES.onNavy.empty).toBe('#001A29');
  });

  it('uses the yellow liquid on both tones', () => {
    expect(HEXAGON_TONES.onLight.liquid).toBe(palette.yellow);
    expect(HEXAGON_TONES.onNavy.liquid).toBe(palette.yellow);
  });

  it('draws 4pt bars every 8pt across, as „/” stripes covering the whole band', () => {
    expect(STRIPE_PITCH).toBeCloseTo(8 * Math.SQRT2);
    expect(STRIPE_BAR).toBeCloseTo(STRIPE_PITCH / 2);
    const d = stripes(100, 50);
    const bars = d.split('M').filter(Boolean);
    // enough bars to cover x from -height to width
    expect(bars.length).toBe(Math.ceil(150 / STRIPE_PITCH));
    // first bar: top edge 0 → bar at y 0, bottom edge shifted left by the height („/”)
    const nums = bars[0].match(/-?\d+(\.\d+)?/g)!.map(Number);
    expect(nums.slice(0, 2)).toEqual([0, 0]);
    expect(nums[4]).toBeCloseTo(STRIPE_BAR - 50, 1);
    expect(nums[5]).toBe(50);
  });
});
