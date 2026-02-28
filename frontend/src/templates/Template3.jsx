export default function Template3({ data = {} }) {
  const {
    name = 'Nama',
    email = 'email@domain.com',
    bio = 'Bio',
    skills = '',
    experience = '',
  } = data;

  return (
    <div
      className="p-10 rounded-xl shadow-md leading-relaxed"
      style={{
        background: 'linear-gradient(135deg, #ffffff, #f3f4ff)',
      }}
    >
      <header className="mb-8 pb-3 border-b border-gray-300/40">
        <h1 className="text-3xl font-bold text-primary">{name}</h1>
        <div className="text-sm text-gray-600 mt-1">{email}</div>
      </header>

      <section className="mb-6">
        <h4 className="font-semibold text-lg mb-1 text-primary">Bio</h4>
        <p>{bio}</p>
      </section>

      <section className="mb-6">
        <h4 className="font-semibold text-lg mb-2 text-primary">Skills</h4>
        <div className="flex flex-wrap gap-2">
          {(skills || '').split(',').map((s, i) =>
            s.trim() ? (
              <span key={i} className="text-sm px-3 py-1 bg-white border rounded-full shadow-sm">
                {s.trim()}
              </span>
            ) : null,
          )}
        </div>
      </section>

      <section>
        <h4 className="font-semibold text-lg mb-1 text-primary">Experience</h4>
        <p>{experience}</p>
      </section>
    </div>
  );
}
