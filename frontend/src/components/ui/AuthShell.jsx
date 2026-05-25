import BrandLogo from '../BrandLogo.jsx';

export default function AuthShell({ title, description, asideTitle, asideItems, children }) {
  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#e7edf7] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="hidden bg-slate-950 p-10 text-white lg:block">
          <BrandLogo to="/" className="mb-12" textClassName="text-white" />
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">
            PortoBuilder Workspace
          </p>
          <h1 className="mt-4 max-w-md text-4xl font-extrabold leading-tight">{asideTitle}</h1>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {['ATS', 'AI', 'PDF'].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-4 text-center text-sm font-black text-white"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-4">
            {asideItems?.map((item, index) => (
              <div
                key={item}
                className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.05] p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-sm font-black text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-white/70">{item}</p>
              </div>
            ))}
          </div>
        </aside>
        <main className="bg-white p-5 sm:p-8">
          <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-4 lg:hidden">
            <BrandLogo to="/" textClassName="text-slate-950" />
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
