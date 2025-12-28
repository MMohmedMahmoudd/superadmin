import { Fragment, useId } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { useAuthContext } from '@/auth';
import { useLanguage } from '@/i18n';
import { toAbsoluteUrl } from '@/utils';
import { DropdownUserLanguages } from './DropdownUserLanguages';
import { useSettings } from '@/providers/SettingsProvider';
import {  KeenIcon } from '@/components';
import { MenuSub, MenuSeparator } from '@/components/menu';
/* eslint-disable react/prop-types */
const DropdownUser = ({
  menuItemRef
}) => {
  const { settings, storeSettings } = useSettings();
  const { currentUser, isLoading, logout } = useAuthContext();
  useLanguage();
  const handleThemeMode = event => {
    const newThemeMode = event.target.checked ? 'dark' : 'light';
    storeSettings({
      themeMode: newThemeMode
    });
  };
  const getProfileField = (path, fallback = '') => {
    try {
      const root = currentUser?.data ?? currentUser ?? {};
      return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), root) ?? fallback;
    } catch {
      return fallback;
    }
  };

  const profileName = getProfileField('name', '');
  const profileEmail = getProfileField('email', '');
  const profileImage = getProfileField('image', null);

  const buildHeader = () => {
    return <div className="flex items-center justify-between px-5 py-1.5 gap-1.5">
        <div className="flex items-center gap-2">
          <img
            className="size-9 rounded-full border-2 border-success object-cover"
            src={profileImage || toAbsoluteUrl('/media/avatars/blank.png')}
            alt={profileName || 'User avatar'}
            onError={(e) => { e.target.onerror = null; e.target.src = toAbsoluteUrl('/media/avatars/blank.png'); }}
          />
          <div className="flex flex-col gap-1.5">
            <Link to="/account/hoteme/get-stard" className="text-sm text-gray-800 hover:text-primary font-semibold leading-none">
              {profileName || 'User'}
            </Link>
            <a href={profileEmail ? `mailto:${profileEmail}` : undefined} className="text-xs text-gray-600 hover:text-primary font-medium leading-none">
              {profileEmail || ''}
            </a>
          </div>
        </div>
        <span className="badge badge-xs badge-primary badge-outline">Pro</span>
      </div>;
  };
  const buildMenu = () => {
    return <Fragment>
        <MenuSeparator />
        <div className="flex flex-col">
          <DropdownUserLanguages menuItemRef={menuItemRef} />
          <MenuSeparator />
        </div>
      </Fragment>;
  };
  const buildFooter = () => {
    const darkModeTitleId = darkModeId;
    return <div className="flex flex-col">
        <div className="menu-item mb-0.5">
          <div className="menu-link">
            <span className="menu-icon">
              <KeenIcon icon="moon" />
            </span>
            <span className="menu-title" id={darkModeTitleId}>
              <FormattedMessage id="USER.MENU.DARK_MODE" />
            </span>
            <label className="switch switch-sm">
              <input
                name="theme"
                type="checkbox"
                checked={settings.themeMode === 'dark'}
                onChange={handleThemeMode}
                value="1"
                aria-labelledby={darkModeTitleId}
                aria-label="Dark mode"
                role="switch"
                aria-checked={settings.themeMode === 'dark'}
                title="Toggle dark mode"
              />
            </label>
          </div>
        </div>

        <div className="menu-item px-4 py-1.5">
          <a onClick={logout} className="btn btn-sm btn-light justify-center">
            <FormattedMessage id="USER.MENU.LOGOUT" />
          </a>
        </div>
      </div>;
  };
  useId();
  const darkModeId = useId();
  if (isLoading) return null;

  return <MenuSub className="menu-default light:border-gray-300 w-[200px] md:w-[250px]" rootClassName="p-0">
      {buildHeader()}
      {buildMenu()}
      {buildFooter()}
    </MenuSub>;
};
export { DropdownUser };