import clsx from 'clsx';
const MenuToggle = ({
  className,
  hasItemSub = false,
  handleToggle,
  children,
  ...props
}) => {
  if (hasItemSub) {
    return <div className={clsx('menu-toggle', className && className)} onClick={handleToggle} {...props}>
        {children}
      </div>;
  } else {
    return <div className={clsx('menu-toggle', className && className)} {...props}>{children}</div>;
  }
};
export { MenuToggle };