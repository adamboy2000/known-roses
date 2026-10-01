// Switch to 'white' to restore the preserved original without changing the camera.
const variant: 'red' | 'white' = 'red';
const directory = variant === 'red' ? '/rose-runtime/red' : '/rose-runtime';

export const roseAssets = {
  poster: `${directory}/poster.webp`,
  foreground: `${directory}/foreground.webp`,
  background: '/rose-runtime/background.webp',
};

export type RoseBackdrop = 'sunset' | 'cityscape';
export function getRoseAssets(backdrop: RoseBackdrop) {
  return backdrop === 'cityscape' ? {
    ...roseAssets,
    background: '/rose-runtime/cityscape-evening/background.webp',
    foreground: '/rose-runtime/cityscape-evening/foreground.webp',
    poster: '/rose-runtime/cityscape-evening/poster.webp',
  } : roseAssets;
}
