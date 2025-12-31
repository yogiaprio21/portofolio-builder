export default function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <label className="block mb-5">
      <div className="text-sm font-semibold text-gray-200 mb-2 tracking-wide">
        {label}
      </div>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full p-3.5 rounded-xl
          bg-white/90 text-black
          border border-gray-300
          shadow-sm
          transition-all duration-300

          hover:bg-white
          focus:bg-white
          focus:border-blue-500
          focus:shadow-[0_0_12px_rgba(59,130,246,0.4)]
          focus:outline-none
        "
      />
    </label>
  );
}
