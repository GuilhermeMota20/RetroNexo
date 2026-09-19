import { useState } from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { User } from "firebase/auth";
import { toast } from "sonner";
import { Button } from "./Button";
import { loginGoogle, logoutGoogle, updateAvatar } from "../lib/social";
import type { Profile } from "../types";
import { Avatar } from "./Avatar";
import { useAppStore } from "../store/useAppStore";

const avatars = Array.from({ length: 14 }, (_, index) => `pixel-${index + 1}`);

type ProfileDropdownProps = {
  user: User | null;
  profile: Profile | null;
  onClose: () => void;
};

export function ProfileDropdown({ user, profile, onClose }: ProfileDropdownProps) {
  const [saving, setSaving] = useState(false);
  const { theme, setTheme, bigPicture, setBigPicture } = useAppStore();
  const isLightTheme = theme === "light";

  const signIn = async () => {
    setSaving(true);
    try {
      await loginGoogle();
      onClose();
    } catch (error) {
      toast.error("Não foi possível entrar", {
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const selectAvatar = async (avatar: string) => {
    setSaving(true);
    try {
      await updateAvatar(avatar);
      toast.success("Avatar atualizado.");
    } catch (error) {
      toast.error("Não foi possível atualizar o avatar", {
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className="fixed right-4 bottom-24 z-[60] w-[min(22rem,calc(100vw-2rem))] rounded-lg border shadow-[-6px_6px_0_#100F18] border-retronexo-border bg-retronexo-grey-300 p-4 md:right-[max(2.5rem,calc((100vw-1340px)/2+1.25rem))] md:top-24 md:bottom-auto"
      aria-label="Perfil"
    >
      <Button
        className="absolute right-3 top-2 !h-8 !w-8"
        onClick={onClose}
        aria-label="Fechar perfil"
        variant="icon"
      >
        <FontAwesomeIcon aria-hidden="true" className="h-4 w-4" icon={faXmark} />
      </Button>

      {user && profile && (
        <div className="profile-settings mb-5 pr-10">
          <button
            aria-checked={isLightTheme}
            aria-label={`Alternar para tema ${isLightTheme ? "escuro" : "claro"}`}
            className="theme-toggle"
            onClick={() => setTheme(isLightTheme ? "dark" : "light")}
            role="switch"
            type="button"
          >
            <span aria-hidden="true" className="theme-toggle-thumb" />
            <span>{isLightTheme ? "Tema claro" : "Tema escuro"}</span>
          </button>
          <button
            aria-checked={bigPicture}
            aria-label={`Modo Big Picture ${bigPicture ? "ativado" : "desativado"}`}
            className="big-picture-toggle"
            onClick={() => {
              const nextBigPicture = !bigPicture;
              if (nextBigPicture) void document.documentElement.requestFullscreen?.().catch(() => undefined);
              else if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => undefined);
              setBigPicture(nextBigPicture);
              onClose();
            }}
            role="switch"
            type="button"
          >
            <span aria-hidden="true" className="theme-toggle-thumb" />
            <span>Big Picture</span>
          </button>
        </div>
      )}

      {user && profile ? (
        <>
          <div className="flex items-center gap-3 pr-6">
            <Avatar avatar={profile.avatar} label={profile.displayName} size="md" />
            <div className="min-w-0">
              <strong className="block truncate text-retronexo-white">{profile.displayName}</strong>
              <span className="block truncate text-xs text-retronexo-grey-100">{profile.email}</span>
            </div>
          </div>

          <p className="mt-5 text-xs text-retronexo-blue">ESCOLHA SEU AVATAR</p>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {avatars.map((avatar) => (
              <Button
                className={[
                  "aspect-square !h-auto w-full overflow-hidden p-0 focus:outline-none focus:ring-2 focus:ring-retronexo-blue",
                  avatar === profile.avatar
                    ? "!border-retronexo-blue !bg-retronexo-blue/10"
                    : "hover:border-retronexo-grey-100",
                ].join(" ")}
                disabled={saving}
                key={avatar}
                onClick={() => void selectAvatar(avatar)}
                aria-label={`Usar avatar ${avatar.replace("pixel-", "")}`}
                variant="icon"
              >
                <img className="aspect-square w-full bg-retronexo-blue-dark object-cover" src={`/avatars/${avatar}.png`} alt="" />
              </Button>
            ))}
          </div>

          <Button
            className="mt-5 w-full"
            disabled={saving}
            onClick={() => void logoutGoogle().then(onClose)}
            variant="secondary"
          >
            Sair da conta
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-retronexo-blue">RETRO NEXO</p>
          <h2 className="mt-1 text-2xl text-retronexo-white">Entre para continuar</h2>
          <p className="mt-2 text-sm text-retronexo-grey-100">
            Use sua conta Google para favoritar jogos e enviar solicitações de ROM.
          </p>
          <Button className="mt-5 w-full" disabled={saving} onClick={() => void signIn()}>
            Entrar com Google
          </Button>
        </>
      )}
    </section>
  );
}
