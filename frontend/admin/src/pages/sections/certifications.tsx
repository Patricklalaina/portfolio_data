import { useState } from "react";
import { useGetAdminSection, useUpdateAdminSection, getGetAdminSectionQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPicker } from "@/components/ui/icon-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Certification = {
  id: number;
  name: string;
  org: string;
  date: string;
  credentialId: string;
  iconKey: string;
};

export default function CertificationsSection() {
  const { data, isLoading } = useGetAdminSection("certifications");
  const updateMutation = useUpdateAdminSection();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const entries: Certification[] = (data?.data as Certification[]) || [];
  
  const [editingItem, setEditingItem] = useState<Certification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      iconKey: "award"
    });
    setIsDialogOpen(true);
  };

  const openEdit = (item: Certification) => {
    setEditingItem({ ...item });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this certification?")) {
      handleSave(entries.filter(e => e.id !== id));
    }
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
              <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card shadow-sm rounded-md border p-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(entry)}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive" onClick={() => handleDelete(entry.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg leading-tight">{entry.name}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">{entry.org}</span>
                    <span className="text-muted-foreground font-mono text-xs">{entry.date}</span>
                  </div>
                  {entry.credentialId && (
                    <div className="pt-2">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
                        ID: {entry.credentialId}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
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
                  <Input value={editingItem.date} placeholder="e.g. 2023" onChange={e => setEditingItem({...editingItem, date: e.target.value})} />
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
