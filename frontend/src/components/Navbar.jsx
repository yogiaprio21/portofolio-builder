import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="
      fixed top-0 left-0 w-full z-40
      bg-white/70 backdrop-blur-xl
      border-b border-white/30
      shadow-[0_4px_20px_rgba(0,0,0,0.05)]
    ">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/app"
          className="text-2xl font-bold tracking-wide text-blue-600 hover:text-blue-700 transition"
        >
          PortoBuilder
        </Link>

        {/* NAV */}
        <nav className="flex gap-3 items-center">

          <Link
            to="/app/create"
            className="
              px-4 py-2 rounded-lg
              bg-blue-600 text-white
              shadow-md shadow-blue-600/20
              hover:bg-blue-700 hover:shadow-blue-700/30
              transition font-medium
            "
          >
            Create
          </Link>

        </nav>
      </div>
    </header>
  )
}
