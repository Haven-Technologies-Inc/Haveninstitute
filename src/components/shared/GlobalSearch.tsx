import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';
import {
  Search,
  X,
  User,
  FileText,
  BookOpen,
  Layers,
  MessageSquare,
  Users,
  Clock,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { searchApi, SearchResult } from '../../services/api/search.api';

interface GlobalSearchProps {
  variant: 'user' | 'admin';
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  question: FileText,
  book: BookOpen,
  flashcard: Layers,
  post: MessageSquare,
  'study-group': Users,
};

export function GlobalSearch({ variant, className }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(searchApi.getRecentSearches());
  }, []);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Filter types based on variant
      const types = variant === 'admin' 
        ? ['user', 'question', 'book', 'flashcard'] as const
        : ['question', 'book', 'flashcard', 'post', 'study-group'] as const;

      const response = await searchApi.search(searchQuery, { 
        types: types as any,
        limit: 8 
      });
      setResults(response.results);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [variant]);

  // Handle input change with debounce
  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length >= 2) {
      setIsLoading(true);
      debounceRef.current = setTimeout(() => {
        performSearch(value);
      }, 300);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = results.length + (query.length < 2 ? recentSearches.length : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (query.length < 2 && selectedIndex < recentSearches.length) {
            // Select recent search
            handleInputChange(recentSearches[selectedIndex]);
          } else if (results[selectedIndex]) {
            // Navigate to result
            handleResultClick(results[selectedIndex]);
          }
        } else if (query.trim().length >= 2) {
          // Search with current query
          performSearch(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    searchApi.saveRecentSearch(query);
    setIsOpen(false);
    setQuery('');
    
    // Navigate based on result type and variant
    const basePath = variant === 'admin' ? '/admin' : '/app';
    
    switch (result.type) {
      case 'user':
        navigate(`${basePath}/users?id=${result.id}`);
        break;
      case 'question':
        navigate(`${basePath}/questions/${result.id}`);
        break;
      case 'book':
        navigate(`${basePath}/books/${result.id}`);
        break;
      case 'flashcard':
        navigate(`${basePath}/flashcards/${result.id}`);
        break;
      case 'post':
        navigate(`${basePath}/forum/post/${result.id}`);
        break;
      case 'study-group':
        navigate(`${basePath}/groups/${result.id}`);
        break;
      default:
        if (result.url) {
          navigate(result.url);
        }
    }
  };

  // Handle recent search click
  const handleRecentClick = (recentQuery: string) => {
    setQuery(recentQuery);
    performSearch(recentQuery);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getIcon = (type: string) => {
    const Icon = ICON_MAP[type] || FileText;
    return Icon;
  };

  const showDropdown = isOpen && (query.length >= 2 || recentSearches.length > 0);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-8 h-9 bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 text-sm w-full"
          aria-label="Global search"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-4 text-gray-500 dark:text-gray-400">
              <Loader2 className="size-5 animate-spin mr-2" />
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {/* Results */}
          {!isLoading && results.length > 0 && (
            <div className="py-2">
              <p className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Results
              </p>
              {results.map((result, index) => {
                const Icon = getIcon(result.type);
                const isSelected = selectedIndex === index;
                
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <div className={`p-1.5 rounded-md ${
                      result.type === 'user' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      result.type === 'question' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      result.type === 'book' ? 'bg-green-100 dark:bg-green-900/30' :
                      result.type === 'flashcard' ? 'bg-orange-100 dark:bg-orange-900/30' :
                      result.type === 'post' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                      'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Icon className={`size-4 ${
                        result.type === 'user' ? 'text-blue-600 dark:text-blue-400' :
                        result.type === 'question' ? 'text-purple-600 dark:text-purple-400' :
                        result.type === 'book' ? 'text-green-600 dark:text-green-400' :
                        result.type === 'flashcard' ? 'text-orange-600 dark:text-orange-400' :
                        result.type === 'post' ? 'text-indigo-600 dark:text-indigo-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {result.title}
                      </p>
                      {result.subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                      {result.type.replace('-', ' ')}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="py-6 text-center text-gray-500 dark:text-gray-400">
              <Search className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try different keywords</p>
            </div>
          )}

          {/* Recent Searches */}
          {!isLoading && query.length < 2 && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="flex items-center justify-between px-3 py-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Recent
                </p>
                <button
                  onClick={() => {
                    searchApi.clearRecentSearches();
                    setRecentSearches([]);
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((recent, index) => {
                const isSelected = selectedIndex === index;
                
                return (
                  <button
                    key={recent}
                    onClick={() => handleRecentClick(recent)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Clock className="size-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                      {recent}
                    </span>
                    <ArrowRight className="size-4 text-gray-400" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty State - No Recent */}
          {!isLoading && query.length < 2 && recentSearches.length === 0 && (
            <div className="py-6 text-center text-gray-500 dark:text-gray-400">
              <Search className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Type to search</p>
              <p className="text-xs mt-1">
                {variant === 'admin' 
                  ? 'Search users, questions, books...'
                  : 'Search content, posts, groups...'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
