import  { forwardRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/utils';
import { SidebarToggle } from './';
import { useDemo1Layout } from '../Demo1LayoutProvider';
const SidebarHeader = forwardRef((props, ref) => {
  const {
    layout
  } = useDemo1Layout();
  const lightLogo = () => <Fragment>
      <Link to="/" className="dark:hidden">
        <img src={toAbsoluteUrl('/media/app/logo-L-D.png')} className="default-logo min-h-[22px] max-w-none" alt="Troving logo" />
        <img src={toAbsoluteUrl('/media/app/logo-S-D.png')} className="small-logo min-h-[22px] max-w-none" alt="Troving logo" />
      </Link>
      <Link to="/" className="hidden dark:block">
        <img src={toAbsoluteUrl('/media/app/Logo-L-W.png')} className="default-logo min-h-[22px] max-w-none" alt="Troving logo" />
        <img src={toAbsoluteUrl('/media/app/logo-S-W.png')} className="small-logo min-h-[22px] max-w-none" alt="Troving logo" />
      </Link>
    </Fragment>;
  const darkLogo = () => <Link to="/">
      <img src={toAbsoluteUrl('/media/app/Logo-L-W.png')} className="default-logo min-h-[22px] max-w-none" alt="Troving logo" />
      <img src={toAbsoluteUrl('/media/app/logo-S-W.png')} className="small-logo min-h-[22px] max-w-none" alt="Troving logo" />
    </Link>;
  return (
  <div ref={ref} className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0">
    <div className="flex items-center gap-2">
      {layout.options.sidebar.theme === 'light' ? lightLogo() : darkLogo()}
    </div>
    <div className="relative z-10">
      <SidebarToggle />
    </div>
    </div>
)});
SidebarHeader.displayName = 'SidebarHeader';

export { SidebarHeader };
