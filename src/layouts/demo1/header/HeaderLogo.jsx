import { Link } from 'react-router-dom';
import { KeenIcon } from '@/components/keenicons';
import { toAbsoluteUrl } from '@/utils';
import { useDemo1Layout } from '../Demo1LayoutProvider';
const HeaderLogo = () => {
  const {
    setMobileSidebarOpen,
    setMobileMegaMenuOpen,
    megaMenuEnabled
  } = useDemo1Layout();
  const handleSidebarOpen = () => {
    setMobileSidebarOpen(true);
  };
  const handleMegaMenuOpen = () => {
    setMobileMegaMenuOpen(true);
  };
  return <div className="flex gap-1 lg:hidden items-center -ms-1">
      <Link to="/" className="shrink-0">
        <img src={toAbsoluteUrl('/media/app/logo-logo.png')} className="max-h-[25px] w-full" alt="Troving logo" />
      </Link>

      <div className="flex items-center">
        <button type="button" className="btn btn-icon btn-light btn-clear btn-sm" onClick={handleSidebarOpen} aria-label="Open sidebar menu" title="Open sidebar menu">
          <KeenIcon icon="menu" aria-hidden="true" />
        </button>

        {megaMenuEnabled && <button type="button" className="btn btn-icon btn-light btn-clear btn-sm" onClick={handleMegaMenuOpen} aria-label="Open mega menu" title="Open mega menu">
            <KeenIcon icon="burger-menu-2" aria-hidden="true" />
          </button>}
      </div>
    </div>;
};
export { HeaderLogo };