import { useEffect, useState } from 'react';
import { IMenuActionsMap, IMenuActionsMapView, IMenuTable } from '@/types/database';
import { toast } from 'sonner';
import { useAction } from './useAction';
import { useMenu } from './useMenu';

const API_BASE_URL = 'http://localhost:4000/api';

export const useMenuActionsMap = () => {
  const { actions } = useAction();
  const { menus } = useMenu();
  const [menuActions, setMenuActions] = useState<IMenuActionsMapView[]>([]);
  const [filterMenuList, setFilterMenuList] = useState<IMenuTable>(menus[1]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMenuActionsMap = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/menuactionsmap`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch menu actions map');
      const data = await response.json();
      setMenuActions(data.data as IMenuActionsMapView[]);
      setFilterMenuList(menus[0])
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMenuActions = () => {
    return menuActions?.filter(menuAction => {
      // Category filter
      const menuMatch =
        !filterMenuList || filterMenuList.MenuID === 0 || menuAction.MenuID === filterMenuList.MenuID;

      return menuMatch
    });
  };

  const addMenuActionsMap = async (newMenuAction: Omit<IMenuActionsMap, 'MenuActionID'>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/menuactionsmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newMenuAction),
      });

      const data = await response.json();
      if (data?.success)
        toast.success('Menu Action Map added successfully');
      else
        toast.error(data.message);

      if (!response.ok) {
        toast.error('Failed to add Menu Action Map')
        throw new Error('Failed to add Menu Action Map');
      }
      setMenuActions(data.data as IMenuActionsMapView[]);
      setLoading(false);
    } catch (error) {
      console.error('Add error:', error);
      setLoading(false);
    }
  };

  const updateMenuActionsMap = async (updated: IMenuActionsMap) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/menuactionsmap/${updated.MenuActionID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      const data = await response.json();
      if (data.success)
        toast.success('Menu Action Map updated successfully');
      else
        toast.error(data.message);

      if (!response.ok) throw new Error('Failed to update Menu Action Map');
      setLoading(false);
    } catch (error) {
      console.error('Update error:', error);
      setLoading(false);
    }
  };

  const deleteMenuActionsMap = async (menuActionID: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/menuactionsmap/${menuActionID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success)
        toast.success('Menu Action Map deleted successfully');
      else
        toast.error(data.message);

      if (!response.ok) throw new Error('Failed to delete Menu Action Map');
      fetchMenuActionsMap()
      setLoading(false);
    } catch (error) {
      console.error('Delete error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuActionsMap();
  }, [menus]);

  return {
    menuActions,
    menus,
    actions,
    loading,
    filterMenuList,
    setFilterMenuList,
    addMenuActionsMap,
    updateMenuActionsMap,
    deleteMenuActionsMap,
    refresh: fetchMenuActionsMap,
    filteredMenuActions: getFilteredMenuActions()
  };
};
