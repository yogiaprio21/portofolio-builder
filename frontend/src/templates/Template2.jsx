export default function Template2({ data = {} }) {
  const {
    name = 'Nama',
    email = 'email@domain.com',
    bio = 'Bio',
    skills = '',
    experience = ''
  } = data

  return (
    <div className="bg-[#0f172a] text-white p-8 rounded-xl leading-relaxed shadow-lg">
      <header className="mb-8 pb-3 border-b border-white/10">
        <h1 className="text-4xl font-bold">{name}</h1>
        <div className="text-sm opacity-80 mt-1">{email}</div>
      </header>

      <section className="mb-6">
        <h4 className="font-semibold text-lg mb-1">Bio</h4>
        <p className="opacity-90">{bio}</p>
      </section>

      <section className="mb-6">
        <h4 className="font-semibold text-lg mb-2">Skills</h4>
        <div className="flex flex-wrap gap-2">
          {(skills || '')
            .split(',')
            .map((s, i) =>
              s.trim() ? (
                <span
                  key={i}
                  className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-sm"
                >
                  {s.trim()}
                </span>
              ) : null
            )}
        </div>
      </section>

      <section>
        <h4 className="font-semibold text-lg mb-1">Experience</h4>
        <p className="opacity-90">{experience}</p>
      </section>
    </div>
  )
}
