
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

const MonthlyMaintenanceTab: React.FC = () => {
  // Mock categories
  const categories = ['Category A', 'Category B', 'Category C'];
  const [selectedCategory, setSelectedCategory] = useState('Category A');

  // Mock months and years for selection
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  
  // Mock houses data with payment status
  const houses = [
    { id: 1, plotNumber: 'A-101', ownerName: 'John Doe', amount: 300, status: 'paid' },
    { id: 2, plotNumber: 'A-102', ownerName: 'Jane Smith', amount: 450, status: 'paid' },
    { id: 3, plotNumber: 'A-103', ownerName: 'Mike Johnson', amount: 300, status: 'unpaid' },
    { id: 4, plotNumber: 'A-104', ownerName: 'Sarah Williams', amount: 200, status: 'paid' },
    { id: 5, plotNumber: 'A-105', ownerName: 'Robert Brown', amount: 450, status: 'unpaid' },
  ];

  const togglePaymentStatus = (id: number) => {
    // In a real app, you would update this in your backend
    toast.success(`Payment status toggled for house #${id}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Category and Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">House Category</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
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
          <CardTitle>Maintenance Payment Status</CardTitle>
          <CardDescription>
            Manage payment status for houses in {selectedCategory}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 p-4 bg-muted/50 font-medium text-sm">
              <div className="col-span-1">#</div>
              <div className="col-span-2">Plot No.</div>
              <div className="col-span-3">Owner Name</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Actions</div>
            </div>
            {houses.map((house, index) => (
              <div key={house.id} className="grid grid-cols-12 p-4 border-t items-center">
                <div className="col-span-1">{index + 1}</div>
                <div className="col-span-2">{house.plotNumber}</div>
                <div className="col-span-3">{house.ownerName}</div>
                <div className="col-span-2">PKR {house.amount}</div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    house.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {house.status === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                <div className="col-span-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => togglePaymentStatus(house.id)}
                    className={`flex items-center gap-1 ${
                      house.status === 'paid' 
                        ? 'text-red-600 hover:text-red-800 hover:border-red-600' 
                        : 'text-green-600 hover:text-green-800 hover:border-green-600'
                    }`}
                  >
                    {house.status === 'paid' ? <X size={14} /> : <Check size={14} />}
                    <span>{house.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Summary:</div>
              <div className="text-sm">
                <span className="font-medium">{houses.filter(h => h.status === 'paid').length}</span> out of <span className="font-medium">{houses.length}</span> houses paid
                (<span className="font-medium">
                  {((houses.filter(h => h.status === 'paid').length / houses.length) * 100).toFixed(0)}%
                </span>)
              </div>
            </div>
            <Button 
              onClick={() => toast.success('Payment statuses saved successfully!')}
              className="flex items-center gap-2"
            >
              <Check size={16} />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyMaintenanceTab;
