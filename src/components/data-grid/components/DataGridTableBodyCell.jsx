import React from 'react';
const DataGridTableBodyCell = ({
  id,
  children,
  className
}) => {
  return <td key={id} className={className && className}>
      {children}
    </td>;
};
export { DataGridTableBodyCell };