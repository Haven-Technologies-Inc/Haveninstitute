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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl text-gray-900 mb-2">Billing History</h3>
        <p className="text-gray-600">View and download your past invoices</p>
      </div>

      {/* Summary Card */}
      <Card className="border-2 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 mb-1">Total Spent</p>
              <p className="text-3xl text-gray-900">${totalSpent.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Total Invoices</p>
              <p className="text-3xl text-gray-900">{mockInvoices.length}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Next Billing Date</p>
              <p className="text-3xl text-gray-900">Dec 1</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>Download or view your payment receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 text-gray-700">Payment Method</th>
                  <th className="text-left py-3 px-4 text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="text-gray-900">{formatDate(invoice.date)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Receipt className="size-4 text-gray-400" />
                        <p className="text-gray-900">{invoice.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-600">{invoice.paymentMethod}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-900">${invoice.amount.toFixed(2)}</p>
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
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="text-center text-gray-600">
        <p>
          Need help with billing? <a href="#" className="text-blue-600 hover:underline">Contact support</a>
        </p>
      </div>
    </div>
  );
}
