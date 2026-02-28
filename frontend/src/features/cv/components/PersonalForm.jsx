export default function PersonalForm({ value, onChange, errors, attemptSubmit, markIfError }) {
  const shouldShowError = (key, fieldValue) =>
    Boolean(errors[key]) && (attemptSubmit || Boolean(fieldValue && fieldValue.trim()));
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="personal-full-name" className="text-sm text-slate-700">
          Nama Lengkap*
        </label>
        <input
          id="personal-full-name"
          value={value.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          aria-required="true"
          aria-invalid={Boolean(errors['personal.fullName'])}
          className={`w-full p-3 mt-1 rounded-lg text-black border ${markIfError(
            'personal.fullName',
          )}`}
          placeholder="Nama lengkap"
        />
        {attemptSubmit && errors['personal.fullName'] && (
          <div className="text-xs text-red-600 mt-1">{errors['personal.fullName']}</div>
        )}
      </div>
      <div>
        <label htmlFor="personal-headline" className="text-sm text-slate-700">
          Headline
        </label>
        <input
          id="personal-headline"
          value={value.headline}
          onChange={(e) => onChange('headline', e.target.value)}
          className="w-full p-3 mt-1 rounded-lg text-black border border-slate-200"
          placeholder="Contoh: Product Designer"
        />
      </div>
      <div>
        <label htmlFor="personal-email" className="text-sm text-slate-700">
          Email*
        </label>
        <input
          id="personal-email"
          value={value.email}
          onChange={(e) => onChange('email', e.target.value)}
          type="email"
          aria-required="true"
          aria-invalid={Boolean(errors['personal.email'])}
          className={`w-full p-3 mt-1 rounded-lg text-black border ${markIfError(
            'personal.email',
          )}`}
          placeholder="email@example.com"
        />
        {shouldShowError('personal.email', value.email) && (
          <div className="text-xs text-red-600 mt-1">{errors['personal.email']}</div>
        )}
      </div>
      <div>
        <label htmlFor="personal-phone" className="text-sm text-slate-700">
          Telepon
        </label>
        <input
          id="personal-phone"
          value={value.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          aria-invalid={Boolean(errors['personal.phone'])}
          className={`w-full p-3 mt-1 rounded-lg text-black border ${markIfError(
            'personal.phone',
          )}`}
          placeholder="+62 812 3456 7890"
        />
        {shouldShowError('personal.phone', value.phone) && (
          <div className="text-xs text-red-600 mt-1">{errors['personal.phone']}</div>
        )}
      </div>
      <div>
        <label htmlFor="personal-location" className="text-sm text-slate-700">
          Lokasi
        </label>
        <input
          id="personal-location"
          value={value.location}
          onChange={(e) => onChange('location', e.target.value)}
          className="w-full p-3 mt-1 rounded-lg text-black border border-slate-200"
          placeholder="Jakarta, Indonesia"
        />
      </div>
      <div>
        <label htmlFor="personal-website" className="text-sm text-slate-700">
          Website
        </label>
        <input
          id="personal-website"
          value={value.website}
          onChange={(e) => onChange('website', e.target.value)}
          aria-invalid={Boolean(errors['personal.website'])}
          className={`w-full p-3 mt-1 rounded-lg text-black border ${markIfError(
            'personal.website',
          )}`}
          placeholder="https://portfolio.me"
        />
        {shouldShowError('personal.website', value.website) && (
          <div className="text-xs text-red-600 mt-1">{errors['personal.website']}</div>
        )}
      </div>
      <div>
        <label htmlFor="personal-linkedin" className="text-sm text-slate-700">
          LinkedIn
        </label>
        <input
          id="personal-linkedin"
          value={value.linkedin}
          onChange={(e) => onChange('linkedin', e.target.value)}
          aria-invalid={Boolean(errors['personal.linkedin'])}
          className={`w-full p-3 mt-1 rounded-lg text-black border ${markIfError(
            'personal.linkedin',
          )}`}
          placeholder="linkedin.com/in/nama"
        />
        {shouldShowError('personal.linkedin', value.linkedin) && (
          <div className="text-xs text-red-600 mt-1">{errors['personal.linkedin']}</div>
        )}
      </div>
      <div>
        <label htmlFor="personal-github" className="text-sm text-slate-700">
          GitHub
        </label>
        <input
          id="personal-github"
          value={value.github}
          onChange={(e) => onChange('github', e.target.value)}
          aria-invalid={Boolean(errors['personal.github'])}
          className={`w-full p-3 mt-1 rounded-lg text-black border ${markIfError(
            'personal.github',
          )}`}
          placeholder="github.com/nama"
        />
        {shouldShowError('personal.github', value.github) && (
          <div className="text-xs text-red-600 mt-1">{errors['personal.github']}</div>
        )}
      </div>
    </div>
  );
}
