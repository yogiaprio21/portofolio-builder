export default function ThemeControls({ theme, setTheme, fontOptions, compact = false }) {
  const inputClass = compact
    ? 'mt-2 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950'
    : 'mt-2 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-950';

  return (
    <div className={compact ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-3'}>
      <label className="text-sm font-semibold text-slate-700">
        Warna Aksen
        <input
          type="color"
          value={theme.accentColor}
          onChange={(event) => setTheme((prev) => ({ ...prev, accentColor: event.target.value }))}
          className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white p-1"
        />
      </label>
      {!compact && (
        <>
          <label className="text-sm font-semibold text-slate-700">
            Warna Latar
            <input
              type="color"
              value={theme.backgroundColor}
              onChange={(event) =>
                setTheme((prev) => ({ ...prev, backgroundColor: event.target.value }))
              }
              className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white p-1"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Warna Teks
            <input
              type="color"
              value={theme.textColor}
              onChange={(event) => setTheme((prev) => ({ ...prev, textColor: event.target.value }))}
              className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white p-1"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Font
            <select
              value={theme.fontFamily}
              onChange={(event) =>
                setTheme((prev) => ({ ...prev, fontFamily: event.target.value }))
              }
              className={inputClass}
            >
              {fontOptions.map((font) => (
                <option key={font} value={font}>
                  {font.split(',')[0]}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      <label className="text-sm font-semibold text-slate-700">
        Layout
        <select
          value={theme.layout}
          onChange={(event) => setTheme((prev) => ({ ...prev, layout: event.target.value }))}
          className={inputClass}
        >
          <option value="single">Single Column</option>
          <option value="sidebar-left">Sidebar Left</option>
          <option value="sidebar-right">Sidebar Right</option>
          <option value="split">Split</option>
        </select>
      </label>
      {!compact && (
        <label className="text-sm font-semibold text-slate-700">
          Posisi Profil
          <select
            value={theme.profileAlignment || 'left'}
            onChange={(event) =>
              setTheme((prev) => ({ ...prev, profileAlignment: event.target.value }))
            }
            className={inputClass}
          >
            <option value="left">Rata Kiri</option>
            <option value="center">Rata Tengah</option>
            <option value="right">Rata Kanan</option>
          </select>
        </label>
      )}
    </div>
  );
}
