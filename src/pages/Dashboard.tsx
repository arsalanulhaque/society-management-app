import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import DashboardCard from '@/components/dashboard/DashboardCard';
import StatisticCard from '@/components/dashboard/StatisticCard';
import { Calendar, DollarSign, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IFinancialData, IDashboardSummary } from '@/types/interfaces';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, hasPermission } = useAuth();
  
  const [financialData, setFinancialData] = useState<IFinancialData>({
    currentYear: {
      timeframe: 'Current Year',
      totalAmount: 120000,
      amountReceived: 98000,
      amountDue: 22000,
      recoveryPercentage: 81.67
    },
    currentMonth: {
      timeframe: 'Current Month',
      totalAmount: 10000,
      amountReceived: 7500,
      amountDue: 2500,
      recoveryPercentage: 75
    },
    lastMonth: {
      timeframe: 'Last Month',
      totalAmount: 10000,
      amountReceived: 9200,
      amountDue: 800,
      recoveryPercentage: 92
    },
    lastYear: {
      timeframe: 'Last Year',
      totalAmount: 110000,
      amountReceived: 105000,
      amountDue: 5000,
      recoveryPercentage: 95.45
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setFinancialData(financialData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      toast.info('Refreshing dashboard data...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Dashboard data refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const timeframes: { title: string; data: IDashboardSummary; icon: JSX.Element; trend: 'up' | 'down'; trendValue: string }[] = [
    {
      title: 'Current Year',
      data: financialData.currentYear,
      icon: <Calendar size={20} />,
      trend: financialData.currentYear.recoveryPercentage >= financialData.lastYear.recoveryPercentage ? 'up' : 'down',
      trendValue: `${Math.abs(financialData.currentYear.recoveryPercentage - financialData.lastYear.recoveryPercentage).toFixed(2)}% from last year`
    },
    {
      title: 'Current Month',
      data: financialData.currentMonth,
      icon: <DollarSign size={20} />,
      trend: financialData.currentMonth.recoveryPercentage >= financialData.lastMonth.recoveryPercentage ? 'up' : 'down',
      trendValue: `${Math.abs(financialData.currentMonth.recoveryPercentage - financialData.lastMonth.recoveryPercentage).toFixed(2)}% from last month`
    },
    {
      title: 'Last Month',
      data: financialData.lastMonth,
      icon: <Clock size={20} />,
      trend: 'down' as const,
      trendValue: '3.45% from previous month'
    },
    {
      title: 'Last Year',
      data: financialData.lastYear,
      icon: <TrendingUp size={20} />,
      trend: 'up' as const,
      trendValue: '2.5% from year before'
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of maintenance fee collection and financial metrics.
            </p>
          </div>
          
          {hasPermission('/', 'canEdit') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              <span>Refresh Data</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {timeframes.map((timeframe, index) => (
            <DashboardCard key={index} title={timeframe.title}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatisticCard
                  label="Total Amount"
                  value={formatCurrency(timeframe.data.totalAmount)}
                  icon={<DollarSign size={20} />}
                />
                <StatisticCard
                  label="Amount Received"
                  value={formatCurrency(timeframe.data.amountReceived)}
                  icon={<DollarSign size={20} />}
                  trend="up"
                  trendValue="Collected"
                />
                <StatisticCard
                  label="Amount Due"
                  value={formatCurrency(timeframe.data.amountDue)}
                  icon={<DollarSign size={20} />}
                  trend="down"
                  trendValue="Pending"
                />
                <StatisticCard
                  label="Recovery Percentage"
                  value={`${timeframe.data.recoveryPercentage}%`}
                  icon={timeframe.icon}
                  trend={timeframe.trend}
                  trendValue={timeframe.trendValue}
                />
              </div>
            </DashboardCard>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
