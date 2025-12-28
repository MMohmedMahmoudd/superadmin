import clsx from 'clsx';
import React from 'react';
import { DataGridTableHeadRowsSelect, useDataGrid } from '..';
const DataGridTableHead = ({
  children,
  className
}) => {
  const {
    props
  } = useDataGrid();
  return <thead className={clsx(className && className)}>
      <tr key={0}>
        {props.rowSelect && <DataGridTableHeadRowsSelect />}
        {children}
      </tr>
    </thead>;
};
export { DataGridTableHead };