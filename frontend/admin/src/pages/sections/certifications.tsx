import { useState, useRef } from "react";
import { useGetAdminSection, useUpdateAdminSection, getGetAdminSectionQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ExternalLink, Eye, ImagePlus, ImageOff, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPicker } from "@/components/ui/icon-picker";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatFullDate } from "@/lib/date-utils";

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

type Certification = {
  id: number;
  name: string;
  org: string;
  date: string;
  credentialId: string;
  iconKey: string;
  credentialUrl?: string | null;
  imageUrl?: string | null;
};

export default function CertificationsSection() {
  const { data, isLoading } = useGetAdminSection("certifications");
  const updateMutation = useUpdateAdminSection();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const entries: Certification[] = (data?.data as Certification[]) || [];
  
  const [editingItem, setEditingItem] = useState<Certification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewEntry, setPreviewEntry] = useState<Certification | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await authFetch("/api/admin/project-images", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error || "Upload failed");
      }
      return res.json() as Promise<{ id: string; url: string }>;
    },
    onSuccess: (result) => {
      setEditingItem((prev) => (prev ? { ...prev, imageUrl: result.url } : prev));
    },
    onError: (err: Error) => {
      toast({ title: "Image upload failed", description: err.message, variant: "destructive" });
    },
  });

  function handleImageFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please choose an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max size is 5 MB.", variant: "destructive" });
      return;
    }
    imageUploadMutation.mutate(file);
  }

  const handleSave = (newEntries: Certification[]) => {
    updateMutation.mutate(
      { section: "certifications", data: { data: newEntries } },
      {
        onSuccess: () => {
          toast({ title: "Certifications updated", description: "Changes saved successfully." });
          queryClient.invalidateQueries({ queryKey: getGetAdminSectionQueryKey("certifications") });
          setIsDialogOpen(false);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to save data.", variant: "destructive" });
        }
      }
    );
  };

  const openNew = () => {
    setEditingItem({
      id: Date.now(),
      name: "",
      org: "",
      date: "",
      credentialId: "",
      iconKey: "award",
      credentialUrl: "",
      imageUrl: null,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (item: Certification) => {
    setEditingItem({ ...item });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    handleSave(entries.filter(e => e.id !== id));
  };

  const submitDialog = () => {
    if (!editingItem) return;
    
    let newEntries;
    if (entries.some(e => e.id === editingItem.id)) {
      newEntries = entries.map(e => e.id === editingItem.id ? editingItem : e);
    } else {
      newEntries = [editingItem, ...entries];
    }
    
    handleSave(newEntries);
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Certifications</h1>
          <p className="text-muted-foreground font-mono text-sm">Professional credentials and achievements.</p>
        </div>
        <Button onClick={openNew} className="font-mono uppercase tracking-wider">
          <Plus className="w-4 h-4 mr-2" /> Add Credential
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.length === 0 ? (
          <Card className="col-span-full border-dashed bg-muted/10">
            <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p className="font-mono text-sm mb-4">No certifications found</p>
              <Button variant="outline" onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add First</Button>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="group overflow-hidden transition-all hover:border-primary/50 relative">
              <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card shadow-sm rounded-md border p-1 z-10">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(entry)}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  }
                  title="Delete this certification?"
                  description={<>This will permanently remove <strong>{entry.name}</strong> from your portfolio. This action cannot be undone.</>}
                  onConfirm={() => handleDelete(entry.id)}
                />
              </div>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg leading-tight pr-16">{entry.name}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">{entry.org}</span>
                    <span className="text-muted-foreground font-mono text-xs">{formatFullDate(entry.date)}</span>
                  </div>
                  {entry.credentialId && (
                    <div className="pt-2">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
                        ID: {entry.credentialId}
                      </span>
                    </div>
                  )}
                  {(entry.imageUrl || entry.credentialUrl) && (
                    <div className="flex items-center gap-2 pt-3">
                      {entry.imageUrl && (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPreviewEntry(entry)}>
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> View Certificate
                        </Button>
                      )}
                      {entry.credentialUrl && (
                        <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                          <a href={entry.credentialUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Verify
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Certificate image preview popup */}
      <Dialog open={!!previewEntry} onOpenChange={(open) => !open && setPreviewEntry(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{previewEntry?.name}</DialogTitle>
          </DialogHeader>
          {previewEntry?.imageUrl && (
            <div className="p-6 pt-4">
              <img
                src={previewEntry.imageUrl}
                alt={`${previewEntry.name} certificate`}
                className="w-full h-auto max-h-[70vh] object-contain border border-border rounded-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem?.id && entries.some(e => e.id === editingItem.id) ? "Edit Certification" : "New Certification"}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Certification Name</Label>
                <Input value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issuing Organization</Label>
                  <Input value={editingItem.org} onChange={e => setEditingItem({...editingItem, org: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Date Issued</Label>
                  <Input type="date" value={editingItem.date} onChange={e => setEditingItem({...editingItem, date: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Credential ID</Label>
                  <Input value={editingItem.credentialId} onChange={e => setEditingItem({...editingItem, credentialId: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <IconPicker
                    value={editingItem.iconKey}
                    onChange={(value) => setEditingItem({...editingItem, iconKey: value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Credential URL (optional)</Label>
                <Input
                  type="url"
                  value={editingItem.credentialUrl ?? ""}
                  placeholder="https://www.credly.com/badges/…"
                  onChange={e => setEditingItem({...editingItem, credentialUrl: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">Link where visitors can verify this credential — shown as a "Verify" button.</p>
              </div>
              <div className="space-y-2">
                <Label>Certificate Image (optional)</Label>
                <div
                  className={`relative border-2 border-dashed rounded-lg transition-colors ${
                    isDragging ? 'border-primary bg-accent/40' : 'border-border hover:border-primary/50'
                  } ${editingItem.imageUrl ? 'p-0 overflow-hidden' : 'p-6 text-center cursor-pointer hover:bg-accent/20'}`}
                  onClick={() => !editingItem.imageUrl && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleImageFiles(e.dataTransfer.files);
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    className="hidden"
                    onChange={(e) => handleImageFiles(e.target.files)}
                  />
                  {imageUploadMutation.isPending ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <p className="text-xs font-mono">Uploading…</p>
                    </div>
                  ) : editingItem.imageUrl ? (
                    <div className="relative group">
                      <img src={editingItem.imageUrl} alt="Certificate preview" className="w-full h-40 object-cover" />
                      <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          <ImagePlus className="w-3.5 h-3.5 mr-1.5" /> Replace
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setEditingItem({ ...editingItem, imageUrl: null })}
                        >
                          <ImageOff className="w-3.5 h-3.5 mr-1.5" /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground py-2">
                      <ImagePlus className="w-7 h-7 text-muted-foreground/40" />
                      <p className="text-xs font-medium text-foreground">Drop a certificate image here or click to browse</p>
                      <p className="text-[10px] font-mono">PNG, JPEG, WEBP, GIF, or SVG · max 5 MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitDialog} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Credential"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
