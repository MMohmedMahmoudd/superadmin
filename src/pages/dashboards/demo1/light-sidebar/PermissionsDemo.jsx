import { usePermissionsContext } from '@/providers/PermissionsProvider';
import { PermissionGuard } from '@/components';
import { getMenuSidebar } from '@/config/menu.config';
import { useMenus } from '@/providers';

const PermissionsDemo = () => {
  const { 
    permissions, 
    canAccess, 
    canList, 
    canAdd, 
    canEdit, 
    canDelete, 
    hasPermission,
    shouldShowChild,
    filterMenuByPermissions,
    isAuthenticated,
    isLoading,
    error
  } = usePermissionsContext();

  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig('primary') || [];

  // Test menu filtering
  const testMenuFiltering = () => {
    const originalMenu = getMenuSidebar();
    const filteredMenu = filterMenuByPermissions ? filterMenuByPermissions(originalMenu) : originalMenu;
    
    return {
      original: originalMenu,
      filtered: filteredMenu
    };
  };

  const menuTest = testMenuFiltering();

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Permissions Demo</h3>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Permissions Demo</h3>
        </div>
        <div className="card-body">
          <div className="alert alert-danger">
            <strong>Error loading permissions:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Permissions Demo</h3>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <h4>Authentication Status</h4>
          <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>Permissions Loaded: {Object.keys(permissions).length > 0 ? 'Yes' : 'No'}</p>
          <p>Available Permission Groups: {Object.keys(permissions).join(', ')}</p>
        </div>

        <div className="mb-4">
          <h4>Raw Permissions Data</h4>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
            {JSON.stringify(permissions, null, 2)}
          </pre>
        </div>

        <div className="mb-4">
          <h4>Permission Checks</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5>Users Permissions</h5>
              <ul className="list-disc list-inside">
                <li>Can Access Users Menu: {canAccess('users') ? 'Yes' : 'No'}</li>
                <li>Can List Users: {canList('all-users') ? 'Yes' : 'No'}</li>
                <li>Can Add Users: {canAdd('add-User') ? 'Yes' : 'No'}</li>
                <li>Can Edit Users: {canEdit('User-profile') ? 'Yes' : 'No'}</li>
                <li>Can Delete Users: {canDelete('User-profile') ? 'Yes' : 'No'}</li>
              </ul>
            </div>
            <div>
              <h5>Providers Permissions (stuff)</h5>
              <ul className="list-disc list-inside">
                <li>Can Access Providers Menu: {canAccess('providers') ? 'Yes' : 'No'}</li>
                <li>Can List Providers: {canList('all-providers') ? 'Yes' : 'No'}</li>
                <li>Can Add Providers: {canAdd('add-provider') ? 'Yes' : 'No'}</li>
                <li>Can Edit Providers: {canEdit('Provider-profile') ? 'Yes' : 'No'}</li>
                <li>Can Delete Providers: {canDelete('Provider-profile') ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <h5>Business Permissions (providers)</h5>
              <ul className="list-disc list-inside">
                <li>Can Access Business Menu: {canAccess('Bussiness') ? 'Yes' : 'No'}</li>
                <li>Can List Business: {canList('all-Business') ? 'Yes' : 'No'}</li>
                <li>Can Add Business: {canAdd('add-Bussiness') ? 'Yes' : 'No'}</li>
                <li>Can Edit Business: {canEdit('Bussiness-Profile') ? 'Yes' : 'No'}</li>
              </ul>
            </div>
            <div>
              <h5>Main Categories Permissions (sp_types)</h5>
              <ul className="list-disc list-inside">
                <li>Can Access Categories Menu: {canAccess('main-categories') ? 'Yes' : 'No'}</li>
                <li>Can List Categories: {canList('All-Categories') ? 'Yes' : 'No'}</li>
                <li>Can Add Categories: {canAdd('Add-Category') ? 'Yes' : 'No'}</li>
                <li>Can Edit Categories: {canEdit('Edit-Category') ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4>Menu Filtering Test</h4>
          <p className="text-sm text-gray-600 mb-3">
            This section shows how the menu is filtered based on your permissions. 
            Items with permission = 0 should be hidden from the sidebar.
          </p>
          
          <div className="mb-4">
            <h5>🔍 Debug: Add Business Permission Check</h5>
            <div className="bg-yellow-100 p-3 rounded">
              <p><strong>Menu Key:</strong> add-Bussiness</p>
              <p><strong>Mapped Permission:</strong> providers.add</p>
              <p><strong>Current Value:</strong> {permissions?.providers?.add || 'undefined'}</p>
              <p><strong>Has Permission:</strong> {canAdd('add-Bussiness') ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Raw providers.add value:</strong> {JSON.stringify(permissions?.providers?.add)}</p>
              <p><strong>Permission check result:</strong> {hasPermission('add-Bussiness', 'add') ? '✅ Yes' : '❌ No'}</p>
              <p><strong>All providers permissions:</strong> {JSON.stringify(permissions?.providers)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h5>Original Menu Items</h5>
              <div className="bg-gray-100 p-3 rounded text-sm max-h-64 overflow-auto">
                {menuTest.original.map((item, index) => (
                  <div key={index} className="mb-2">
                    <strong>{item.title || item.heading}</strong>
                    {item.children && (
                      <ul className="ml-4 mt-1">
                        {item.children.map((child, childIndex) => (
                          <li key={childIndex} className="text-xs">
                            {child.title} (key: {child.key})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5>Filtered Menu Items (Based on Your Permissions)</h5>
              <div className="bg-green-100 p-3 rounded text-sm max-h-64 overflow-auto">
                {menuTest.filtered.map((item, index) => (
                  <div key={index} className="mb-2">
                    <strong>{item.title || item.heading}</strong>
                    {item.children && (
                      <ul className="ml-4 mt-1">
                        {item.children.map((child, childIndex) => (
                          <li key={childIndex} className="text-xs">
                            {child.title} (key: {child.key})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h5>Menu Filtering Summary</h5>
            <div className="bg-blue-100 p-3 rounded">
              <p><strong>Original menu items:</strong> {menuTest.original.length}</p>
              <p><strong>Filtered menu items:</strong> {menuTest.filtered.length}</p>
              <p><strong>Hidden items:</strong> {menuTest.original.length - menuTest.filtered.length}</p>
              {filterMenuByPermissions ? (
                <p className="text-green-600">✅ Menu filtering is active</p>
              ) : (
                <p className="text-red-600">❌ Menu filtering is not active</p>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <h5>🔍 Debug: Add Business Menu Item Test</h5>
            <div className="bg-red-100 p-3 rounded">
              <p><strong>Looking for &quot;Add Business&quot; in original menu:</strong></p>
              {(() => {
                const businessSection = menuTest.original.find(item => item.title === 'Business');
                const addBusinessItem = businessSection?.children?.find(child => child.title === 'Add Business');
                return addBusinessItem ? (
                  <p className="text-green-600">✅ Found &quot;Add Business&quot; in original menu (key: {addBusinessItem.key})</p>
                ) : (
                  <p className="text-red-600">❌ &quot;Add Business&quot; not found in original menu</p>
                );
              })()}
              
              <p><strong>Looking for &quot;Add Business&quot; in filtered menu:</strong></p>
              {(() => {
                const businessSection = menuTest.filtered.find(item => item.title === 'Business');
                const addBusinessItem = businessSection?.children?.find(child => child.title === 'Add Business');
                return addBusinessItem ? (
                  <p className="text-red-600">❌ &quot;Add Business&quot; still visible in filtered menu (should be hidden)</p>
                ) : (
                  <p className="text-green-600">✅ &quot;Add Business&quot; correctly hidden from filtered menu</p>
                );
              })()}
              
              <p><strong>Filter function available:</strong> {filterMenuByPermissions ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Permissions loaded:</strong> {Object.keys(permissions).length > 0 ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4>Permission Guards Demo</h4>
          
          <div className="mb-3">
            <h5>Users Section (Only visible if user has permission)</h5>
            <PermissionGuard permissionKey="users" action="menu">
              <div className="bg-green-100 p-3 rounded border border-green-300">
                <p className="text-green-800">✅ Users section is visible - you have permission!</p>
                <p className="text-sm text-green-600">This content is only shown if the user has &apos;users&apos; menu permission.</p>
              </div>
            </PermissionGuard>
          </div>

          <div className="mb-3">
            <h5>Providers Section (Only visible if user has stuff.menu permission)</h5>
            <PermissionGuard permissionKey="providers" action="menu">
              <div className="bg-blue-100 p-3 rounded border border-blue-300">
                <p className="text-blue-800">✅ Providers section is visible - you have stuff.menu permission!</p>
                <p className="text-sm text-blue-600">This content is only shown if the user has &apos;providers&apos; menu permission (stuff.menu).</p>
              </div>
            </PermissionGuard>
          </div>

          <div className="mb-3">
            <h5>Business Section (Only visible if user has providers.menu permission)</h5>
            <PermissionGuard permissionKey="Bussiness" action="menu">
              <div className="bg-purple-100 p-3 rounded border border-purple-300">
                <p className="text-purple-800">✅ Business section is visible - you have providers.menu permission!</p>
                <p className="text-sm text-purple-600">This content is only shown if the user has &apos;Bussiness&apos; menu permission (providers.menu).</p>
              </div>
            </PermissionGuard>
          </div>

          <div className="mb-3">
            <h5>Main Categories Section (Only visible if user has sp_types.menu permission)</h5>
            <PermissionGuard permissionKey="main-categories" action="menu">
              <div className="bg-orange-100 p-3 rounded border border-orange-300">
                <p className="text-orange-800">✅ Main Categories section is visible - you have sp_types.menu permission!</p>
                <p className="text-sm text-orange-600">This content is only shown if the user has &apos;main-categories&apos; menu permission (sp_types.menu).</p>
              </div>
            </PermissionGuard>
          </div>

          <div className="mb-3">
            <h5>Add User Button (Only visible if user can add)</h5>
            <PermissionGuard permissionKey="add-User" action="add">
              <button className="btn btn-primary">
                Add New User
              </button>
            </PermissionGuard>
          </div>

          <div className="mb-3">
            <h5>Settings Section (Only visible if user has settings permission)</h5>
            <PermissionGuard permissionKey="Settings" action="menu">
              <div className="bg-gray-100 p-3 rounded border border-gray-300">
                <p className="text-gray-800">✅ Settings section is visible - you have permission!</p>
                <p className="text-sm text-gray-600">This content is only shown if the user has &apos;Settings&apos; menu permission.</p>
              </div>
            </PermissionGuard>
          </div>
        </div>

        <div className="mb-4">
          <h4>Conditional Content Based on Permissions</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PermissionGuard permissionKey="all-users" action="list">
              <div className="card">
                <div className="card-header">
                  <h5>Users Management</h5>
                </div>
                <div className="card-body">
                  <p>This card is only visible if you can list users.</p>
                  <PermissionGuard permissionKey="add-User" action="add">
                    <button className="btn btn-sm btn-primary mt-2">Add User</button>
                  </PermissionGuard>
                </div>
              </div>
            </PermissionGuard>

            <PermissionGuard permissionKey="all-providers" action="list">
              <div className="card">
                <div className="card-header">
                  <h5>Providers Management</h5>
                </div>
                <div className="card-body">
                  <p>This card is only visible if you can list providers.</p>
                  <PermissionGuard permissionKey="add-provider" action="add">
                    <button className="btn btn-sm btn-primary mt-2">Add Provider</button>
                  </PermissionGuard>
                </div>
              </div>
            </PermissionGuard>
          </div>
        </div>

        <div className="mb-4">
          <h4>Enhanced Menu Filtering Test</h4>
          <p className="text-sm text-gray-600 mb-3">
            This section demonstrates how the menu filtering works with children.
            It checks if a specific child item is visible based on its permission.
          </p>
          
          <div className="mb-4">
            <h5>🔍 Debug: Enhanced Menu Filtering Test</h5>
            <div className="bg-purple-100 p-3 rounded">
              <p><strong>Filter function available:</strong> {filterMenuByPermissions ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Permissions loaded:</strong> {Object.keys(permissions).length > 0 ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Should show child function available:</strong> {shouldShowChild ? '✅ Yes' : '❌ No'}</p>
              
              <div className="mt-3">
                <h6>Test Child Permission Checks:</h6>
                <ul className="list-disc list-inside text-sm">
                  <li>Add Business (add-Bussiness): {shouldShowChild?.({ key: 'add-Bussiness', title: 'Add Business' }) ? '✅ Visible' : '❌ Hidden'}</li>
                  <li>Add User (add-User): {shouldShowChild?.({ key: 'add-User', title: 'Add User' }) ? '✅ Visible' : '❌ Hidden'}</li>
                  <li>All Business (all-Business): {shouldShowChild?.({ key: 'all-Business', title: 'All Business' }) ? '✅ Visible' : '❌ Hidden'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4>Current Menu Structure Test</h4>
          <p className="text-sm text-gray-600 mb-3">
            This section shows the current menu structure and which items are visible/hidden.
          </p>
          
          <div className="mb-4">
            <h5>🔍 Debug: Current Menu Items</h5>
            <div className="bg-green-100 p-3 rounded">
              <p><strong>Menu items loaded:</strong> {menuConfig?.length || 0}</p>
              <p><strong>Business section found:</strong> {menuConfig?.find(item => item.title === 'Business') ? '✅ Yes' : '❌ No'}</p>
              
              {(() => {
                const businessSection = menuConfig?.find(item => item.title === 'Business');
                if (businessSection) {
                  return (
                    <div className="mt-3">
                      <p><strong>Business section children:</strong></p>
                      <ul className="list-disc list-inside text-sm">
                        {businessSection.children?.map((child, index) => (
                          <li key={index} className={shouldShowChild?.(child) ? 'text-green-600' : 'text-red-600'}>
                            {child.title} (key: {child.key}) - {shouldShowChild?.(child) ? '✅ Visible' : '❌ Hidden'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return <p className="text-red-600">❌ Business section not found in menu</p>;
              })()}
            </div>
          </div>
        </div>
         <div className="mb-4">
           <h4>Snackbar Notification Test</h4>
           <p className="text-sm text-gray-600 mb-3">
             Test the snackbar notifications when accessing protected routes without permission.
           </p>
           
           <div className="mb-4">
             <h5>🔍 Test Protected Route Access</h5>
             <div className="bg-blue-100 p-3 rounded">
               <p className="mb-3">Click the links below to test snackbar notifications:</p>
               
               <div className="space-y-2">
                 <a 
                   href="/Addbussiness" 
                   className="inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                   onClick={(e) => {
                     if (!canAdd('add-Bussiness')) {
                       e.preventDefault();
                       alert('This will show a snackbar notification and redirect to home page when clicked.');
                     }
                   }}
                 >
                   Test Add Business Route (should show snackbar if no permission)
                 </a>
                 
                 <br />
                 
                 <a 
                   href="/AddUser" 
                   className="inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                   onClick={(e) => {
                     if (!canAdd('add-User')) {
                       e.preventDefault();
                       alert('This will show a snackbar notification and redirect to home page when clicked.');
                     }
                   }}
                 >
                   Test Add User Route (should show snackbar if no permission)
                 </a>
                 
                 <br />
                 
                 <p className="text-sm text-gray-600 mt-3">
                   <strong>Note:</strong> These links will show a snackbar notification with the message 
                   &quot;Access denied: You don&apos;t have permission to access this page (permission-key)&quot; 
                   and stay on the current page instead of redirecting.
                 </p>
               </div>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
};

export { PermissionsDemo }; 