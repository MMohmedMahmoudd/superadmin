import { KeenIcon, MenuIcon, MenuItem, MenuLink, MenuSub, MenuTitle } from '@/components';
const DropdownCardItem1 = ({ onDelete, onExport }) => {
  return (
    <MenuSub className="menu-default" rootClassName="w-full max-w-[175px]">
    <MenuItem onClick={onExport}>
      <MenuLink>
        <MenuIcon><KeenIcon icon="file-up" /></MenuIcon>
        <MenuTitle>Export</MenuTitle>
      </MenuLink>
    </MenuItem>
    <MenuItem onClick={onDelete}>
      <MenuLink>
        <MenuIcon><KeenIcon icon="trash" /></MenuIcon>
        <MenuTitle>Delete</MenuTitle>
      </MenuLink>
    </MenuItem>
    </MenuSub>
  );
};

export { DropdownCardItem1 };
