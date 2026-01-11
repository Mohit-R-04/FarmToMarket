import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface LocationSuggestion {
    formatted: string;
    city: string;
    state: string;
    country: string;
    postcode: string;
    latitude: number;
    longitude: number;
    label: string;
}

interface LocationAutocompleteProps {
    value: string;
    onChange: (value: string, suggestion?: LocationSuggestion) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
}

export function LocationAutocomplete({
    value,
    onChange,
    placeholder = "Enter location",
    label,
    error,
    disabled = false,
    className = ""
}: LocationAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions from backend
    const fetchSuggestions = async (searchText: string) => {
        if (!searchText || searchText.length < 2) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching suggestions for:', searchText);
            const response = await fetch(
                `http://localhost:8080/api/location/autocomplete?text=${encodeURIComponent(searchText)}`
            );

            console.log('Response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Received suggestions:', data);
                setSuggestions(data);
                setShowSuggestions(true);
            } else {
                const errorText = await response.text();
                console.error('API error:', response.status, errorText);
                setSuggestions([]);
            }
        } catch (err) {
            console.error('Failed to fetch location suggestions:', err);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    const handleInputChange = (newValue: string) => {
        onChange(newValue);
        setSelectedIndex(-1);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(newValue);
        }, 300);
    };

    // Handle suggestion selection
    const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
        onChange(suggestion.label, suggestion);
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSelectSuggestion(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Clear input
    const handleClear = () => {
        onChange('');
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            {label && (
                <label className="text-sm font-medium mb-1.5 block text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}

            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <MapPin className="h-4 w-4" />
                </div>

                <Input
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setShowSuggestions(true);
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`pl-10 pr-10 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {loading && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                    {value && !loading && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className={`w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${index === selectedIndex ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {suggestion.label}
                                    </p>
                                    {suggestion.formatted && suggestion.formatted !== suggestion.label && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                            {suggestion.formatted}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
