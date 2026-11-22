function StatusDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
    </span>
  );
}

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{title}</p>
      <p className="nums mt-2 text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">AutoChannel</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            <StatusDot /> Tizim ishlayapti
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
        >
          To&apos;xtatish
        </button>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Keyingi Reels" value="—" hint="Joylashish vaqti kutilmoqda" />
        <StatCard title="7 kunlik ko'rishlar" value="—" hint="Akkaunt ulangach ko'rinadi" />
        <StatCard title="Obunachilar" value="—" hint="O'sish dinamikasi" />
        <StatCard title="Bugungi xarajat" value="$0.00" hint="Bepul tariflar limiti ichida" />
      </section>

      <section className="card mt-6 p-6">
        <h2 className="text-lg font-semibold">Jonli pipeline</h2>
        <ol className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
          {["G'oya", "Ssenariy", "Ovoz", "Video", "QA", "Joylash"].map((step, i, arr) => (
            <li key={step} className="flex items-center gap-2">
              <span className="rounded-lg bg-surface border border-border px-3 py-1.5">{step}</span>
              {i < arr.length - 1 && <span aria-hidden>→</span>}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted">
          Bu boshlang&apos;ich skelet — ma&apos;lumotlar API ulanganidan keyin jonli yangilanadi.
        </p>
      </section>
    </main>
  );
}
