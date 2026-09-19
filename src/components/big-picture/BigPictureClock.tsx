import { useEffect, useState } from "react";

const formatTime = (date: Date) => new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
}).format(date);

/** Relógio independente para a área superior da biblioteca. */
export function BigPictureClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return <time className="big-picture-clock" dateTime={time.toISOString()}>{formatTime(time)}</time>;
}
