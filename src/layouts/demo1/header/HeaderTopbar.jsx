import { useRef } from 'react';
// import { KeenIcon } from '@/components/keenicons';
import { toAbsoluteUrl } from '@/utils';
import { Menu, MenuItem, MenuToggle } from '@/components';
import { DropdownUser } from '@/partials/dropdowns/user';
import { useAuthContext } from '@/auth';
// import { DropdownNotifications } from '@/partials/dropdowns/notifications';
// import { DropdownApps } from '@/partials/dropdowns/apps';
// import { DropdownChat } from '@/partials/dropdowns/chat';
// import { ModalSearch } from '@/partials/modals/search/ModalSearch';
import { useLanguage } from '@/i18n';
const HeaderTopbar = () => {
  const {
    isRTL
  } = useLanguage();
  // const itemChatRef = useRef(null);
  // const itemAppsRef = useRef(null);
  const itemUserRef = useRef(null);
  const { currentUser } = useAuthContext();
  const profileRoot = currentUser?.data ?? currentUser ?? {};
  const avatar = profileRoot?.image || toAbsoluteUrl('/media/avatars/blank.png');
  const altName = profileRoot?.name || 'User avatar';
  // const itemNotificationsRef = useRef(null);
  // const handleShow = () => {
  //   window.dispatchEvent(new Event('resize'));
  // };
  // const [searchModalOpen, setSearchModalOpen] = useState(false);
  // const handleOpen = () => setSearchModalOpen(true);
  // const handleClose = () => {
  //   setSearchModalOpen(false);
  // };
  return <div className="flex items-center gap-2 lg:gap-3.5">
      {/* <button onClick={handleOpen} className="btn btn-icon btn-icon-lg size-9 rounded-full hover:bg-primary-light hover:text-primary text-gray-500" aria-label="Search" title="Search">
        <KeenIcon icon="magnifier" aria-hidden="true" />
      </button>
      <ModalSearch open={searchModalOpen} onClose={handleClose} />

      <Menu>
        <MenuItem ref={itemChatRef} onShow={handleShow} toggle="dropdown" trigger="click" dropdownProps={{
        placement: isRTL() ? 'bottom-start' : 'bottom-end',
        modifiers: [{
          name: 'offset',
          options: {
            offset: isRTL() ? [-170, 10] : [170, 10]
          }
        }]
      }}>
          <MenuToggle className="btn btn-icon btn-icon-lg size-9 rounded-full hover:bg-primary-light hover:text-primary dropdown-open:bg-primary-light dropdown-open:text-primary text-gray-500" aria-label="Chat messages" title="Chat messages">
            <KeenIcon icon="messages" aria-hidden="true" />
          </MenuToggle>

          {DropdownChat({
          menuTtemRef: itemChatRef
        })}
        </MenuItem>
      </Menu>

      <Menu>
        <MenuItem ref={itemAppsRef} toggle="dropdown" trigger="click" dropdownProps={{
        placement: isRTL() ? 'bottom-start' : 'bottom-end',
        modifiers: [{
          name: 'offset',
          options: {
            offset: isRTL() ? [10, 10] : [-10, 10]
          }
        }]
      }}>
          <MenuToggle className="btn btn-icon btn-icon-lg size-9 rounded-full hover:bg-primary-light hover:text-primary dropdown-open:bg-primary-light dropdown-open:text-primary text-gray-500" aria-label="Apps" title="Apps">
            <KeenIcon icon="element-11" aria-hidden="true" />
          </MenuToggle>

          {DropdownApps()}
        </MenuItem>
      </Menu>

      <Menu>
        <MenuItem ref={itemNotificationsRef} toggle="dropdown" trigger="click" dropdownProps={{
        placement: isRTL() ? 'bottom-start' : 'bottom-end',
        modifiers: [{
          name: 'offset',
          options: {
            offset: isRTL() ? [70, 10] : [-70, 10] // [skid, distance]
          }
        }]
      }}>
          <MenuToggle className="btn btn-icon btn-icon-lg relative cursor-pointer size-9 rounded-full hover:bg-primary-light hover:text-primary dropdown-open:bg-primary-light dropdown-open:text-primary text-gray-500" aria-label="Notifications" title="Notifications">
            <KeenIcon icon="notification-status" aria-hidden="true" />
          </MenuToggle>
          {DropdownNotifications({
          menuTtemRef: itemNotificationsRef
        })}
        </MenuItem>
      </Menu> */}

      <Menu>
        <MenuItem ref={itemUserRef} toggle="dropdown" trigger="click" dropdownProps={{
        placement: isRTL() ? 'bottom-start' : 'bottom-end',
        modifiers: [{
          name: 'offset',
          options: {
            offset: isRTL() ? [-20, 10] : [20, 10] // [skid, distance]
          }
        }]
      }}>
          <MenuToggle className="btn btn-icon rounded-full" aria-label="User menu" title="User menu">
            <img
              className="size-9 rounded-full border-2 border-success shrink-0 object-cover"
              src={avatar}
              alt={altName}
              onError={(e) => { e.target.onerror = null; e.target.src = toAbsoluteUrl('/media/avatars/blank.png'); }}
            />
          </MenuToggle>
          {DropdownUser({
          menuItemRef: itemUserRef
        })}
        </MenuItem>
      </Menu>
    </div>;
};
export { HeaderTopbar };