import { IAuthUser } from "@/types/interfaces";
import { IMenuItem, ISubMenuItem } from "@/types/menu";

export const menuItems = (userData: IAuthUser): IMenuItem[] => {
    const menus = userData.menus;
    // Separate parent and child menus
    const parentMenuItems = menus.filter((e: any) => e.ParentMenuID === 0);
    const childMenuItems = menus.filter((e: any) => e.ParentMenuID > 0);

    // Map and attach subItems
    const menuItems: IMenuItem[] = parentMenuItems.map((parent: any) => {
        const subItems: ISubMenuItem[] = childMenuItems
            .filter((child: any) => child.ParentMenuID === parent.MenuID)
            .map((child: any) => (
                {
                    Path: child.MenuURL,
                    Title: child.MenuName,
                    Permission: 'CanView',
                    Icon: child?.Icon, // If icon is returned as a component name or SVG reference, you'll need to map/render accordingly
                    RoleID: child.RoleID,
                    // parentMenuID: child.ParentMenuID
                }
            ));

        return {
            Path: parent.MenuURL,
            Title: parent.MenuName,
            Icon: parent.Icon,
            Permission: 'CanView',
            RoleID: parent.RoleID,
            SubItems: subItems
        };
    });

    return menuItems as IMenuItem[];
};