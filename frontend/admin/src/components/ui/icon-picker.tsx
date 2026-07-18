import { useMemo, useState } from 'react';
import { DynamicIcon, iconNames, type IconName } from 'lucide-react/dynamic';
import { ChevronsUpDown, Check, Shapes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

// How many results to render at once. The full library has ~1500 icons;
// search narrows it down instead of rendering everything at once.
const MAX_RESULTS = 60;

function formatIconLabel(name: string): string {
  return name
    .split('-')
    .map((part) => (part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');
}

interface IconPickerProps {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function IconPicker({ value, onChange, placeholder = 'Select an icon…', className }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return iconNames.slice(0, MAX_RESULTS);
    const starts: string[] = [];
    const includes: string[] = [];
    for (const name of iconNames) {
      if (name.startsWith(q)) starts.push(name);
      else if (name.includes(q)) includes.push(name);
      if (starts.length + includes.length >= MAX_RESULTS * 3) break;
    }
    return [...starts, ...includes].slice(0, MAX_RESULTS);
  }, [search]);

  const isValid = value && (iconNames as readonly string[]).includes(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between font-normal', className)}
        >
          <span className="flex items-center gap-2 truncate">
            {isValid ? (
              <DynamicIcon name={value as IconName} className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Shapes className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className={cn('truncate', !value && 'text-muted-foreground')}>
              {value ? formatIconLabel(value) : placeholder}
            </span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search icons…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-72">
            <CommandEmpty>No icon found.</CommandEmpty>
            <CommandGroup>
              {results.map((name) => (
                <CommandItem
                  key={name}
                  value={name}
                  onSelect={() => {
                    onChange(name);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="gap-2"
                >
                  <DynamicIcon name={name as IconName} className="h-4 w-4 shrink-0" />
                  <span className="truncate">{formatIconLabel(name)}</span>
                  {value === name && <Check className="ml-auto h-4 w-4 shrink-0" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {!search && (
            <div className="border-t px-3 py-1.5 text-[11px] text-muted-foreground font-mono">
              Showing {results.length} of {iconNames.length} icons — search to find more
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
