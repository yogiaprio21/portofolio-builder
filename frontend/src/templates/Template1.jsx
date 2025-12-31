export default function Template1({ data = {} }) {
  const {
    name = 'Nama Lengkap',
    email = 'email@domain.com',
    bio = 'Bio singkat',
    skills = '',
    experience = ''
  } = data

  return (
    <div className="font-sans text-gray-800 leading-relaxed">
      <header className="mb-8 pb-4 border-b">
        <h1 className="text-4xl font-bold text-primary">{name}</h1>
        <div className="text-base text-gray-600 mt-2">{email}</div>
      </header>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2 text-primary">About</h3>
        <p className="text-gray-700">{bio}</p>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-primary">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {(skills || '')
            .split(',')
            .map((s, i) =>
              s.trim() ? (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 border rounded-full text-sm"
                >
                  {s.trim()}
                </span>
              ) : null
            )}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-2 text-primary">Experience</h3>
        <p className="text-gray-700">{experience}</p>
      </section>
    </div>
  )
}
