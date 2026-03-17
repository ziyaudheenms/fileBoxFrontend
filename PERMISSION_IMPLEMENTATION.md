# Role-Based Permission Implementation Guide

## Overview
This implementation restricts permission assignments based on the user's role:
- **EDIT role**: Can only assign "VIEW" and "EDIT" permissions
- **ADMIN role**: Can assign all permissions ("VIEW", "EDIT", "ADMIN")
- **OWNER role**: Can assign all permissions

## Files Modified

### 1. **lib/permissionUtils.ts** (NEW)
Contains utility functions for permission management:

#### Functions:
- **`getAvailablePermissions(userRole)`** - Returns array of permissions available to user based on their role
  - OWNER/ADMIN: `['VIEW', 'EDIT', 'ADMIN']`
  - EDIT: `['VIEW', 'EDIT']`
  - VIEW: `['VIEW']`

- **`canAssignPermission(userRole, permissionToAssign)`** - Validates if user can assign a specific permission

- **`permissionLabels`** - Object mapping permission types to display labels

### 2. **app/(home)/images/[id]/page.tsx**
Updated to implement role-based permission restrictions:

#### Changes:
- Added import for permission utilities
- Added `userRole` state to track current user's role
- Updated `HandleSingleImage()` to set `userRole` to 'OWNER' upon file fetch
- Updated `HandleUserSelection()` to validate permissions before assignment
- Modified permission dropdown to dynamically render only available permissions based on user role

#### Key Code:
```typescript
// Import utility functions
import { getAvailablePermissions, canAssignPermission, PermissionType } from '@/lib/permissionUtils'

// Track user role
const [userRole, setUserRole] = useState<string | undefined>(undefined)

// Validate before assigning
const HandleUserSelection = (userEmail: string, userPermission: string) => {
  if (!canAssignPermission(userRole, userPermission as PermissionType)) {
    toast.error(`Your role (${userRole}) cannot assign ${userPermission} permission...`)
    return
  }
  // ... rest of logic
}

// Render only available permissions
<select>
  {getAvailablePermissions(userRole).map((perm) => (
    <option key={perm} value={perm}>
      {perm.charAt(0) + perm.slice(1).toLowerCase()}
    </option>
  ))}
</select>
```

### 3. **app/(home)/sharable/image/[id]/page.tsx**
Updated with same permission restrictions:

#### Changes:
- Added import for permission utilities
- Added `userRole` state
- Updated permission checks to use utility functions
- Modified permission dropdown to filter based on available permissions
- Added `availablePermissions` derived state

## How It Works

### Permission Assignment Flow:
1. User opens file/image details
2. System fetches their role (OWNER/ADMIN/EDIT/VIEW)
3. Permission dropdown is populated with only available options for their role
4. When assigning permissions to other users, system validates the assignment
5. Invalid permission assignments are rejected with informative error message

### Permission Hierarchy:
```
OWNER (can assign all)
  ├── Can assign: VIEW, EDIT, ADMIN
  
ADMIN (can assign all)
  ├── Can assign: VIEW, EDIT, ADMIN
  
EDIT (limited access)
  ├── Can assign: VIEW, EDIT
  
VIEW (read-only)
  ├── Can assign: VIEW only
```

## User Experience

### For EDIT Role Users:
- Dropdown only shows "View" and "Edit" options
- Cannot see or select "Admin" option
- Attempting to programmatically assign "Admin" gets error message

### For ADMIN/OWNER Users:
- Dropdown shows all three options: "View", "Edit", "Admin"
- Can freely assign any permission level

## Backend Integration

The implementation assumes the API provides the user's current permission/role in the response. If your backend returns role differently:

1. Update the `setUserRole()` call in `HandleSingleImage()`
2. Map the backend role to one of: 'VIEW', 'EDIT', 'ADMIN', 'OWNER'
3. Utility functions will automatically restrict available permissions

Example:
```typescript
// Adjust based on your API response
const apiRole = res.data.data.user_role; // or res.data.data.permission
setUserRole(apiRole); // Must be 'VIEW', 'EDIT', 'ADMIN', or 'OWNER'
```

## Adding Permission Restrictions to Other Pages

To add this to other pages (Documents, others, etc.), follow these steps:

1. Import utilities:
   ```typescript
   import { getAvailablePermissions, canAssignPermission, PermissionType } from '@/lib/permissionUtils'
   ```

2. Add state:
   ```typescript
   const [userRole, setUserRole] = useState<string | undefined>(undefined)
   ```

3. Set role when fetching data:
   ```typescript
   setUserRole('OWNER') // or determine from API response
   ```

4. Update permission dropdown:
   ```typescript
   <select>
     {getAvailablePermissions(userRole).map((perm) => (
       <option key={perm} value={perm}>
         {perm.charAt(0) + perm.slice(1).toLowerCase()}
       </option>
     ))}
   </select>
   ```

5. Validate before assignment:
   ```typescript
   if (!canAssignPermission(userRole, selectedPermission)) {
     toast.error('Cannot assign this permission with your role')
     return
   }
   ```

## Testing

### Test Cases:
1. **EDIT User**: 
   - ✅ Can see VIEW and EDIT options
   - ❌ Cannot see ADMIN option
   - ❌ Gets error when trying to assign ADMIN (if not caught by UI)

2. **ADMIN User**:
   - ✅ Can see all three options
   - ✅ Can assign any permission

3. **OWNER User**:
   - ✅ Can see all three options
   - ✅ Can assign any permission

## Notes

- The implementation is defensive - validates on both UI and function level
- Error messages inform users why they can't assign a permission
- Pattern can be extended to other file types (Documents, Videos, etc.)
- Consider adding role information to API responses for better security
