import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  BookOpen, 
  ShoppingCart, 
  Star, 
  ExternalLink, 
  Mail,
  CheckCircle2,
  Download,
  CreditCard,
  X
} from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  ebookPrice: number;
  rating: number;
  reviews: number;
  coverImage: string;
  amazonLink: string;
  bestseller?: boolean;
  category: string;
}

const books: Book[] = [
  {
    id: '1',
    title: 'NCLEX-RN Complete Review 2024',
    author: 'Dr. Sarah Mitchell, RN, PhD',
    description: 'Comprehensive review covering all 8 NCLEX categories with 1000+ practice questions, detailed rationales, and test-taking strategies.',
    price: 49.99,
    ebookPrice: 29.99,
    rating: 4.8,
    reviews: 2341,
    coverImage: 'https://images.unsplash.com/photo-1652787544912-137c7f92f99b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGV4dGJvb2slMjBudXJzaW5nJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc2MzI2NTc4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    amazonLink: 'https://amazon.com/nclex-rn-review',
    bestseller: true,
    category: 'NCLEX-RN'
  },
  {
    id: '2',
    title: 'Pharmacology Made Easy for NCLEX',
    author: 'Dr. Michael Chen, PharmD',
    description: 'Master medication classifications, nursing considerations, and drug interactions with memory tricks and mnemonics.',
    price: 39.99,
    ebookPrice: 24.99,
    rating: 4.9,
    reviews: 1876,
    coverImage: 'https://images.unsplash.com/photo-1760006782177-7f05cce886bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMGd1aWRlJTIwYm9vayUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NjMyNjU3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    amazonLink: 'https://amazon.com/pharmacology-nclex',
    bestseller: true,
    category: 'Pharmacology'
  },
  {
    id: '3',
    title: 'Medical-Surgical Nursing Success',
    author: 'Lisa Anderson, MSN, RN',
    description: 'Complete guide to Med-Surg nursing with case studies, critical thinking exercises, and NCLEX-style questions.',
    price: 44.99,
    ebookPrice: 27.99,
    rating: 4.7,
    reviews: 1543,
    coverImage: 'https://images.unsplash.com/photo-1652787544912-137c7f92f99b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwYm9vayUyMGxlYXJuaW5nfGVufDF8fHx8MTc2MzI2NTc4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    amazonLink: 'https://amazon.com/medsurg-nursing',
    category: 'Medical-Surgical'
  },
  {
    id: '4',
    title: 'Priority & Delegation for NCLEX',
    author: 'Dr. Jennifer Williams, RN',
    description: 'Learn to prioritize patient care and delegate effectively with 500+ practice scenarios and decision trees.',
    price: 34.99,
    ebookPrice: 19.99,
    rating: 4.8,
    reviews: 1234,
    coverImage: 'https://images.unsplash.com/photo-1652787544912-137c7f92f99b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGV4dGJvb2slMjBudXJzaW5nJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc2MzI2NTc4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    amazonLink: 'https://amazon.com/priority-delegation',
    category: 'Critical Thinking'
  },
  {
    id: '5',
    title: 'Maternal-Newborn Nursing Essentials',
    author: 'Dr. Emily Rodriguez, CNM',
    description: 'Essential content for maternity nursing including prenatal care, labor, delivery, and postpartum care.',
    price: 42.99,
    ebookPrice: 26.99,
    rating: 4.9,
    reviews: 987,
    coverImage: 'https://images.unsplash.com/photo-1760006782177-7f05cce886bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMGd1aWRlJTIwYm9vayUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NjMyNjU3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    amazonLink: 'https://amazon.com/maternal-newborn',
    bestseller: true,
    category: 'Maternal-Newborn'
  },
  {
    id: '6',
    title: 'Pediatric Nursing Made Simple',
    author: 'Dr. Robert Taylor, DNP, RN',
    description: 'Age-appropriate care for infants through adolescents with growth charts, immunization schedules, and more.',
    price: 38.99,
    ebookPrice: 22.99,
    rating: 4.7,
    reviews: 856,
    coverImage: 'https://images.unsplash.com/photo-1652787544912-137c7f92f99b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwYm9vayUyMGxlYXJuaW5nfGVufDF8fHx8MTc2MzI2NTc4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    amazonLink: 'https://amazon.com/pediatric-nursing',
    category: 'Pediatrics'
  }
];

interface BookstoreProps {
  onGetStarted?: () => void;
}

export function Bookstore({ onGetStarted }: BookstoreProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const handleEbookPurchase = (book: Book) => {
    setSelectedBook(book);
    setCheckoutOpen(true);
    setCheckoutComplete(false);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment processing
    setTimeout(() => {
      setCheckoutComplete(true);
      // Reset form
      setFormData({
        email: '',
        name: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
      });
    }, 1500);
  };

  const handleCloseCheckout = () => {
    setCheckoutOpen(false);
    setCheckoutComplete(false);
    setSelectedBook(null);
  };

  return (
    <>
      <section id="bookstore" className="py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="bg-orange-100 text-orange-800 mb-4">
              <BookOpen className="size-3 mr-2" />
              NurseHaven Bookstore
            </Badge>
            <h2 className="text-4xl lg:text-5xl mb-4">
              Expert-Authored NCLEX Study Guides
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive books written by nursing educators to complement your study plan. 
              Choose ebooks for instant access or physical copies from Amazon.
            </p>
          </div>

          {/* Filter Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {['All Books', 'Bestsellers', 'NCLEX-RN', 'Pharmacology', 'Med-Surg', 'Pediatrics'].map((filter) => (
              <Badge 
                key={filter} 
                variant="outline" 
                className="cursor-pointer hover:bg-blue-50 px-4 py-2"
              >
                {filter}
              </Badge>
            ))}
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book) => (
              <Card key={book.id} className="border-2 hover:shadow-xl transition-all group">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    {book.bestseller && (
                      <Badge className="absolute top-4 left-4 bg-orange-500 text-white z-10">
                        Bestseller
                      </Badge>
                    )}
                    <ImageWithFallback
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-3">
                    <Badge variant="outline" className="text-xs mb-2">
                      {book.category}
                    </Badge>
                    <h3 className="text-xl mb-1 line-clamp-2">{book.title}</h3>
                    <p className="text-gray-600 text-sm">by {book.author}</p>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {book.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`size-4 ${
                            i < Math.floor(book.rating) 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {book.rating} ({book.reviews} reviews)
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-600">Ebook</p>
                      <p className="text-2xl text-blue-600">${book.ebookPrice}</p>
                    </div>
                    <div className="h-12 w-px bg-gray-300" />
                    <div>
                      <p className="text-sm text-gray-600">Paperback</p>
                      <p className="text-2xl text-gray-900">${book.price}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                      onClick={() => handleEbookPurchase(book)}
                    >
                      <Mail className="size-4 mr-2" />
                      Buy Ebook - ${book.ebookPrice}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(book.amazonLink, '_blank')}
                    >
                      <ExternalLink className="size-4 mr-2" />
                      Buy on Amazon - ${book.price}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-4">
                <Download className="size-8 text-blue-600" />
              </div>
              <h3 className="text-xl mb-2">Instant Access</h3>
              <p className="text-gray-600">
                Ebooks delivered to your email within minutes of purchase
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 p-4 rounded-full w-fit mx-auto mb-4">
                <BookOpen className="size-8 text-purple-600" />
              </div>
              <h3 className="text-xl mb-2">PDF Format</h3>
              <p className="text-gray-600">
                Read on any device - phone, tablet, computer, or e-reader
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4">
                <CheckCircle2 className="size-8 text-green-600" />
              </div>
              <h3 className="text-xl mb-2">Expert Authors</h3>
              <p className="text-gray-600">
                Written by licensed nurses and NCLEX educators
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      <Dialog open={checkoutOpen} onOpenChange={handleCloseCheckout}>
        <DialogContent className="sm:max-w-md">
          {!checkoutComplete ? (
            <>
              <DialogHeader>
                <DialogTitle>Purchase Ebook</DialogTitle>
                <DialogDescription>
                  {selectedBook?.title} - ${selectedBook?.ebookPrice}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    <Mail className="size-3 inline mr-1" />
                    Ebook will be delivered to this email
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card">Card Number</Label>
                  <div className="relative">
                    <Input
                      id="card"
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      required
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      value={formData.expiry}
                      onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${selectedBook?.ebookPrice}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Total</span>
                    <span className="text-2xl">${selectedBook?.ebookPrice}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                  Complete Purchase
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4">
                <CheckCircle2 className="size-12 text-green-600" />
              </div>
              <DialogTitle className="mb-2">Purchase Complete!</DialogTitle>
              <DialogDescription className="mb-6">
                Your ebook has been sent to <strong>{formData.email}</strong>
                <br />
                <br />
                Check your inbox for the download link. The email may take a few minutes to arrive.
              </DialogDescription>
              <div className="space-y-2">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  onClick={handleCloseCheckout}
                >
                  Done
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setCheckoutComplete(false);
                    setSelectedBook(null);
                  }}
                >
                  Buy Another Book
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
