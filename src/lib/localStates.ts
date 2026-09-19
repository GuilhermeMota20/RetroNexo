const databaseName = "retronexo-states";
const databaseVersion = 2;
const storeName = "latest-state";

type StateRecord = {
  key: string;
  romKey?: string;
  blob: Blob;
  updatedAt: string;
  label?: string;
};

export type SavedState = {
  id: string;
  blob: Blob;
  updatedAt: string;
  label: string;
};

const stateKey = (emulator: string, saveKey: string) => `${emulator}::${saveKey}`;

function openDatabase(): Promise<IDBDatabase | null> {
  if (!("indexedDB" in window)) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, databaseVersion);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Não foi possível abrir os states locais."));
  });
}

function asBlob(value: unknown): Blob | null {
  if (!value) return null;
  if (value instanceof Blob) return value;
  if (value instanceof ArrayBuffer) return new Blob([value]);
  if (ArrayBuffer.isView(value)) {
    const bytes = new Uint8Array(value.byteLength);
    bytes.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
    return new Blob([bytes]);
  }
  if (typeof value === "string") return new Blob([value]);
  return null;
}

export function stateBlob(payload: unknown): Blob | null {
  if (Array.isArray(payload)) return asBlob(payload[1]) || asBlob(payload[0]);
  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    return asBlob(data.save) || asBlob(data.state) || asBlob(data.buffer) || asBlob(data.data) || asBlob(data.payload);
  }
  return asBlob(payload);
}

export async function saveState(input: {
  emulator: string;
  saveKey: string;
  payload?: unknown;
  label?: string;
}) {
  const blob = stateBlob(input.payload);
  const database = await openDatabase();
  if (!blob || !database) return false;

  const romKey = stateKey(input.emulator, input.saveKey);
  const record: StateRecord = {
    key: `${romKey}::${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`,
    romKey,
    blob,
    updatedAt: new Date().toISOString(),
    label: input.label || "State manual",
  };
  const transaction = database.transaction(storeName, "readwrite");
  transaction.objectStore(storeName).put(record);

  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Não foi possível salvar o state local."));
    transaction.onabort = () => reject(transaction.error || new Error("Não foi possível salvar o state local."));
  });
  database.close();
  return true;
}

export async function listSavedStates(input: { emulator: string; saveKey: string }): Promise<SavedState[]> {
  const database = await openDatabase();
  if (!database) return [];

  const romKey = stateKey(input.emulator, input.saveKey);
  const transaction = database.transaction(storeName, "readonly");
  const request = transaction.objectStore(storeName).getAll();
  const records = await new Promise<StateRecord[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as StateRecord[]);
    request.onerror = () => reject(request.error || new Error("Não foi possível ler os states locais."));
  });
  database.close();

  return records
    .filter((record) => record.romKey === romKey || record.key === romKey)
    .map((record) => ({
      id: record.key,
      blob: record.blob,
      updatedAt: record.updatedAt,
      label: record.label || "State anterior",
    }))
    .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
}

export async function getLatestStateBlob(input: { emulator: string; saveKey: string }) {
  return (await listSavedStates(input))[0]?.blob || null;
}

export async function getLatestStateUrl(input: { emulator: string; saveKey: string }) {
  const blob = await getLatestStateBlob(input);
  return blob ? URL.createObjectURL(blob) : null;
}

export async function deleteSavedState(input: { id: string }) {
  const database = await openDatabase();
  if (!database) return;

  const transaction = database.transaction(storeName, "readwrite");
  transaction.objectStore(storeName).delete(input.id);
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Não foi possível apagar o state local."));
  });
  database.close();
}
