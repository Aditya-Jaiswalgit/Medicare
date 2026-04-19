import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Calendar, FileText, Stethoscope, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'patient' | 'appointment' | 'doctor' | 'report';
  title: string;
  subtitle: string;
  route: string;
}

const mockSearchData: SearchResult[] = [
  { id: '1', type: 'patient', title: 'John Anderson', subtitle: 'PT-001 • Male • 45 years', route: '/patients' },
  { id: '2', type: 'patient', title: 'Emily Chen', subtitle: 'PT-002 • Female • 32 years', route: '/patients' },
  { id: '3', type: 'patient', title: 'Michael Brown', subtitle: 'PT-003 • Male • 58 years', route: '/patients' },
  { id: '4', type: 'patient', title: 'Sophie Martinez', subtitle: 'PT-004 • Female • 28 years', route: '/patients' },
  { id: '5', type: 'patient', title: 'David Lee', subtitle: 'PT-005 • Male • 41 years', route: '/patients' },
  { id: '6', type: 'appointment', title: 'John Anderson - Follow-up', subtitle: 'Today at 09:00 AM • Dr. Sarah Johnson', route: '/appointments/today' },
  { id: '7', type: 'appointment', title: 'Emily Chen - New Consultation', subtitle: 'Today at 09:30 AM • Dr. Sarah Johnson', route: '/appointments/today' },
  { id: '8', type: 'appointment', title: 'Michael Brown - Routine Checkup', subtitle: 'Tomorrow at 10:00 AM • Dr. James Wilson', route: '/appointments' },
  { id: '9', type: 'doctor', title: 'Dr. Sarah Johnson', subtitle: 'General Physician • Available', route: '/doctors' },
  { id: '10', type: 'doctor', title: 'Dr. James Wilson', subtitle: 'Cardiologist • Available', route: '/doctors' },
  { id: '11', type: 'doctor', title: 'Dr. Emily Brown', subtitle: 'Pediatrician • On Leave', route: '/doctors' },
  { id: '12', type: 'report', title: 'Daily Appointments Report', subtitle: 'Reports • Appointments', route: '/reports/appointments' },
  { id: '13', type: 'report', title: 'Patient Registration Report', subtitle: 'Reports • Registrations', route: '/reports/registrations' },
  { id: '14', type: 'report', title: 'Payment Collection Report', subtitle: 'Reports • Payments', route: '/reports/payments' },
];

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = mockSearchData.filter(
        item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered.slice(0, 8));
      setIsOpen(true);
      setSelectedIndex(0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          navigate(results[selectedIndex].route);
          setQuery('');
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.route);
    setQuery('');
    setIsOpen(false);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'patient':
        return <User className="w-4 h-4" />;
      case 'appointment':
        return <Calendar className="w-4 h-4" />;
      case 'doctor':
        return <Stethoscope className="w-4 h-4" />;
      case 'report':
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: SearchResult['type']) => {
    const styles = {
      patient: 'bg-primary/10 text-primary',
      appointment: 'bg-success/10 text-success',
      doctor: 'bg-accent text-accent-foreground',
      report: 'bg-muted text-muted-foreground',
    };
    return (
      <Badge className={cn('text-xs', styles[type])} variant="outline">
        {type}
      </Badge>
    );
  };

  return (
    <div ref={containerRef} className="relative max-w-md w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder="Search patients, appointments, doctors..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.trim().length > 0 && setIsOpen(true)}
        className="pl-10 pr-8 bg-secondary border-0"
      />
      {query && (
        <button
          onClick={() => {
            setQuery('');
            setIsOpen(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-border">
            <p className="text-xs text-muted-foreground">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 text-left transition-colors',
                  index === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{result.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                </div>
                {getTypeBadge(result.type)}
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">↑↓</kbd> to navigate
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">↵</kbd> to select
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">Esc</kbd> to close
            </p>
          </div>
        </div>
      )}

      {isOpen && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 p-6 text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
