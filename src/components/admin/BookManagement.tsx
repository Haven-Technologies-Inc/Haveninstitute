import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  BookOpen, 
  Plus, 
  Edit,
  Trash2, 
  Search,
  Upload,
  Eye,
  Download,
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  Loader2,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  price: number;
  ebookPrice: number;
  category: string;
  totalPages: number;
  purchaseCount: number;
  revenue: number;
  rating: number;
  published: boolean;
}

// Transform backend book to frontend format
function transformBook(b: any): Book {
  return {
    id: b.id,
    title: b.title || '',
    author: b.author || '',
    description: b.description || '',
    coverImage: b.coverImageUrl || b.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    price: b.printPrice || b.price || 0,
    ebookPrice: b.ebookPrice || b.digitalPrice || 0,
    category: b.category || '',
    totalPages: b.pageCount || b.totalPages || 0,
    purchaseCount: b.salesCount || b.purchaseCount || 0,
    revenue: b.totalRevenue || b.revenue || 0,
    rating: b.averageRating || b.rating || 0,
    published: b.isActive !== false
  };
}

export function BookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    ebookPrice: '',
    category: '',
    totalPages: ''
  });
  const [saving, setSaving] = useState(false);

  // Load books from backend
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/books');
      const data = response.data.data;
      const bookList = (data.books || data || []).map(transformBook);
      setBooks(bookList);
    } catch (error) {
      console.error('Failed to load books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = books.reduce((sum, book) => sum + book.revenue, 0);
  const totalSales = books.reduce((sum, book) => sum + book.purchaseCount, 0);
  const avgRating = books.length > 0 ? books.reduce((sum, book) => sum + book.rating, 0) / books.length : 0;

  const handleAddBook = () => {
    setIsAdding(true);
    setFormData({
      title: '',
      author: '',
      description: '',
      price: '',
      ebookPrice: '',
      category: '',
      totalPages: ''
    });
  };

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setIsEditing(true);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price.toString(),
      ebookPrice: book.ebookPrice.toString(),
      category: book.category,
      totalPages: book.totalPages.toString()
    });
  };

  const handleDeleteBook = async (id: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      try {
        await api.delete(`/books/${id}`);
        setBooks(books.filter(book => book.id !== id));
        toast.success('Book deleted successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.error?.message || 'Failed to delete book');
      }
    }
  };

  const handleSaveBook = async () => {
    setSaving(true);
    try {
      if (isAdding) {
        const response = await api.post('/books', {
          title: formData.title,
          author: formData.author,
          description: formData.description,
          printPrice: parseFloat(formData.price),
          ebookPrice: parseFloat(formData.ebookPrice),
          category: formData.category,
          pageCount: parseInt(formData.totalPages),
          isActive: true
        });
        const newBook = transformBook(response.data.data);
        setBooks([...books, newBook]);
        setIsAdding(false);
        toast.success('Book created successfully');
      } else if (isEditing && selectedBook) {
        const response = await api.put(`/books/${selectedBook.id}`, {
          title: formData.title,
          author: formData.author,
          description: formData.description,
          printPrice: parseFloat(formData.price),
          ebookPrice: parseFloat(formData.ebookPrice),
          category: formData.category,
          pageCount: parseInt(formData.totalPages)
        });
        const updatedBook = transformBook(response.data.data);
        setBooks(books.map(book => book.id === selectedBook.id ? updatedBook : book));
        setIsEditing(false);
        setSelectedBook(null);
        toast.success('Book updated successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to save book');
    } finally {
      setSaving(false);
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="size-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-gray-900 mb-2">Book Management</h2>
          <p className="text-gray-600">Manage your ebook library and content</p>
        </div>
        <Button variant="outline" onClick={loadBooks}>
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Total Books</CardDescription>
              <BookOpen className="size-4 text-gray-400" />
            </div>
            <CardTitle className="text-3xl">{books.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Total Sales</CardDescription>
              <Users className="size-4 text-gray-400" />
            </div>
            <CardTitle className="text-3xl">{totalSales}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Revenue</CardDescription>
              <DollarSign className="size-4 text-gray-400" />
            </div>
            <CardTitle className="text-3xl">${totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Avg Rating</CardDescription>
              <TrendingUp className="size-4 text-gray-400" />
            </div>
            <CardTitle className="text-3xl">{avgRating.toFixed(1)} ⭐</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Search books..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={handleAddBook} className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className="size-4 mr-2" />
          Add New Book
        </Button>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="border-2">
            <CardHeader className="p-0">
              <div className="relative h-48 rounded-t-lg overflow-hidden">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className={book.published ? 'bg-green-500' : 'bg-gray-500'}>
                    {book.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Badge variant="outline" className="mb-2">{book.category}</Badge>
              <h3 className="text-lg mb-1 line-clamp-2">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{book.author}</p>

              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div>
                  <p className="text-gray-600">Ebook Price</p>
                  <p className="text-blue-600">${book.ebookPrice}</p>
                </div>
                <div>
                  <p className="text-gray-600">Print Price</p>
                  <p>${book.price}</p>
                </div>
                <div>
                  <p className="text-gray-600">Sales</p>
                  <p>{book.purchaseCount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Revenue</p>
                  <p>${book.revenue.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleEditBook(book)}
                >
                  <Edit className="size-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDeleteBook(book.id)}
                >
                  <Trash2 className="size-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAdding || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsAdding(false);
          setIsEditing(false);
          setSelectedBook(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isAdding ? 'Add New Book' : 'Edit Book'}</DialogTitle>
            <DialogDescription>
              {isAdding ? 'Add a new book to your library' : 'Update book information'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Book title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Book description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., NCLEX-RN"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ebookPrice">Ebook Price *</Label>
                <Input
                  id="ebookPrice"
                  type="number"
                  step="0.01"
                  value={formData.ebookPrice}
                  onChange={(e) => setFormData({ ...formData, ebookPrice: e.target.value })}
                  placeholder="29.99"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Print Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="49.99"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pages">Total Pages *</Label>
              <Input
                id="pages"
                type="number"
                value={formData.totalPages}
                onChange={(e) => setFormData({ ...formData, totalPages: e.target.value })}
                placeholder="450"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Upload Book Content (PDF)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="size-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop your PDF file here, or click to browse
                </p>
                <Button variant="outline" size="sm">
                  <FileText className="size-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setIsEditing(false);
                  setSelectedBook(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600"
                onClick={handleSaveBook}
              >
                {isAdding ? 'Add Book' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
