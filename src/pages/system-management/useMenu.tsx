import { useEffect, useState } from 'react';
import { IMenuTable } from '@/types/database';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:4000/api';

export const useMenu = () => {
  const [menus, setMenus] = useState<IMenuTable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/menus`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch menu');
      const {data} = await response.json();
      setMenus(data as IMenuTable[]);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch menus');
    } finally {
      setLoading(false);
    }
  };

  const addMenu = async (newMenu: Omit<IMenuTable, 'MenuID'>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMenu),
      });

      const data = await response.json();
      if (data?.MenuID) {
        toast.success('Menu added successfully');
        setMenus((prev) => [...prev, data]);
      } else {
        toast.error(data.message);
      }

      if (!response.ok) throw new Error('Failed to add menu');
    } catch (error) {
      console.error('Add error:', error);
      toast.error('Failed to add menu');
    } finally {
      setLoading(false);
    }
  };

  const updateMenu = async (menu: IMenuTable) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/menu/${menu.MenuID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(menu),
      });

      const data = await response.json();
      if (data?.MenuID) {
        toast.success('Menu updated successfully');
        setMenus((prev) => prev.map((m) => (m.MenuID === data.MenuID ? data : m)));
      } else {
        toast.error(data.message);
      }

      if (!response.ok) throw new Error('Failed to update menu');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update menu');
    } finally {
      setLoading(false);
    }
  };

  const deleteMenu = async (menuID: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/menu/${menuID}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Menu deleted successfully');
        setMenus((prev) => prev.filter((m) => m.MenuID !== menuID));
      } else {
        toast.error(data.message);
        throw new Error('Failed to delete menu');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  return {
    menus,
    loading,
    addMenu,
    updateMenu,
    deleteMenu,
    refresh: fetchMenus,
  };
};
