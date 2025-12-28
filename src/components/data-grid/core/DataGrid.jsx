/* eslint-disable no-unused-vars */

import { DataGridInner, DataGridProvider } from '.';
const DataGrid = props => {
  return <DataGridProvider {...props}>
      <DataGridInner />
    </DataGridProvider>;
};
export { DataGrid };