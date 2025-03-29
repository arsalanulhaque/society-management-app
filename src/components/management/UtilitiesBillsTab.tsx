import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banknote } from 'lucide-react';
import { toast } from 'sonner';

const UtilitiesBillsTab: React.FC = () => {
  // Mock months and years for selection
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  
  // Mock utility expenses
  const [expenses, setExpenses] = useState([
    { id: 1, description: 'Electricity Bill', amount: 1200, date: '2023-10-05' },
    { id: 2, description: 'Water Supply', amount: 800, date: '2023-10-10' },
    { id: 3, description: 'Security Services', amount: 1500, date: '2023-10-15' },
    { id: 4, description: 'Common Area Maintenance', amount: 600, date: '2023-10-20' },
    { id: 5, description: 'Gardening Services', amount: 400, date: '2023-10-25' },
  ]);

  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount) {
      const id = expenses.length ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
      setExpenses([
        ...expenses, 
        { 
          id, 
          description: newExpense.description, 
          amount: parseFloat(newExpense.amount), 
          date: new Date().toISOString().split('T')[0] 
        }
      ]);
      setNewExpense({ description: '', amount: '' });
      toast.success('Expense added successfully!');
    } else {
      toast.error('Please fill in all fields');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Month</label>
              <select className="w-full p-2 border rounded-md">
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
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
          <CardTitle>Add New Expense</CardTitle>
          <CardDescription>
            Enter details of the new utility bill or expense
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md"
                placeholder="e.g. Electricity Bill"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-md"
                placeholder="Amount"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleAddExpense}
              className="flex items-center gap-2"
            >
              <Banknote size={16} />
              Add Expense
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Listing</CardTitle>
          <CardDescription>
            All utility bills and expenses for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 p-4 bg-muted/50 font-medium text-sm">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Description</div>
              <div className="col-span-3">Amount</div>
              <div className="col-span-3">Date</div>
            </div>
            {expenses.map((expense, index) => (
              <div key={expense.id} className="grid grid-cols-12 p-4 border-t items-center">
                <div className="col-span-1">{index + 1}</div>
                <div className="col-span-5">{expense.description}</div>
                <div className="col-span-3">
                  PKR {expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="col-span-3">{expense.date}</div>
              </div>
            ))}
            <div className="grid grid-cols-12 p-4 border-t items-center bg-muted/20 font-medium">
              <div className="col-span-1"></div>
              <div className="col-span-5">Total</div>
              <div className="col-span-3">
                PKR {expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="col-span-3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UtilitiesBillsTab;
