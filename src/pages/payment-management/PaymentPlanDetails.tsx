import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaymentPlan } from './usePaymentPlan';
import useNumberFormatter from "@/hooks/useNumberFormatter";
import useDateFormatter from "@/hooks/useDateFormatter";
import { WalletCards, PenSquare, Trash2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import useMonths from "@/hooks/useMonths"

const PaymentPlanDetails: React.FC = () => {
  const { user, menus, hasPermission } = useAuth();
  const { fullPaymentPlan, loading } = usePaymentPlan();
  const { formatNumber, formatTwoDigits } = useNumberFormatter();
  const { formatDate } = useDateFormatter();
  const { findMonthByValue, } = useMonths();

  return (
    <>
      <div className="space-y-4 rounded-md border m-4 p-4">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : fullPaymentPlan && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Payment Plan</h2>
            </div>


            {/* Payment Plan Info */}
            <Card className="p-4">
              <CardContent className="text-sm space-y-1">

                <div className="border-b pb-2 font-medium text-lg">
                  Payment Plan Information
                </div>
                <p className="font-semibold pt-2">This payment plan was generated on {new Date(fullPaymentPlan?.PaymentPlanMaster?.CreatedAt).toLocaleString()}</p>

                <div className="flex">
                  <div className='font-semibold w-1/6 py-4'>
                    <p className="pb-2">Name:</p>
                    <p className="pb-2">Description:</p>
                  </div>
                  <div className='w-full py-4'>
                    <p className="pb-2">{fullPaymentPlan?.PaymentPlanMaster?.PaymentPlanName}</p>
                    <p className="pb-2">{fullPaymentPlan?.PaymentPlanMaster?.Description}</p>
                  </div>
                </div>

                {/* Service Rates */}
                <div className="border-b pb-2 font-medium text-lg">
                  Service Rates Information
                </div>
                <p className="font-semibold pt-2">This payment plan starts from {findMonthByValue(fullPaymentPlan.ServiceRate.StartMonth)}/{fullPaymentPlan.ServiceRate.StartYear} and ends in &nbsp;
                  {findMonthByValue(fullPaymentPlan.ServiceRate.EndMonth)}/{fullPaymentPlan.ServiceRate.EndYear}.
                </p>
                <p className="pt-1">The table below represents the breakup of Service Charges receivable: </p>
                <div key={fullPaymentPlan.ServiceRate.RateID} className=" pt-4 w-1/2">
                  <div className="flex" >
                    <div className='font-semibold w-1/3'>
                      <p className="pb-2">Plot Type:</p>
                      <p className="pb-2">Plot Category:</p>
                      <p className="pb-2">Plot Floor:</p>
                    </div>

                    <div className='w-1/3'>
                      <p className="pb-2">{fullPaymentPlan.ServiceRate.TypeName}</p>
                      <p className="pb-2">{fullPaymentPlan.ServiceRate.CategoryName}</p>
                      <p className="pb-2">{fullPaymentPlan.ServiceRate.Floor}</p>
                      <p className="border-t border-b py-2 text-sm font-semibold">Monthly Total:</p>
                    </div>

                    <div className='w-2/3'>
                      <p className="pb-2">Rs. {fullPaymentPlan.ServiceRate.PlotTypeRate}</p>
                      <p className="pb-2">Rs. {fullPaymentPlan.ServiceRate.CategoryRate}</p>
                      <p className="pb-2">Rs. {fullPaymentPlan.ServiceRate.FloorRate}</p>
                      <p className="border-t border-b py-2 text-sm font-semibold">Rs. {fullPaymentPlan.ServiceRate.TotalAmount}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Installments */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="border-b pb-2 font-medium text-lg">Planned Installments</div></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 p-4 bg-muted/50 text-sm text-sm">
                    <div className="col-span-1">#</div>
                    <div className="col-span-1">Payment Date</div>
                    <div className="col-span-1">Amount</div>
                    <div className="col-span-1">Percentage</div>
                  </div>
                  {fullPaymentPlan.PaymentPlanDetails.map((inst, index) => (
                    <div key={index} className={inst.InstallmentNumber < 0 ? 'grid grid-cols-4 p-4 border-t font-semibold items-center bg-muted/50' : 'grid grid-cols-4 p-4 border-t text-sm items-center'}>
                      <div className="col-span-1">{inst.InstallmentNumber > 0 ? formatTwoDigits(inst.InstallmentNumber) : ''}</div>
                      <div className="col-span-1">{inst.InstallmentNumber > 0 ? formatDate(inst.DueDate, { format: "dd mmm, yyyy" }) : 'Annual Total:'}</div>
                      <div className="col-span-1">{formatNumber(inst.TotalAmount, { style: "currency", currency: "PKR" })}</div>
                      <div className="col-span-1">{formatNumber(inst.Percentage, { style: "percent" })}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div >
    </>
  );
};

export default PaymentPlanDetails;
