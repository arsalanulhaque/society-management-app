import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaymentPlan } from './usePaymentPlan';
import useNumberFormatter from "@/hooks/useNumberFormatter";
import useDateFormatter from "@/hooks/useDateFormatter";
import { WalletCards, PenSquare, Trash2, Eye, CircleStop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import useMonths from "@/hooks/useMonths"
import { useLocation, useNavigate } from "react-router-dom";
import { IconTooltip } from "@/components/common/IconTooltip";
import { toast } from 'sonner';

export const PaymentPlanTab: React.FC = () => {
    const navigate = useNavigate();
    const { pathname, search } = useLocation();
    const fullUrl = pathname + search;
    const { hasPermission } = useAuth();
    const { paymentPlans, loading } = usePaymentPlan();
    const { formatDate } = useDateFormatter();
    const { formatNumber } = useNumberFormatter();
    const { findMonthByValue } = useMonths();

    return (
        <div className="space-y-4 border p-4 rounded-md ">
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            ) : paymentPlans && (
                <>
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h2 className="text-2xl font-bold">Payment Plans</h2>
                    </div>
                    <div className="rounded-md border mt-4">
                        <div className="grid grid-cols-6 p-4 bg-muted/50 font-medium text-sm">
                            <div className="col-span-1">Plan Name</div>
                            <div className="col-span-2">Description</div>
                            <div className="col-span-1">Creation Date</div>
                            <div className="col-span-2"></div>
                        </div>
                        {paymentPlans.map(payPlan => {
                            // Split the string to extract the month numbers
                            const [start, end] = payPlan.Description.split(" - ");
                            const startMonth = parseInt(start.split("/")[0], 10); // Extract 6
                            const endMonth = parseInt(end.split("/")[0], 10); // Extract 12

                            // Use findMonthByValue to get the month names
                            const startMonthName = findMonthByValue(startMonth); // e.g., "June"
                            const endMonthName = findMonthByValue(endMonth); // e.g., "December"

                            // Combine the results
                            const formattedDateRange = `${startMonthName} ${start.split("/")[1]} - ${endMonthName} ${end.split("/")[1]}`;

                            return (
                                <div key={payPlan.PaymentPlanID}
                                    className="grid grid-cols-6 px-4 py-1 border-t items-center text-sm">
                                    <div className="col-span-1">{payPlan.PaymentPlanName}</div>
                                    <div className="col-span-2">
                                        {formattedDateRange}
                                    </div>
                                    <div className="col-span-1">{
                                        formatDate(payPlan.CreatedAt, { dateStyle: "medium", timeStyle: "short" })}
                                    </div>
                                    <div className="col-span-2 flex justify-end gap-2">
                                        {(hasPermission(fullUrl, 'CanViewPaymentPlan')) && payPlan.PaymentPlanID && (
                                            <IconTooltip tooltip='View Payment Plan'>
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    window.open(`/payment-plan-details?PaymentPlanID=${payPlan.PaymentPlanID}`, '_blank')
                                                }} className="flex items-center gap-1 bg-slate-200 text-slate-500 hover:bg-slate-100 ">
                                                    <Eye size={14} />
                                                </Button>
                                            </IconTooltip>
                                        )}
                                        {(hasPermission(fullUrl, 'CanViewPaymentPlan')) && payPlan.PaymentPlanID && (
                                            <IconTooltip tooltip='Revoke Payment Plan'>
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    toast.error("Payment Plan Revoke is not implemented yet.")
                                                }}
                                                    className="flex items-center gap-1 bg-slate-200 text-red-500 hover:text-red-500 hover:bg-slate-100">
                                                    <CircleStop size={14} />
                                                </Button>
                                            </IconTooltip>
                                        )}
                                    </div>
                                </div>

                            )
                        })}
                    </div>

                </>)
            }
        </div >
    );
};