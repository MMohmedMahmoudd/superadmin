# Permissions System Documentation

This document explains how to use the permissions system in your React application.

## Overview

The permissions system is built around the user's permissions data received from the `/profile` endpoint. It provides a comprehensive way to control access to different parts of your application based on user permissions.

## Architecture

### 1. Permissions Hook (`usePermissions`)

The core of the system is the `usePermissions` hook located in `src/hooks/usePermissions.js`. This hook:

- Extracts permissions from the current user's profile data
- Provides helper functions for checking different types of permissions
- Maps menu keys to API permission structures
- Filters menu items based on user permissions

### 2. Permissions Provider (`PermissionsProvider`)

The `PermissionsProvider` wraps the permissions functionality and makes it available throughout the app via React Context.

### 3. Permission Components

- `PermissionGuard`: A component that conditionally renders content based on permissions
- `withPermission`: A higher-order component for protecting entire pages

## API Response Structure

The system expects permissions data in this format:

```json
{
  "permissions": {
    "sp_types": {
      "menu": 0,
      "list": 0,
      "add": 0,
      "edit": 0,
      "delete": 0
    },
    "providers": {
      "menu": 0,
      "list": 0,
      "add": 0,
      "edit": 0,
      "view": 0,
      "delete": 0
    },
    "admins": {
      "menu": 1,
      "list": 1,
      "add": 1,
      "edit": 1,
      "delete": 1
    },
    "cities": {
      "menu": 1,
      "list": 1,
      "add": 1,
      "edit": 1,
      "delete": 1
    },
    "settings": {
      "menu": 1,
      "list": 1,
      "edit": 1
    }
  }
}
```

## Permission Mapping

The system maps menu keys to API permission structures:

```javascript
const PERMISSION_MAPPING = {
  // Business permissions
  'Bussiness': 'providers',
  'all-Business': 'providers.list',
  'add-Bussiness': 'providers.add',

  // Providers permissions
  'providers': 'stuff',
  'all-providers': 'stuff.list',
  'add-provider': 'stuff.add',
  'Provider-profile':'stuff.edit'


  // Users permissions
  'users': 'admins',
  'all-users': 'admins.list',
  'add-User': 'admins.add',

  // And so on...
};
```

## Usage Examples

### 1. Using the Permissions Hook

```javascript
import { usePermissionsContext } from "@/providers/PermissionsProvider";

const MyComponent = () => {
  const {
    permissions,
    canAccess,
    canList,
    canAdd,
    canEdit,
    canDelete,
    canView,
    isAuthenticated,
  } = usePermissionsContext();

  // Check if user can access users menu
  if (canAccess("users")) {
    // Show users menu
  }

  // Check if user can list users
  if (canList("all-users")) {
    // Show users list
  }

  // Check if user can add users
  if (canAdd("add-User")) {
    // Show add user button
  }
};
```

### 2. Using PermissionGuard Component

```javascript
import { PermissionGuard } from "@/components";

const MyPage = () => {
  return (
    <div>
      <h1>Users Management</h1>

      {/* Only show if user can list users */}
      <PermissionGuard permissionKey="all-users" action="list">
        <UsersList />
      </PermissionGuard>

      {/* Only show if user can add users */}
      <PermissionGuard permissionKey="add-User" action="add">
        <button>Add User</button>
      </PermissionGuard>

      {/* Show fallback if user doesn't have permission */}
      <PermissionGuard
        permissionKey="users"
        action="menu"
        fallback={<p>You don't have access to users</p>}
      >
        <UsersSection />
      </PermissionGuard>
    </div>
  );
};
```

### 3. Using withPermission HOC

```javascript
import { withPermission } from "@/components";

const UsersPage = () => {
  return <div>Users Page Content</div>;
};

// Protect the entire page - redirect if no permission
const ProtectedUsersPage = withPermission(
  UsersPage,
  "users",
  "menu",
  "/dashboard"
);

export { ProtectedUsersPage as UsersPage };
```

### 4. Conditional Rendering in Components

```javascript
import { usePermissionsContext } from "@/providers/PermissionsProvider";

const UserActions = ({ userId }) => {
  const { canEdit, canDelete } = usePermissionsContext();

  return (
    <div className="user-actions">
      {canEdit("User-profile") && (
        <button onClick={() => editUser(userId)}>Edit</button>
      )}

      {canDelete("User-profile") && (
        <button onClick={() => deleteUser(userId)}>Delete</button>
      )}
    </div>
  );
};
```

### 5. Menu Filtering

The menu is automatically filtered based on permissions. The system:

- Hides menu items the user doesn't have access to
- Shows parent menus only if they have children or their own permission
- Always shows headings

## Available Permission Actions

- `menu`: Access to the menu item
- `list`: Ability to view lists
- `add`: Ability to create new items
- `edit`: Ability to modify existing items
- `delete`: Ability to remove items
- `view`: Ability to view individual items

## Available Helper Functions

- `canAccess(permissionKey)`: Check if user can access a menu
- `canList(permissionKey)`: Check if user can list items
- `canAdd(permissionKey)`: Check if user can add items
- `canEdit(permissionKey)`: Check if user can edit items
- `canDelete(permissionKey)`: Check if user can delete items
- `canView(permissionKey)`: Check if user can view items
- `hasPermission(permissionKey, action)`: Generic permission check
- `filterMenuByPermissions(menuItems)`: Filter menu items based on permissions

## Integration with Existing Code

### 1. Dashboard Content

```javascript
// In Demo1LightSidebarContent.jsx
import { PermissionGuard } from "@/components";

const Demo1LightSidebarContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <PermissionGuard permissionKey="users" action="list">
        <div className="lg:col-span-2 h-full">
          <Users />
        </div>
      </PermissionGuard>

      <PermissionGuard permissionKey="Teams" action="list">
        <div className="grid lg:grid-cols-2 gap-5 lg:gap-7.5 items-stretch">
          <div className="lg:col-span-2 h-full">
            <Teams />
          </div>
        </div>
      </PermissionGuard>
    </div>
  );
};
```

### 2. Page Protection

```javascript
// In UsersPage.jsx
import { PermissionGuard } from "@/components";

const UsersPage = () => {
  return (
    <Fragment>
      <Toolbar>
        <ToolbarActions>
          <PermissionGuard permissionKey="add-User" action="add">
            <Link to="/" className="btn btn-outline btn-primary">
              Add User
            </Link>
          </PermissionGuard>
        </ToolbarActions>
      </Toolbar>

      <PermissionGuard permissionKey="all-users" action="list">
        <Container>
          <UsersContent />
        </Container>
      </PermissionGuard>
    </Fragment>
  );
};
```

## Best Practices

1. **Always check permissions before rendering sensitive content**
2. **Use PermissionGuard for conditional rendering**
3. **Use withPermission for page-level protection**
4. **Provide meaningful fallbacks when users don't have permissions**
5. **Test with different permission sets to ensure proper filtering**

## Debugging

To debug permissions, you can use the PermissionsDemo component:

```javascript
import { PermissionsDemo } from "@/pages/dashboards/demo1/light-sidebar/PermissionsDemo";

// Add this to any page to see current permissions
<PermissionsDemo />;
```

This will show:

- Current authentication status
- Raw permissions data
- Permission check results
- Examples of PermissionGuard usage

## Adding New Permissions

To add new permissions:

1. **Update the permission mapping** in `usePermissions.js`:

```javascript
const PERMISSION_MAPPING = {
  // Add your new permission
  "new-feature": "new_permission",
  "new-feature-list": "new_permission.list",
  "new-feature-add": "new_permission.add",
};
```

2. **Update your menu configuration** in `menu.config.jsx`:

```javascript
{
  title: 'New Feature',
  key: 'new-feature',
  icon: 'icon-name',
  path: '/new-feature',
  children: [
    {
      title: 'All Items',
      key: 'new-feature-list',
      path: '/new-feature',
    },
    {
      title: 'Add Item',
      key: 'new-feature-add',
      path: '/add-new-feature',
    }
  ]
}
```

3. **Use PermissionGuard in your components**:

```javascript
<PermissionGuard permissionKey="new-feature" action="menu">
  <NewFeatureComponent />
</PermissionGuard>
```

This permissions system provides a robust, flexible way to control access throughout your application based on user permissions from your API.
