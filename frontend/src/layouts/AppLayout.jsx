import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';

export default function AppLayout() {
  const navigation = useNavigation();
  const location = useLocation();
  const isNavigating = Boolean(navigation.location);
  const showFooter = ['/app/privacy', '/app/terms'].includes(location.pathname);

  return (
    <>
      <Navbar />
      {isNavigating && (
        <div className="fixed left-0 right-0 top-[68px] z-50 h-0.5 overflow-hidden bg-slate-200">
          <div className="h-full w-1/3 animate-pulse bg-blue-600" />
        </div>
      )}
      <main className="app-surface min-h-screen pt-[68px]">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </>
  );
}
