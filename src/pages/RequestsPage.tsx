import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../components/Button";
import { Dialog } from "../components/Dialog";
import { DefaultLayout } from "../Layouts/DefaultLayout";
import { romRequestSchema } from "../lib/social";
import type { RomRequest } from "../types";

type RomRequestValues = { title: string; emulator: string; note: string };
type RequestsPageProps = {
  userId: string;
  romRequests: RomRequest[];
  onRequestRom: (input: RomRequestValues) => Promise<void>;
  onVote: (requestId: string) => Promise<number>;
};

function VoteProgress({ votes }: { votes: number }) {
  const value = Math.min(votes, 15);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-retronexo-grey-100"><span>{value} votos</span><span>15 para prioridade</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-retronexo-grey-400"><div className="h-full rounded-full bg-retronexo-blue transition-all" style={{ width: `${(value / 15) * 100}%` }} /></div>
    </div>
  );
}

export function RequestsPage({ userId, romRequests, onRequestRom, onVote }: RequestsPageProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const hasOwnRequest = romRequests.some((request) => request.authorUid === userId);
  const form = useForm<RomRequestValues>({
    resolver: yupResolver(romRequestSchema),
    defaultValues: { title: "", emulator: "GBA", note: "" },
  });

  const submitRequest = async (values: RomRequestValues) => {
    try {
      await onRequestRom(values);
      form.reset();
      setDialogOpen(false);
      toast.success("Solicitação enviada", {
        description: "Agora ela pode receber votos de outros jogadores.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível enviar a solicitação.";
      form.setError("title", { message });
      toast.error("Não foi possível enviar a solicitação", { description: message });
    }
  };

  const vote = async (request: RomRequest) => {
    try {
      const voteCount = await onVote(request.id);
      setVotedIds((ids) => [...ids, request.id]);
      toast.success(voteCount >= 15 ? "Prioridade máxima alcançada" : "Voto registrado", {
        description: voteCount >= 15 ? `${request.title} agora tem prioridade máxima.` : "Obrigado por contribuir.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível registrar o voto.";
      toast.error("Não foi possível registrar o voto", { description: message });
    }
  };

  return (
    <DefaultLayout>
      <section>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-retronexo-blue">BIBLIOTECA COLABORATIVA</p>
            <h1 className="mt-1 text-4xl text-retronexo-white sm:text-5xl">Solicitações</h1>
            <p className="mt-2 max-w-2xl text-retronexo-grey-100">Vote nas ROMs mais desejadas. Ao alcançar 15 votos, uma solicitação recebe prioridade máxima.</p>
          </div>
          <Button disabled={hasOwnRequest} onClick={() => setDialogOpen(true)}>
            {hasOwnRequest ? "Solicitação enviada" : "Nova solicitação"}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {romRequests.length ? romRequests.map((request) => {
            const votes = request.voteCount || 0;
            const atLimit = votes >= 15;
            const isOwnRequest = request.authorUid === userId;
            const hasVoted = votedIds.includes(request.id);
            return (
              <article className="retronexo-card flex min-h-56 flex-col" key={request.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><p className="text-sm text-retronexo-blue">{request.emulator}</p><h2 className="mt-1 text-xl text-retronexo-white">{request.title}</h2></div>
                  {request.priority && <span className="rounded-full bg-retronexo-pink/15 px-2 py-1 text-xs text-retronexo-pink">Prioridade máxima</span>}
                </div>
                <p className="mt-2 text-sm text-retronexo-grey-100">Pedido por {request.authorName}</p>
                {request.note && <p className="mt-3 line-clamp-2 text-sm text-retronexo-grey-100">{request.note}</p>}
                <div className="mt-auto pt-5">
                  <VoteProgress votes={votes} />
                  <Button className="mt-3 w-full" disabled={isOwnRequest || hasVoted || atLimit} onClick={() => void vote(request)} variant="secondary">
                    {isOwnRequest ? "Sua solicitação" : atLimit ? "Prioridade atingida" : hasVoted ? "Voto registrado" : "Votar nesta ROM"}
                  </Button>
                </div>
              </article>
            );
          }) : <div className="retronexo-card col-span-full text-retronexo-grey-100">Ainda não há solicitações de ROM.</div>}
        </div>

        {dialogOpen && (
          <Dialog title="Nova solicitação" description="Você pode enviar uma única solicitação de ROM." onClose={() => setDialogOpen(false)}>
            <form noValidate onSubmit={form.handleSubmit(submitRequest)}>
              <label className="text-sm text-retronexo-grey-100" htmlFor="request-title">Nome da ROM</label>
              <Controller control={form.control} name="title" render={({ field }) => <input {...field} className="retronexo-input mt-2" id="request-title" placeholder="Ex.: Metroid Fusion" />} />
              {form.formState.errors.title && <p className="mt-1 text-sm text-retronexo-pink">{form.formState.errors.title.message}</p>}
              <label className="mt-4 block text-sm text-retronexo-grey-100" htmlFor="request-emulator">Plataforma</label>
              <Controller control={form.control} name="emulator" render={({ field }) => <input {...field} className="retronexo-input mt-2" id="request-emulator" placeholder="GBA" />} />
              {form.formState.errors.emulator && <p className="mt-1 text-sm text-retronexo-pink">{form.formState.errors.emulator.message}</p>}
              <label className="mt-4 block text-sm text-retronexo-grey-100" htmlFor="request-note">Observação opcional</label>
              <Controller control={form.control} name="note" render={({ field }) => <textarea {...field} className="retronexo-input mt-2 min-h-24 resize-y" id="request-note" placeholder="Versão, região ou detalhes úteis" />} />
              {form.formState.errors.note && <p className="mt-1 text-sm text-retronexo-pink">{form.formState.errors.note.message}</p>}
              <Button className="mt-5 w-full" disabled={form.formState.isSubmitting} type="submit">Enviar solicitação</Button>
            </form>
          </Dialog>
        )}
      </section>
    </DefaultLayout>
  );
}
