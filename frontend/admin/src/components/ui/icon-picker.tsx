import { useMemo, useRef, useState } from 'react';
import { DynamicIcon, iconNames, type IconName } from 'lucide-react/dynamic';
import { ChevronsUpDown, Check, Shapes, ImagePlus, Loader2, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// How many results to render at once. The full library has ~1500 icons;
// search narrows it down instead of rendering everything at once.
const MAX_RESULTS = 60;

/**
 * Custom uploaded icons are stored as an image URL (e.g. "/api/portfolio/project-images/…").
 * Lucide icon names are plain kebab-case words and never contain "/" or start with "http"/"data:",
 * so this check unambiguously distinguishes the two without needing a separate field.
 */
export function isCustomIconImage(value?: string | null): boolean {
  if (!value) return false;
  return value.startsWith('http') || value.startsWith('/') || value.startsWith('data:');
}

async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await authFetch('/api/admin/project-images', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || 'Upload failed');
      }
      return res.json() as Promise<{ id: string; url: string }>;
    },
    onSuccess: (result) => {
      onChange(result.url);
      setOpen(false);
    },
  });

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;
    uploadMutation.mutate(file);
  }

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

  const isCustomImage = isCustomIconImage(value);
  const isLibraryIcon = !!value && !isCustomImage && (iconNames as readonly string[]).includes(value);

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
            {isCustomImage ? (
              <img src={value!} alt="" className="h-4 w-4 shrink-0 rounded-sm object-cover" />
            ) : isLibraryIcon ? (
              <DynamicIcon name={value as IconName} className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Shapes className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className={cn('truncate', !value && 'text-muted-foreground')}>
              {isCustomImage ? 'Custom image' : value ? formatIconLabel(value) : placeholder}
            </span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Tabs defaultValue={isCustomImage ? 'upload' : 'library'}>
          <TabsList className="grid w-full grid-cols-2 rounded-none">
            <TabsTrigger value="library">Icon Library</TabsTrigger>
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-0">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search icons…"
                value={search}
                onValueChange={setSearch}
              />
              <CommandList className="max-h-64">
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
          </TabsContent>

          <TabsContent value="upload" className="mt-0 p-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {isCustomImage ? (
              <div className="relative">
                <div className="flex items-center gap-3 rounded-md border p-2">
                  <img src={value!} alt="" className="h-10 w-10 rounded-sm object-cover border" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">Custom uploaded icon</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{value}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-destructive"
                    onClick={() => onChange('')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                >
                  Replace image
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  'flex flex-col items-center gap-2 rounded-md border-2 border-dashed py-6 px-3 text-center cursor-pointer transition-colors',
                  isDragging ? 'border-primary bg-accent/40' : 'border-border hover:border-primary/50 hover:bg-accent/20',
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFiles(e.dataTransfer.files);
                }}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-xs font-mono text-muted-foreground">Uploading…</p>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-6 w-6 text-muted-foreground/50" />
                    <p className="text-xs font-medium">Drop an image or click to browse</p>
                    <p className="text-[10px] font-mono text-muted-foreground">PNG, JPEG, WEBP, GIF, SVG · max 5 MB</p>
                  </>
                )}
              </div>
            )}
            {uploadMutation.isError && (
              <p className="text-[11px] text-destructive mt-2">{(uploadMutation.error as Error).message}</p>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
