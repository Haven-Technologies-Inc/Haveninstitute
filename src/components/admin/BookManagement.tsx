import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Switch } from '../ui/switch';
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
  RefreshCw,
  Image,
  Calendar,
  Building2,
  Hash,
  Star,
  Globe,
  Lock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

// Book categories for dropdown - must match backend BookCategory type
const BOOK_CATEGORIES = [
  { value: 'nclex_prep', label: 'NCLEX Prep' },
  { value: 'fundamentals', label: 'Fundamentals' },
  { value: 'pharmacology', label: 'Pharmacology' },
  { value: 'medical_surgical', label: 'Medical-Surgical' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'maternity', label: 'Maternity' },
  { value: 'mental_health', label: 'Mental Health' },
  { value: 'community_health', label: 'Community Health' },
  { value: 'leadership', label: 'Leadership' }
];

// Book formats - must match backend BookFormat type
const BOOK_FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'epub', label: 'EPUB' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' }
];

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
    totalPages: '',
    isbn: '',
    publisher: '',
    publicationDate: '',
    format: 'both',
    isPremium: false,
    isFree: false,
    isPublished: true,
    tags: '',
    previewPages: '10'
  });
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const coverInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      price: '',
      ebookPrice: '',
      category: '',
      totalPages: '',
      isbn: '',
      publisher: '',
      publicationDate: '',
      format: 'pdf',
      isPremium: false,
      isFree: false,
      isPublished: true,
      tags: '',
      previewPages: '10'
    });
    setCoverFile(null);
    setContentFile(null);
    setCoverPreview('');
    setFormErrors({});
  };

  const handleAddBook = () => {
    setIsAdding(true);
    resetForm();
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
      totalPages: book.totalPages.toString(),
      isbn: '',
      publisher: '',
      publicationDate: '',
      format: 'pdf',
      isPremium: false,
      isFree: book.price === 0,
      isPublished: book.published,
      tags: '',
      previewPages: '10'
    });
    setCoverPreview(book.coverImage);
    setFormErrors({});
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleContentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error('PDF must be less than 100MB');
        return;
      }
      setContentFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.author.trim()) errors.author = 'Author is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.totalPages || parseInt(formData.totalPages) < 1) errors.totalPages = 'Valid page count required';
    
    if (!formData.isFree) {
      // For digital formats, need at least ebook price
      if (!formData.ebookPrice || parseFloat(formData.ebookPrice) < 0) {
        errors.ebookPrice = 'Valid price required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
    console.log('=== handleSaveBook called ===');
    console.log('isAdding:', isAdding);
    console.log('isEditing:', isEditing);
    console.log('formData:', formData);
    
    if (!validateForm()) {
      console.log('Validation failed, errors:', formErrors);
      toast.error('Please fix the form errors');
      return;
    }
    
    console.log('Validation passed, starting save...');

    setSaving(true);
    try {
      // Upload cover image if selected
      let coverImageUrl = selectedBook?.coverImage || '';
      if (coverFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', coverFile);
        formDataUpload.append('type', 'book-cover');
        try {
          const uploadRes = await api.post('/uploads', formDataUpload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          coverImageUrl = uploadRes.data.data?.url || '';
        } catch (e) {
          console.warn('Cover upload failed, using placeholder');
          coverImageUrl = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400';
        }
      }

      // Upload PDF content if selected
      let fileUrl = '';
      if (contentFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', contentFile);
        formDataUpload.append('type', 'book-content');
        try {
          const uploadRes = await api.post('/uploads', formDataUpload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          fileUrl = uploadRes.data.data?.url || '';
        } catch (e) {
          console.warn('Content upload failed');
        }
      }

      // Prepare book data matching backend Book model
      const bookData: Record<string, any> = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        category: formData.category || 'fundamentals',
        format: formData.format || 'pdf',
        totalPages: parseInt(formData.totalPages) || 0,
        price: formData.isFree ? 0 : parseFloat(formData.ebookPrice) || parseFloat(formData.price) || 0,
        isFree: formData.isFree,
        isPremiumOnly: formData.isPremium,
        isActive: formData.isPublished,
        coverImageUrl: coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
      };

      // Add optional fields only if they have values
      if (formData.isbn.trim()) bookData.isbn = formData.isbn.trim();
      if (formData.tags.trim()) bookData.tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      if (fileUrl) bookData.fileUrl = fileUrl;

      console.log('Sending book data:', bookData);

      if (isAdding) {
        const response = await api.post('/books', bookData);
        console.log('Create response:', response.data);
        const newBook = transformBook(response.data.data);
        setBooks([...books, newBook]);
        setIsAdding(false);
        resetForm();
        toast.success('Book created successfully');
      } else if (isEditing && selectedBook) {
        const response = await api.put(`/books/${selectedBook.id}`, bookData);
        console.log('Update response:', response.data);
        const updatedBook = transformBook(response.data.data);
        setBooks(books.map(book => book.id === selectedBook.id ? updatedBook : book));
        setIsEditing(false);
        setSelectedBook(null);
        resetForm();
        toast.success('Book updated successfully');
      }
    } catch (error: any) {
      console.error('Save book error:', error.response?.data || error);
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to save book');
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
      <Dialog open={isAdding || isEditing} onOpenChange={(open: boolean) => {
        if (!open) {
          setIsAdding(false);
          setIsEditing(false);
          setSelectedBook(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <BookOpen className="size-5" />
              {isAdding ? 'Add New Book' : 'Edit Book'}
            </DialogTitle>
            <DialogDescription>
              {isAdding ? 'Fill in all required fields to add a new book to your library' : 'Update book information'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Cover Image & Basic Info */}
            <div className="grid grid-cols-3 gap-6">
              {/* Cover Image Upload */}
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-400 transition-colors"
                  onClick={() => coverInputRef.current?.click()}
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="w-full h-48 object-cover rounded-lg" />
                  ) : (
                    <>
                      <Image className="size-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload cover</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </div>

              {/* Title, Author, Description */}
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter book title"
                      className={formErrors.title ? 'border-red-500' : ''}
                    />
                    {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Author name, credentials"
                      className={formErrors.author ? 'border-red-500' : ''}
                    />
                    {formErrors.author && <p className="text-xs text-red-500">{formErrors.author}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter a compelling description of the book..."
                    rows={4}
                    className={formErrors.description ? 'border-red-500' : ''}
                  />
                  {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
                </div>
              </div>
            </div>

            {/* Category, ISBN, Publisher */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  title="Book category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full h-10 px-3 rounded-md border bg-background text-sm ${formErrors.category ? 'border-red-500' : 'border-input'}`}
                >
                  <option value="">Select category</option>
                  {BOOK_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {formErrors.category && <p className="text-xs text-red-500">{formErrors.category}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="isbn" className="flex items-center gap-1">
                  <Hash className="size-3" /> ISBN
                </Label>
                <Input
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  placeholder="978-0-123456-78-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publisher" className="flex items-center gap-1">
                  <Building2 className="size-3" /> Publisher
                </Label>
                <Input
                  id="publisher"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  placeholder="Publisher name"
                />
              </div>
            </div>

            {/* Format, Dates, Pages */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">Book Format</Label>
                <select
                  id="format"
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {BOOK_FORMATS.map(fmt => (
                    <option key={fmt.value} value={fmt.value}>{fmt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicationDate" className="flex items-center gap-1">
                  <Calendar className="size-3" /> Publication Date
                </Label>
                <Input
                  id="publicationDate"
                  type="date"
                  value={formData.publicationDate}
                  onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pages">Total Pages *</Label>
                <Input
                  id="pages"
                  type="number"
                  min="1"
                  value={formData.totalPages}
                  onChange={(e) => setFormData({ ...formData, totalPages: e.target.value })}
                  placeholder="450"
                  className={formErrors.totalPages ? 'border-red-500' : ''}
                />
                {formErrors.totalPages && <p className="text-xs text-red-500">{formErrors.totalPages}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="previewPages">Free Preview Pages</Label>
                <Input
                  id="previewPages"
                  type="number"
                  min="0"
                  value={formData.previewPages}
                  onChange={(e) => setFormData({ ...formData, previewPages: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium flex items-center gap-2">
                  <DollarSign className="size-4" /> Pricing
                </Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isFree"
                      checked={formData.isFree}
                      onCheckedChange={(checked: boolean) => setFormData({ ...formData, isFree: checked })}
                    />
                    <Label htmlFor="isFree" className="text-sm">Free Book</Label>
                  </div>
                </div>
              </div>

              {!formData.isFree && (
                <div className="grid grid-cols-2 gap-4">
                  {formData.format !== 'print' && (
                    <div className="space-y-2">
                      <Label htmlFor="ebookPrice">E-Book Price ($) *</Label>
                      <Input
                        id="ebookPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.ebookPrice}
                        onChange={(e) => setFormData({ ...formData, ebookPrice: e.target.value })}
                        placeholder="29.99"
                        className={formErrors.ebookPrice ? 'border-red-500' : ''}
                      />
                      {formErrors.ebookPrice && <p className="text-xs text-red-500">{formErrors.ebookPrice}</p>}
                    </div>
                  )}
                  {formData.format !== 'ebook' && (
                    <div className="space-y-2">
                      <Label htmlFor="price">Print Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="49.99"
                        className={formErrors.price ? 'border-red-500' : ''}
                      />
                      {formErrors.price && <p className="text-xs text-red-500">{formErrors.price}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Access & Visibility */}
            <div className="border rounded-lg p-4 space-y-4">
              <Label className="text-base font-medium">Access & Visibility</Label>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="size-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Premium Only</p>
                      <p className="text-xs text-gray-500">Restrict to premium subscribers</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.isPremium}
                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, isPremium: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {formData.isPublished ? <CheckCircle className="size-4 text-green-600" /> : <XCircle className="size-4 text-gray-400" />}
                    <div>
                      <p className="text-sm font-medium">Published</p>
                      <p className="text-xs text-gray-500">Make visible to users</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, isPublished: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="nursing, nclex, pharmacology, exam-prep"
              />
              <p className="text-xs text-gray-500">Add tags to help users find this book</p>
            </div>

            {/* PDF Upload */}
            <div className="space-y-2">
              <Label>Upload Book Content (PDF)</Label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
                onClick={() => contentInputRef.current?.click()}
              >
                <Upload className="size-10 text-gray-400 mx-auto mb-2" />
                {contentFile ? (
                  <div className="text-sm">
                    <p className="font-medium text-green-600">{contentFile.name}</p>
                    <p className="text-gray-500">{(contentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400">PDF up to 100MB</p>
                  </>
                )}
              </div>
              <input
                ref={contentInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleContentUpload}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setIsEditing(false);
                  setSelectedBook(null);
                  resetForm();
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <button
                type="button"
                className="bg-gradient-to-r from-blue-600 to-purple-600 min-w-[140px] text-white px-4 py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
                onClick={() => {
                  console.log('Add Book clicked!');
                  handleSaveBook();
                }}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isAdding ? 'Add Book' : 'Save Changes'
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
