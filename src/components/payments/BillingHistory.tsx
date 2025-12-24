import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Download, 
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  paymentMethod: string;
  invoiceUrl?: string;
}

const mockInvoices: Invoice[] = [
  {
    id: 'inv_001',
    date: '2024-11-01',
    amount: 29.99,
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    paymentMethod: 'Visa •••• 4242'
  },
  {
    id: 'inv_002',
    date: '2024-10-01',
    amount: 29.99,
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    paymentMethod: 'Visa •••• 4242'
  },
  {
    id: 'inv_003',
    date: '2024-09-01',
    amount: 29.99,
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    paymentMethod: 'Visa •••• 4242'
  },
  {
    id: 'inv_004',
    date: '2024-08-01',
    amount: 29.99,
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    paymentMethod: 'Visa •••• 4242'
  }
];

export function BillingHistory() {
  const handleDownloadInvoice = (invoiceId: string) => {
    // In production, this would download the actual PDF
    alert(`Downloading invoice ${invoiceId}...`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="size-3 mr-1" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="size-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="size-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalSpent = mockInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl sm:text-2xl text-gray-900 dark:text-white mb-2">Billing History</h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">View and download your past invoices</p>
      </div>

      {/* Summary Card */}
      <Card className="border-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center sm:text-left">
              <p className="text-gray-600 dark:text-gray-400 mb-1 text-sm">Total Spent</p>
              <p className="text-2xl sm:text-3xl text-gray-900 dark:text-white">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-gray-600 dark:text-gray-400 mb-1 text-sm">Total Invoices</p>
              <p className="text-2xl sm:text-3xl text-gray-900 dark:text-white">{mockInvoices.length}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-gray-600 dark:text-gray-400 mb-1 text-sm">Next Billing Date</p>
              <p className="text-2xl sm:text-3xl text-gray-900 dark:text-white">Dec 1</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices - Mobile Cards / Desktop Table */}
      <Card className="border-2">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">All Invoices</CardTitle>
          <CardDescription>Download or view your payment receipts</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Description</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Payment Method</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-4 px-4">
                      <p className="text-gray-900 dark:text-white">{formatDate(invoice.date)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Receipt className="size-4 text-gray-400" />
                        <p className="text-gray-900 dark:text-white">{invoice.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-600 dark:text-gray-400">{invoice.paymentMethod}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-900 dark:text-white">${invoice.amount.toFixed(2)}</p>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="py-4 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                      >
                        <Download className="size-4 mr-2" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {mockInvoices.map((invoice) => (
              <div key={invoice.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(invoice.date)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.description}</p>
                  </div>
                  {getStatusBadge(invoice.status)}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">${invoice.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{invoice.paymentMethod}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(invoice.id)}
                  >
                    <Download className="size-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="text-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
        <p>
          Need help with billing? <a href="#" className="text-blue-600 hover:underline">Contact support</a>
        </p>
      </div>
    </div>
  );
}
