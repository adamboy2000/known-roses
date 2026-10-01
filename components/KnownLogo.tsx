export function KnownLogo({ footer = false }: { footer?: boolean }) {
  const variant = footer ? 'footer' : 'header';
  return <span className={`knownLogo knownLogo-${variant}`} role="img" aria-label="Known">
    <img src={`/known/logo-${variant}-layer-1.svg`} alt="" />
    <img src={`/known/logo-${variant}-layer-2.svg`} alt="" />
  </span>;
}
