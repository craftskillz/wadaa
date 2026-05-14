type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mb-6">
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-violet-700">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          {description}
        </p>
      ) : null}
    </header>
  );
}
