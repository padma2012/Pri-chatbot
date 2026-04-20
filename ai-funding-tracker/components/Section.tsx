export function Section({
  eyebrow,
  title,
  kicker,
  children,
}: {
  eyebrow: string;
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14 border-b border-ink-800">
      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.2em] text-accent-gold font-mono">
          {eyebrow}
        </div>
        <h2
          className="mt-2 font-serif text-4xl md:text-5xl text-ink-50 leading-tight"
          style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
        >
          {title}
        </h2>
        {kicker && <p className="mt-3 max-w-2xl text-ink-300">{kicker}</p>}
      </div>
      {children}
    </section>
  );
}

export function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-lg border border-ink-700 bg-ink-900 shadow-card overflow-hidden " + className
      }
    >
      {(title || subtitle) && (
        <div className="px-5 pt-5 pb-3 border-b border-ink-800">
          {title && (
            <h3 className="font-medium text-ink-100 tracking-tight">{title}</h3>
          )}
          {subtitle && <p className="mt-1 text-sm text-ink-400">{subtitle}</p>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
