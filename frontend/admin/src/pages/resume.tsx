import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, Trash2, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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

function useResumeStatus() {
  return useQuery({
    queryKey: ['resume-status'],
    queryFn: async () => {
      const res = await authFetch('/api/admin/resume/status');
      if (!res.ok) throw new Error('Failed to fetch resume status');
      return res.json() as Promise<{ exists: boolean; uploadedAt: string | null; size: number | null }>;
    },
  });
}

export default function ResumePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const { data: status, isLoading: statusLoading } = useResumeStatus();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await authFetch('/api/admin/resume', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Resume uploaded', description: 'The PDF is now live on your portfolio.' });
      queryClient.invalidateQueries({ queryKey: ['resume-status'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch('/api/admin/resume', { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Resume removed', description: 'The PDF has been deleted.' });
      queryClient.invalidateQueries({ queryKey: ['resume-status'] });
    },
    onError: () => {
      toast({ title: 'Delete failed', variant: 'destructive' });
    },
  });

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast({ title: 'Invalid file', description: 'Only PDF files are accepted.', variant: 'destructive' });
      return;
    }
    uploadMutation.mutate(file);
  }

  const isUploading = uploadMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Resume</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Upload a PDF resume that visitors can download from your portfolio.
        </p>
      </div>

      {/* Status card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Current Resume
          </CardTitle>
          <CardDescription>
            {statusLoading
              ? 'Checking...'
              : status?.exists
              ? `Uploaded · ${status.size ? (status.size / 1024).toFixed(1) + ' KB' : ''}`
              : 'No resume uploaded yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : status?.exists ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Active — visible on portfolio
              </div>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href="/api/portfolio/resume" target="_blank" rel="noreferrer" download>
                  <Download className="w-4 h-4 mr-1.5" />
                  Preview
                </a>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate()}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1.5" />}
                Delete
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              No resume — upload one below to make it available.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            {status?.exists ? 'Replace Resume' : 'Upload Resume'}
          </CardTitle>
          <CardDescription>PDF only · max 10 MB</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              dragging
                ? 'border-primary bg-accent/40'
                : 'border-border hover:border-primary/50 hover:bg-accent/20'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Uploading…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <FileText className="w-10 h-10 text-muted-foreground/40" />
                <div>
                  <p className="text-sm font-medium text-foreground">Drop PDF here or click to browse</p>
                  <p className="text-xs mt-1">Replaces any existing resume instantly</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
