import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  CreditCard, 
  Plus, 
  Trash2,
  Check,
  Lock,
  Calendar,
  User
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface PaymentMethodsProps {
  onAddPaymentMethod?: (method: any) => void;
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true
  }
];

export function PaymentMethods({ onAddPaymentMethod }: PaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [showAddCard, setShowAddCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      const newCard: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'card',
        brand: 'visa', // Would be determined from card number
        last4: cardNumber.slice(-4),
        expiryMonth: parseInt(expiryDate.split('/')[0]),
        expiryYear: parseInt('20' + expiryDate.split('/')[1]),
        isDefault: paymentMethods.length === 0
      };

      setPaymentMethods([...paymentMethods, newCard]);
      setShowAddCard(false);
      setIsProcessing(false);
      
      // Reset form
      setCardNumber('');
      setCardName('');
      setExpiryDate('');
      setCvv('');

      if (onAddPaymentMethod) {
        onAddPaymentMethod(newCard);
      }
    }, 1500);
  };

  const handleDeleteCard = (id: string) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    }
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
  };

  const getCardIcon = (brand: string) => {
    const icons: Record<string, string> = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳'
    };
    return icons[brand.toLowerCase()] || '💳';
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl sm:text-2xl text-gray-900 dark:text-white mb-1 sm:mb-2">Payment Methods</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your payment methods and billing information</p>
        </div>
        {!showAddCard && (
          <Button onClick={() => setShowAddCard(true)} className="w-full sm:w-auto">
            <Plus className="size-4 mr-2" />
            Add Payment Method
          </Button>
        )}
      </div>

      {/* Add Card Form */}
      {showAddCard && (
        <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <CreditCard className="size-5 text-blue-600" />
              Add New Card
            </CardTitle>
            <CardDescription>Enter your card details securely</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleAddCard} className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="text-gray-700 mb-2 block">Card Number</label>
                <Input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  required
                />
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="text-gray-700 mb-2 block">Cardholder Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 mb-2 block">Expiry Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      className="pl-10"
                      maxLength={5}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-700 mb-2 block">CVV</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="pl-10"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-white border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Lock className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 mb-1">Your payment information is secure</p>
                  <p className="text-gray-600 text-sm">
                    We use industry-standard encryption to protect your card details. Your information is never stored on our servers.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <Button type="submit" className="w-full sm:flex-1" disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Add Card'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddCard(false)}
                  disabled={isProcessing}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Saved Payment Methods */}
      <div className="space-y-3 sm:space-y-4">
        {paymentMethods.map((method) => (
          <Card key={method.id} className="border-2">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Card Icon */}
                  <div className="text-3xl sm:text-4xl">
                    {getCardIcon(method.brand)}
                  </div>
                  
                  {/* Card Details */}
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-gray-900 dark:text-white capitalize text-sm sm:text-base">
                        {method.brand} •••• {method.last4}
                      </p>
                      {method.isDefault && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          <Check className="size-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full sm:w-auto">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCard(method.id)}
                    title="Delete card"
                  >
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {paymentMethods.length === 0 && !showAddCard && (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center">
              <CreditCard className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No payment methods added yet</p>
              <Button onClick={() => setShowAddCard(true)}>
                <Plus className="size-4 mr-2" />
                Add Your First Card
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
