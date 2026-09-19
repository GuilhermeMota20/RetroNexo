import type { ReactNode } from "react";

type DefaultLayoutProps = {
  children: ReactNode;
  fillMobileViewport?: boolean;
  hideFooterOnMobile?: boolean;
  immersive?: boolean;
};

/** Layout padrão do Retro Nexo, usado na navegação convencional. */
export function DefaultLayout({ children, fillMobileViewport = false, hideFooterOnMobile = false, immersive = false }: DefaultLayoutProps) {
  if (immersive) {
    return <div className="big-picture-player-layout"><main>{children}</main></div>;
  }

  return (
    <div className={`mx-auto flex w-full max-w-[1340px] flex-col px-5 pt-20 md:min-h-screen md:pt-28 lg:pt-36 ${fillMobileViewport ? "min-h-[100dvh]" : "min-h-screen"}`}>
      <main className={`flex-1 ${fillMobileViewport ? "flex min-h-0 flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:block md:pb-8" : "pb-8"}`}>{children}</main>
      <footer className={`${hideFooterOnMobile ? "hidden md:block" : ""} border-t border-retronexo-grey-200 py-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-center text-xs tracking-[0.08em] text-retronexo-grey-100 md:pb-5`}>
        <p className="normal-case">
          <span className="font-semibold text-retronexo-white">Retro Nexo</span>
          <span aria-hidden="true"> · </span>
          <span>© 2026 GMota</span>
        </p>
      </footer>
    </div>
  );
}
