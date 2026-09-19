import type { ChangeEvent } from "react";
import { toast } from "sonner";
import { isSupportedLocalRom, localRomAccept } from "../../lib/localRoms";
import { Button } from "../Button";

type LocalRomWelcomeProps = {
  onLoadLocalRom: (file: File) => void;
  onSignIn: () => void;
};

/** Entrada do modo local para visitantes sem conta. */
export function LocalRomWelcome({ onLoadLocalRom, onSignIn }: LocalRomWelcomeProps) {
  const loadLocalRom = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isSupportedLocalRom(file.name)) {
      toast.error("Arquivo incompatível", { description: "Esse arquivo não parece ser uma ROM compatível." });
      return;
    }
    onLoadLocalRom(file);
    toast.success("ROM local carregada", { description: file.name });
  };

  return (
    <section className="mx-auto max-w-xl py-10 text-center">
      <p className="text-sm text-retronexo-blue">MODO LOCAL</p>
      <h1 className="mt-1 text-4xl text-retronexo-white sm:text-5xl">Carregue sua ROM</h1>
      <p className="mt-3 text-retronexo-grey-100">Entre para acessar a biblioteca e jogar as ROMs da plataforma. Sem conta, você pode executar apenas um arquivo local do seu dispositivo.</p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <label className="retronexo-button inline-flex cursor-pointer"><input accept={localRomAccept} className="sr-only" onChange={loadLocalRom} type="file" />Selecionar ROM local</label>
        <Button onClick={onSignIn} variant="secondary">Entrar</Button>
      </div>
    </section>
  );
}
