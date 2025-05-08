
import { ReactNode } from 'react';
import { IPermission } from './interfaces';

export interface ISubMenuItem {
  Path: string;
  Title: string;
  Icon: ReactNode;
  Permission: keyof IPermission;
  IsInMenu?: boolean;
  RoleID?: number; // Updated roleId to roleID for consistency
}

export interface IMenuItem {
  Path: string;
  Title: string;
  Icon: ReactNode;
  Permission: keyof IPermission;
  IsInMenu?: boolean;
  RoleID?: number; // Updated roleId to roleID for consistency
  SubItems?: ISubMenuItem[];
}
