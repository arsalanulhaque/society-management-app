
import { ReactNode } from 'react';

export interface SubMenuItem {
  path: string;
  title: string;
  icon: ReactNode;
  permission: 'canView' | 'canAdd' | 'canEdit' | 'canDelete';
  roleID?: number; // Updated roleId to roleID for consistency
}

export interface MenuItem {
  path: string;
  title: string;
  icon: ReactNode;
  permission: 'canView' | 'canAdd' | 'canEdit' | 'canDelete';
  roleID?: number; // Updated roleId to roleID for consistency
  subItems?: SubMenuItem[];
}
