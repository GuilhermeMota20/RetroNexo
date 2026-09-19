import type { User } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import * as yup from "yup";
import type { Profile, Rom, RomRequest } from "../types";
import { auth, db } from "./firebase";

export const romRequestSchema = yup.object({
  title: yup.string().trim().max(100).required("Informe o nome da ROM."),
  emulator: yup.string().trim().max(30).required("Informe a plataforma."),
  note: yup.string().trim().max(280).default(""),
});

const avatarIds = Array.from({ length: 14 }, (_, index) => `pixel-${index + 1}`);
const maxVotes = 15;

const fallbackProfile = (user: User): Profile => ({
  uid: user.uid,
  displayName: user.displayName || "Jogador",
  email: user.email || "",
  avatar: "pixel-1",
});

const favoriteIdsFrom = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) =>
          typeof item === "string"
            ? item
            : item && typeof item === "object" && "romId" in item
              ? String(item.romId)
              : "",
        )
        .filter(Boolean)
    : [];

function currentUser() {
  const user = auth?.currentUser;
  if (!user) throw new Error("Entre para continuar.");
  return user;
}

export type PlayerData = {
  profile: Profile;
  favoriteRomIds: string[];
};

export async function ensureProfile(user: User) {
  if (!db) throw new Error("Firebase não configurado.");

  const profileRef = doc(db, "users", user.uid);
  const fallback = fallbackProfile(user);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(profileRef);

    if (snapshot.exists()) {
      const savedAvatar = String(snapshot.data().avatar || "");
      transaction.update(profileRef, {
        displayName: fallback.displayName,
        email: fallback.email,
        avatar: avatarIds.includes(savedAvatar) ? savedAvatar : fallback.avatar,
        updatedAt: serverTimestamp(),
      });
      return;
    }

    transaction.set(profileRef, {
      ...fallback,
      favorites: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function loginGoogle() {
  if (!auth) throw new Error("Configure as variáveis VITE_FIREBASE_* antes de entrar.");
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export async function logoutGoogle() {
  if (auth) await signOut(auth);
}

export function subscribePlayerData(
  user: User,
  callback: (data: PlayerData) => void,
) {
  if (!db) return () => {};

  return onSnapshot(doc(db, "users", user.uid), (snapshot) => {
    const data = snapshot.data() || {};
    const profile = { ...fallbackProfile(user), ...data } as Profile;

    callback({
      profile,
      favoriteRomIds: favoriteIdsFrom(data.favorites),
    });
  });
}

export function subscribeRomRequests(callback: (items: RomRequest[]) => void) {
  if (!db) return () => {};

  return onSnapshot(collection(db, "romRequests"), (snapshot) => {
    const requests = snapshot.docs
      .map((item) => {
        const data = item.data();
        return {
          id: item.id,
          ...data,
          authorName: String(data.authorName || data.authorUsername || "Jogador"),
          createdAt: data.createdAt?.toDate?.(),
        } as RomRequest;
      })
      .sort(
        (left, right) =>
          Number(right.priority) - Number(left.priority) ||
          (right.voteCount || 0) - (left.voteCount || 0) ||
          (right.createdAt?.getTime() || 0) - (left.createdAt?.getTime() || 0),
      );
    callback(requests);
  });
}

export async function updateAvatar(avatar: string) {
  if (!avatarIds.includes(avatar)) throw new Error("Avatar inválido.");
  if (!db) throw new Error("Firebase não configurado.");
  const profileRef = doc(db, "users", currentUser().uid);

  await runTransaction(db, async (transaction) => {
    transaction.update(profileRef, {
      avatar,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function requestRom(input: {
  title: string;
  emulator: string;
  note: string;
}) {
  const values = await romRequestSchema.validate(input, { abortEarly: false });
  if (!db) throw new Error("Firebase não configurado.");

  const user = currentUser();
  const requestRef = doc(db, "romRequests", user.uid);
  const profileRef = doc(db, "users", user.uid);

  await runTransaction(db, async (transaction) => {
    const requestSnapshot = await transaction.get(requestRef);
    if (requestSnapshot.exists()) {
      throw new Error("Você já possui uma solicitação de ROM.");
    }

    const profileSnapshot = await transaction.get(profileRef);
    const profile = profileSnapshot.data() as Partial<Profile> | undefined;
    transaction.set(requestRef, {
      authorUid: user.uid,
      authorName: profile?.displayName || user.displayName || "Jogador",
      title: values.title,
      emulator: values.emulator,
      note: values.note || "",
      status: "pending",
      voteCount: 0,
      priority: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function voteForRom(requestId: string) {
  if (!db) throw new Error("Firebase não configurado.");

  const user = currentUser();
  const requestRef = doc(db, "romRequests", requestId);
  const voteRef = doc(db, "romRequests", requestId, "votes", user.uid);

  return runTransaction(db, async (transaction) => {
    const [requestSnapshot, voteSnapshot] = await Promise.all([
      transaction.get(requestRef),
      transaction.get(voteRef),
    ]);
    if (!requestSnapshot.exists()) throw new Error("Esta solicitação não existe mais.");
    if (requestSnapshot.data().authorUid === user.uid) {
      throw new Error("Você não pode votar na própria solicitação.");
    }
    if (voteSnapshot.exists()) throw new Error("Você já votou nesta ROM.");

    const voteCount = Number(requestSnapshot.data().voteCount || 0) + 1;
    if (voteCount > maxVotes) throw new Error("Esta ROM já alcançou a prioridade máxima.");

    transaction.set(voteRef, { uid: user.uid, createdAt: serverTimestamp() });
    transaction.update(requestRef, {
      voteCount,
      priority: voteCount >= maxVotes,
      updatedAt: serverTimestamp(),
    });
    return voteCount;
  });
}

export async function toggleFavorite(rom: Rom) {
  if (!db) throw new Error("Firebase não configurado.");

  const user = currentUser();
  const profileRef = doc(db, "users", user.uid);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(profileRef);
    if (!snapshot.exists()) throw new Error("Perfil do jogador não encontrado.");

    const favorites = favoriteIdsFrom(snapshot.data().favorites);
    const favorite = !favorites.includes(rom.id);
    const nextFavorites = favorite
      ? [...favorites.filter((id) => id !== rom.id).slice(-99), rom.id]
      : favorites.filter((id) => id !== rom.id);

    transaction.update(profileRef, {
      favorites: nextFavorites,
      updatedAt: serverTimestamp(),
    });
    return favorite;
  });
}
