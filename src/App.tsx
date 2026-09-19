import { lazy, Suspense, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Header } from "./components/Header";
import { BigPictureLayout } from "./Layouts/BigPictureLayout";
import { auth } from "./lib/firebase";
import { emulatorFromFileName } from "./lib/localRoms";
import { getRoms } from "./lib/prismic";
import {
  ensureProfile,
  requestRom,
  subscribePlayerData,
  subscribeRomRequests,
  toggleFavorite,
  voteForRom,
} from "./lib/social";
import { useAppStore } from "./store/useAppStore";
import type { Rom } from "./types";

const RomsPage = lazy(() => import("./pages/RomsPage").then((module) => ({ default: module.RomsPage })));
const PlayerPage = lazy(() => import("./pages/PlayerPage").then((module) => ({ default: module.PlayerPage })));
const NewsPage = lazy(() => import("./pages/NewsPage").then((module) => ({ default: module.NewsPage })));
const RequestsPage = lazy(() => import("./pages/RequestsPage").then((module) => ({ default: module.RequestsPage })));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

function useDesktopViewport() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 768px)").matches);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export default function App() {
  const {
    roms,
    selectedRom,
    profile,
    romRequests,
    favoriteRomIds,
    setRoms,
    setSelectedRom,
    setProfile,
    setPlayerData,
    setRomRequests,
    setFavoriteRomIds,
    theme,
    bigPicture,
    setBigPicture,
  } = useAppStore();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [libraryStatus, setLibraryStatus] = useState("Carregando biblioteca...");
  const [immersivePlayer, setImmersivePlayer] = useState(false);
  const isDesktop = useDesktopViewport();
  const bigPictureActive = bigPicture && isDesktop;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("retronexo-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("big-picture-active", bigPictureActive);
    window.localStorage.setItem("retronexo-big-picture", String(bigPicture));
    if (bigPictureActive && !document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.().catch(() => undefined);
    }
    if (!bigPictureActive && !immersivePlayer && document.fullscreenElement) {
      void document.exitFullscreen?.().catch(() => undefined);
    }
    return () => document.documentElement.classList.remove("big-picture-active");
  }, [bigPicture, bigPictureActive, immersivePlayer]);

  useEffect(() => {
    getRoms()
      .then((items) => {
        setRoms(items);
        setLibraryStatus(`${items.length} ROMs disponíveis`);
      })
      .catch((error) => {
        setLibraryStatus(error instanceof Error ? error.message : "Falha ao carregar ROMs.");
      });
  }, [setRoms]);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setFavoriteRomIds([]);
      setRomRequests([]);
      setSelectedRom(null);
      return;
    }

    void ensureProfile(user).catch((error) => {
      console.error("Não foi possível preparar o perfil.", error);
    });

    const stopPlayerData = subscribePlayerData(user, (data) => {
      setPlayerData(data.profile, data.favoriteRomIds);
    });
    const stopRomRequests = subscribeRomRequests(setRomRequests);

    return () => {
      stopPlayerData();
      stopRomRequests();
    };
  }, [user, setFavoriteRomIds, setPlayerData, setProfile, setRomRequests, setSelectedRom]);

  const playRom = (rom: Rom) => {
    if (!user) return;
    setSelectedRom(rom);
    navigate("/player");
  };

  const loadLocalRom = (file: File) => {
    const title = file.name.replace(/\.[^.]+$/, "") || file.name;
    setSelectedRom({
      id: `local-${Date.now()}`,
      title,
      summary: "ROM carregada do seu computador.",
      romUrl: file,
      emulator: emulatorFromFileName(file.name),
      saveKey: title,
    });
    navigate("/player");
  };

  const updateFavorite = (rom: Rom) => {
    if (!user) return Promise.reject(new Error("Entre para favoritar ROMs."));
    return toggleFavorite(rom);
  };

  const favoriteRoms = roms.filter((rom) => favoriteRomIds.includes(rom.id));

  if (bigPictureActive) {
    return (
      <BigPictureLayout
        favoriteRomIds={favoriteRomIds}
        onLoadLocalRom={(file) => {
          setBigPicture(false);
          setImmersivePlayer(true);
          loadLocalRom(file);
        }}
        onExit={() => {
          setBigPicture(false);
          setImmersivePlayer(false);
          if (document.fullscreenElement) void document.exitFullscreen();
        }}
        onPlay={(rom) => {
          setBigPicture(false);
          setImmersivePlayer(true);
          playRom(rom);
        }}
        onToggleFavorite={updateFavorite}
        roms={roms}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <ScrollToTop />
      {!immersivePlayer && <Header profile={profile} user={user} />}

      <Suspense fallback={<main className="mx-auto max-w-6xl px-5 pb-24 pt-28 text-retronexo-grey-100">Carregando...</main>}>
        <Routes>
          <Route path="/" element={<NewsPage />} />
          <Route
            path="/roms"
            element={
              <RomsPage
                roms={roms}
                status={libraryStatus}
                user={user}
                favoriteRomIds={favoriteRomIds}
                onPlay={playRom}
                onLoadLocalRom={loadLocalRom}
                onToggleFavorite={updateFavorite}
              />
            }
          />
          <Route
            path="/player"
            element={
              <PlayerPage
                rom={selectedRom}
                favoriteRoms={favoriteRoms}
                isLoggedIn={Boolean(user)}
                immersive={immersivePlayer}
                onBrowseRoms={() => {
                  setImmersivePlayer(false);
                  navigate("/roms");
                }}
                onQuickPlay={playRom}
                onLoadLocalRom={loadLocalRom}
                onStop={() => {
                  setSelectedRom(null);
                  if (immersivePlayer) {
                    setImmersivePlayer(false);
                    setBigPicture(true);
                    navigate("/roms");
                    return;
                  }
                  navigate("/roms");
                }}
              />
            }
          />
          <Route path="/novidades" element={<Navigate to="/" replace />} />
          <Route
            path="/solicitacoes"
            element={
              user ? (
                <RequestsPage
                  userId={user.uid}
                  romRequests={romRequests}
                  onRequestRom={requestRom}
                  onVote={voteForRom}
                />
              ) : (
                <Navigate to="/roms" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
