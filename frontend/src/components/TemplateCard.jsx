export default function TemplateCard({ preview, title, onSelect, selected }) {
  return (
    <div
      onClick={onSelect}
      className={`
        cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300
        ${
          selected
            ? 'border-primary shadow-xl scale-[1.03] bg-white'
            : 'border-gray-200 hover:shadow-lg hover:scale-[1.02]'
        }
      `}
    >
      <div className="w-full h-44 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        {preview ? preview : <div className="text-gray-500 text-sm">{title}</div>}
      </div>

      <div className="p-4 bg-white">
        <div className="font-semibold text-gray-800">{title}</div>
        {selected && (
          <div className="text-primary text-xs mt-1 font-medium tracking-wide">
            Selected template
          </div>
        )}
      </div>
    </div>
  );
}
