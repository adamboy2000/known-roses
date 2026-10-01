'use client';
import { createContext, useContext, type ReactNode } from 'react';
import { getRoseAssets, type RoseBackdrop } from '../lib/rose-assets';

const BackdropContext = createContext<RoseBackdrop>('sunset');
export function RoseAssetsProvider({ backdrop, children }: { backdrop: RoseBackdrop; children: ReactNode }) {
  return <BackdropContext.Provider value={backdrop}>{children}</BackdropContext.Provider>;
}
export function useRoseAssets() { return getRoseAssets(useContext(BackdropContext)); }
export function useRoseRoutes() {
  const prefix = useContext(BackdropContext) === 'cityscape' ? '/cityscape' : '';
  return { home: prefix || '/', claim: `${prefix}/rose/claim` };
}
