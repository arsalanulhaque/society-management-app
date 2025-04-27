import { useEffect, useState } from 'react';
import { IMenuItem } from '@/types/menu';
import { authContextService } from '../services/auth-context-service'
import { useAuth } from '@/contexts/AuthContext';


export const useMenu = (): IMenuItem[] => {
    const { user } = useAuth();
    const [menuItems, setMenu] = useState<IMenuItem[]>([]);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await authContextService.menuItems(user.role.roleID);
                setMenu(response);

            } catch (error) {
                console.error('Failed to fetch menu items:', error);
            }
        };

        fetchMenu();
    }, []);

    return menuItems;
};