import { useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { Link } from "react-router-dom";
import type { Profile } from "../types";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { ProfileDropdown } from "./ProfileDropdown";
import { Tooltip } from "./Tooltip";

type HeaderProps = {
  profile: Profile | null;
  user: User | null;
};

type MobileNavItemProps = {
  to: string;
  label: string;
  children: ReactNode;
};

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function MobileNavItem({ to, label, children }: MobileNavItemProps) {
  return (
    <Button
      className="h-auto w-auto min-w-0 flex-col gap-1 !px-1 !py-2 text-[10px] leading-none [&[aria-current=page]]:!shadow-[-1px_1px_0_#100F18]"
      end={to === "/"}
      to={to}
      variant="secondary"
    >
      {children}
      <span className="truncate">{label}</span>
    </Button>
  );
}

export function Header({ profile, user }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const isLoggedIn = Boolean(user);
  const mobileColumns = isLoggedIn ? "grid-cols-5" : "grid-cols-4";

  return (
    <>
      <header className="fixed z-50 w-full border-b border-retronexo-border bg-retronexo-grey-300/95 shadow-[0_4px_15px_rgba(13,10,31,.2)] backdrop-blur md:left-1/2 md:top-4 md:w-[calc(100%-2.5rem)] md:max-w-[1340px] md:-translate-x-1/2 md:rounded-lg md:border md:shadow-[-6px_6px_0_#100F18]">
        <div className="mx-auto flex h-16 w-full max-w-[1340px] items-center px-5 md:h-[4.5rem] lg:h-[5.5rem]">
          <Link
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg text-2xl text-retronexo-white transition-all duration-150 drop-shadow-[-8px_8px_0_#100F18] active:translate-x-[calc(-50%-5px)] active:translate-y-[5px] active:drop-shadow-[-3px_3px_0_#100F18] md:static md:translate-x-0 md:active:translate-x-[-5px]"
            to="/"
          >
            <img
              className="h-14 w-14 object-contain md:h-20 md:w-20"
              src="/brand/retronexo-logo-grid.png"
              alt=""
            />
          </Link>

          <nav
            className="ml-8 hidden gap-8 md:flex"
            aria-label="Navegação principal"
          >
            <Button className="px-3 py-1" to="/roms" variant="secondary">
              ROMs
            </Button>
            <Button className="px-3 py-1" to="/player" variant="secondary">
              Player
            </Button>
            <Button className="px-3 py-1" end to="/" variant="secondary">
              Novidades
            </Button>
            {isLoggedIn && (
              <Button className="px-3 py-1" to="/solicitacoes" variant="secondary">
                Solicitações
              </Button>
            )}
          </nav>

          <Tooltip
            className="relative ml-auto hidden md:block"
            content={profile ? "Abrir perfil" : "Entrar ou criar perfil"}
            position="bottom"
          >
            <Button
              className="gap-3 px-2 py-1 hover:text-retronexo-blue"
              onClick={() => setProfileOpen((open) => !open)}
              variant="secondary"
            >
              <span className="hidden text-right text-sm min-[850px]:block">
                <b>{profile?.displayName || "Perfil"}</b>
                <br />
                <span className="text-retronexo-grey-100">
                  {profile ? "Conta conectada" : "Entrar"}
                </span>
              </span>
              <Avatar
                avatar={profile?.avatar}
                label={profile?.displayName || "Perfil"}
                size="sm"
              />
            </Button>
          </Tooltip>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-retronexo-border bg-retronexo-grey-300/95 px-3 pb-[calc(.65rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(0,0,0,.28)] backdrop-blur md:hidden"
        aria-label="Navegação mobile"
      >
        <div className={`mx-auto grid w-full max-w-md gap-1 ${mobileColumns}`}>
          <MobileNavItem label="ROMs" to="/roms">
            <NavIcon>
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M7 12h4m-2-2v4m6-2h2" />
            </NavIcon>
          </MobileNavItem>
          <MobileNavItem label="Player" to="/player">
            <NavIcon>
              <path d="M8 5h8l2 3v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8l2-3Z" />
              <path d="M9 12h2m-1-1v2m4-1h1m2 0h.01" />
            </NavIcon>
          </MobileNavItem>
          <MobileNavItem label="Novidades" to="/">
            <NavIcon>
              <path d="M4 19V5h16v14H4Z" />
              <path d="M8 15v-3m4 3V8m4 7v-5" />
            </NavIcon>
          </MobileNavItem>
          {isLoggedIn && (
            <MobileNavItem label="Pedidos" to="/solicitacoes">
              <NavIcon>
                <path d="M5 4h14v16H5z" />
                <path d="M8 9h8M8 13h5" />
              </NavIcon>
            </MobileNavItem>
          )}
          <Button
            className="h-auto w-auto min-w-0 flex-col gap-1 px-1 py-2 text-[10px] leading-none text-retronexo-grey-100"
            onClick={() => setProfileOpen((open) => !open)}
            variant="secondary"
          >
              <Avatar
                avatar={profile?.avatar}
                label={profile?.displayName || "Perfil"}
              size="sm"
            />
            <span className="truncate">{profile ? "Perfil" : "Entrar"}</span>
          </Button>
        </div>
      </nav>
      {profileOpen && (
        <ProfileDropdown
          user={user}
          profile={profile}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </>
  );
}
