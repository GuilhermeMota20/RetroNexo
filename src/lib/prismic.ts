import { appConfig } from "./config";
import type { Rom } from "../types";

export type NewsPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  darkImageUrl?: string;
  publishedAt?: string;
  fixed: boolean;
};

type PrismicDocument = { id: string; uid?: string; data: Record<string, unknown> };
const text = (value: unknown) => Array.isArray(value) ? value.map((part) => (typeof part === "object" && part ? String((part as { text?: string }).text || "") : "")).join("") : String(value || "");
const richText = (value: unknown) => Array.isArray(value)
  ? value.map((part) => (typeof part === "object" && part ? String((part as { text?: string }).text || "") : "")).filter(Boolean).join("\n\n")
  : String(value || "");
const url = (value: unknown) => typeof value === "object" && value ? String((value as { url?: string }).url || "") : "";
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const stringMap = (value: unknown): Record<string, string> => Object.entries(object(value)).reduce<Record<string, string>>((result, [key, item]) => {
  if (typeof item === "string" && item) result[key] = item;
  return result;
}, {});
const cheats = (value: unknown): [string, string][] => Array.isArray(value)
  ? value.flatMap((item) => {
      const data = object(item);
      const name = text(data.name || data.title);
      const code = text(data.code || data.value);
      return name && code ? [[name, code] as [string, string]] : [];
    })
  : [];
const bool = (value: unknown) => value === true || value === "true";

function mapRom(document: PrismicDocument): Rom {
  const data = document.data;
  const title = text(data.title || data.nome) || "ROM sem título";
  return {
    id: document.id,
    uid: document.uid,
    title,
    summary: text(data.summary || data.description || data.descricao),
    romUrl: url(data.rom_file || data.rom_url || data.rom || data.file),
    coverUrl: url(data.cover_image || data.cover || data.image || data.capa),
    emulator: text(data.emulator) || "gba",
    genre: text(data.genre),
    region: text(data.region),
    year: Number(text(data.release_year || data.year)) || undefined,
    saveKey: text(data.save_key) || document.uid || document.id || title,
    biosUrl: url(data.bios_url || data.bios),
    gamePatchUrl: url(data.game_patch_url || data.patch_url || data.patch),
    gameParentUrl: url(data.game_parent_url || data.parent_data_url || data.parent_data),
    externalFiles: stringMap(data.external_files),
    cheats: cheats(data.cheats),
    cheatPath: text(data.cheat_path),
    shaders: stringMap(data.shaders),
    controlScheme: text(data.control_scheme),
    defaultControls: object(data.default_controls),
    virtualGamepadSettings: object(data.virtual_gamepad_settings),
    videoRotation: ([0, 1, 2, 3].includes(Number(text(data.video_rotation)))
      ? Number(text(data.video_rotation))
      : undefined) as Rom["videoRotation"],
    forceLegacyCores: bool(data.force_legacy_cores),
    disableCue: bool(data.disable_cue),
  };
}

export async function getRoms(): Promise<Rom[]> {
  const repository = appConfig.prismicRepository;
  if (!repository) return [];
  const repositoryResponse = await fetch(`https://${repository}.cdn.prismic.io/api/v2`);
  if (!repositoryResponse.ok) throw new Error("Não foi possível acessar o CMS.");
  const api = await repositoryResponse.json() as { refs?: { ref: string; isMasterRef: boolean }[] };
  const ref = api.refs?.find((item) => item.isMasterRef)?.ref;
  if (!ref) return [];
  const params = new URLSearchParams({ ref, q: '[[at(document.type,"rom")]]', pageSize: "100", orderings: "[document.last_publication_date desc]" });
  if (appConfig.prismicAccessToken) params.set("access_token", appConfig.prismicAccessToken);
  const response = await fetch(`https://${repository}.cdn.prismic.io/api/v2/documents/search?${params}`);
  if (!response.ok) throw new Error("Não foi possível carregar as ROMs.");
  const payload = await response.json() as { results?: PrismicDocument[] };
  return (payload.results || []).map(mapRom);
}

function mapPost(document: PrismicDocument): NewsPost {
  const data = document.data;
  const content = richText(data.content || data.body || data.text || data.description || data.excerpt || data.summary);

  return {
    id: document.id,
    title: text(data.title || data.nome) || "Novidade RetroNexo",
    excerpt: richText(data.excerpt || data.summary || data.description) || content,
    content,
    imageUrl: url(data.cover_image || data.image || data.thumbnail || data.capa),
    darkImageUrl: url(data.cover_image_dark),
    publishedAt: text(data.publish_date || data.date || data.published_at),
    fixed: bool(data.fixed),
  };
}

export async function getNewsPosts(): Promise<NewsPost[]> {
  const repository = appConfig.prismicRepository;
  if (!repository) return [];

  const repositoryResponse = await fetch(`https://${repository}.cdn.prismic.io/api/v2`);
  if (!repositoryResponse.ok) throw new Error("Não foi possível acessar o CMS.");
  const api = await repositoryResponse.json() as { refs?: { ref: string; isMasterRef: boolean }[] };
  const ref = api.refs?.find((item) => item.isMasterRef)?.ref;
  if (!ref) return [];

  const postTypes = ["post", "news", "novidade"];
  const documents = await Promise.all(
    postTypes.map(async (type) => {
      const params = new URLSearchParams({
        ref,
        q: `[[at(document.type,"${type}")]]`,
        pageSize: "30",
        orderings: "[document.last_publication_date desc]",
      });

      if (appConfig.prismicAccessToken) params.set("access_token", appConfig.prismicAccessToken);
      const response = await fetch(`https://${repository}.cdn.prismic.io/api/v2/documents/search?${params}`);
      if (!response.ok) return [];
      const payload = await response.json() as { results?: PrismicDocument[] };
      return payload.results || [];
    }),
  );

  return documents
    .flat()
    .map(mapPost)
    .sort((first, second) => {
      if (first.fixed !== second.fixed) return Number(second.fixed) - Number(first.fixed);
      const firstDate = Date.parse(first.publishedAt || "") || 0;
      const secondDate = Date.parse(second.publishedAt || "") || 0;
      return secondDate - firstDate;
    });
}
