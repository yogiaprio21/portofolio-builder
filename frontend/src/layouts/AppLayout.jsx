import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-900 min-h-screen pt-[76px]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
