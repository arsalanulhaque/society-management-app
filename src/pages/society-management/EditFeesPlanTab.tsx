import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, DollarSign, PenSquare, AlertCircle, Info, Users, Building, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IUser, IRole, IPlotType, IPlotCategory } from '@/types/database';

export const EditFeesPlanTab: React.FC = () => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [2023, 2024, 2025];
  
  const feePlans = [
    { category: 'Category A', baseAmount: 200, floorAmount: 50 },
    { category: 'Category B', baseAmount: 300, floorAmount: 75 },
    { category: 'Category C', baseAmount: 400, floorAmount: 100 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle size={18} />
            Important Note
          </CardTitle>
          <CardDescription>
            Select the month from which onwards the new fee will be applicable.
            You can edit the fee plan for each category and also edit the floor-wise amount.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Effective Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Effective From Month</label>
              <select className="w-full p-2 border rounded-md">
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Effective From Year</label>
              <select className="w-full p-2 border rounded-md">
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Fee Plans</CardTitle>
          <CardDescription>
            Configure base amount and per-floor charges for each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 p-4 bg-muted/50 font-medium text-sm">
              <div className="col-span-4">Category</div>
              <div className="col-span-3">Base Amount</div>
              <div className="col-span-3">Amount Per Floor</div>
              <div className="col-span-2">Actions</div>
            </div>
            {feePlans.map((plan, index) => (
              <div key={index} className="grid grid-cols-12 p-4 border-t items-center">
                <div className="col-span-4">{plan.category}</div>
                <div className="col-span-3">${plan.baseAmount}</div>
                <div className="col-span-3">${plan.floorAmount} per floor</div>
                <div className="col-span-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toast.success('Edit mode activated for ' + plan.category)}
                    className="flex items-center gap-1"
                  >
                    <PenSquare size={14} />
                    <span>Edit</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              onClick={() => toast.success('Fee plans saved successfully!')}
              className="flex items-center gap-2"
            >
              <DollarSign size={16} />
              Save Fee Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
