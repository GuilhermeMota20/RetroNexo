import { useEffect, useState } from "react";
import { faArrowUpRightFromSquare, faThumbtack } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../components/Button";
import { Dialog } from "../components/Dialog";
import { DefaultLayout } from "../Layouts/DefaultLayout";
import { getNewsPosts, type NewsPost } from "../lib/prismic";
import { useAppStore } from "../store/useAppStore";

function formatPublishedDate(value?: string) {
  const date = value?.trim();
  if (!date) return "";

  // Campos Date do Prismic são retornados como AAAA-MM-DD. Criar a data localmente
  // evita que o fuso horário mostre o dia anterior em navegadores das Américas.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const parsed = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export function NewsPage() {
  const theme = useAppStore((state) => state.theme);
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [openPost, setOpenPost] = useState<NewsPost | null>(null);
  const [status, setStatus] = useState("Carregando atualizações...");

  useEffect(() => {
    getNewsPosts()
      .then((items) => {
        setPosts(items);
        setStatus(items.length ? "" : "Nenhuma novidade publicada no CMS ainda.");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "Não foi possível carregar as novidades."));
  }, []);

  return (
    <DefaultLayout>
      <section>
        <div className="mb-8">
          <p className="text-sm text-retronexo-blue">CENTRAL RETRONEXO</p>
          <h1 className="mt-1 text-4xl text-retronexo-white sm:text-5xl">Novidades</h1>
          <p className="mt-2 max-w-2xl text-retronexo-grey-100">Atualizações da plataforma e novidades da biblioteca.</p>
        </div>

        <section aria-labelledby="updates-title">
          {posts.length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => {
                const imageUrl = theme === "dark" ? post.darkImageUrl || post.imageUrl : post.imageUrl;
                const publishedDate = formatPublishedDate(post.publishedAt);

                return (
                  <article
                    className={`group relative min-w-0 overflow-hidden rounded-lg border border-retronexo-border bg-retronexo-grey-300 p-0 shadow-[-10px_10px_0_#100F18] transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-1 hover:border-retronexo-blue hover:shadow-[-12px_12px_0_#100F18] ${post.fixed
                      ? "md:col-span-2 xl:col-span-3"
                      : ""
                    }`}
                    key={post.id}
                  >
                    {post.fixed && (
                      <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-md border border-retronexo-border bg-retronexo-grey-400 px-3 py-1 text-xs text-retronexo-blue shadow-[-4px_4px_0_#100F18]">
                        <FontAwesomeIcon aria-hidden="true" icon={faThumbtack} />
                        EM DESTAQUE
                      </div>
                    )}
                    {imageUrl && (post.fixed ? (
                      <div className="news-image-frame news-image-frame-featured">
                        <img
                          alt=""
                          className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-72"
                          src={imageUrl}
                        />
                      </div>
                    ) : (
                      <img
                        alt=""
                        className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        src={imageUrl}
                      />
                    ))}
                    <div className={post.fixed ? "relative p-5 sm:p-7" : "p-4"}>
                      {publishedDate && <p className="text-xs text-retronexo-blue">{publishedDate}</p>}
                      <h3 className={`mt-1 break-words text-retronexo-white ${post.fixed ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{post.title}</h3>
                      {post.excerpt && <p className={`mt-3 whitespace-pre-line text-sm leading-relaxed text-retronexo-grey-100 ${post.fixed ? "line-clamp-3 max-w-4xl sm:text-base" : "line-clamp-4"}`}>{post.excerpt}</p>}
                      <Button className="mt-5" onClick={() => setOpenPost(post)} variant={post.fixed ? "primary" : "secondary"}>
                        Ler novidade <FontAwesomeIcon aria-hidden="true" className="ml-1" icon={faArrowUpRightFromSquare} />
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="retronexo-card mt-4 text-retronexo-grey-100">{status}</div>
          )}
        </section>
      </section>

      {openPost && (
        <Dialog
          className="max-w-3xl sm:p-7"
          description={formatPublishedDate(openPost.publishedAt) ? `PUBLICADO EM ${formatPublishedDate(openPost.publishedAt)}` : undefined}
          onClose={() => setOpenPost(null)}
          title={openPost.title}
        >
          {(() => {
            const imageUrl = theme === "dark" ? openPost.darkImageUrl || openPost.imageUrl : openPost.imageUrl;
            return imageUrl ? (
              <div className="news-image-frame mb-6">
                <img alt="" className="max-h-80 w-full object-cover" src={imageUrl} />
              </div>
            ) : null;
          })()}
          <div className="break-words whitespace-pre-line text-sm leading-relaxed text-retronexo-grey-100 sm:text-base">
            {openPost.content || openPost.excerpt}
          </div>
        </Dialog>
      )}
    </DefaultLayout>
  );
}
