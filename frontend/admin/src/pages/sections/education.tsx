import { useState } from "react";
import { useGetAdminSection, useUpdateAdminSection, getGetAdminSectionQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPicker } from "@/components/ui/icon-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type EducationEntry = {
  id: number;
  degree: string;
  institution: string;
  dateRange: string;
  focus: string;
  gpa: string;
  iconKey: string;
};

export default function EducationSection() {
  const { data, isLoading } = useGetAdminSection("education");
  const updateMutation = useUpdateAdminSection();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const entries: EducationEntry[] = (data?.data as EducationEntry[]) || [];
  
  const [editingItem, setEditingItem] = useState<EducationEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = (newEntries: EducationEntry[]) => {
    updateMutation.mutate(
      { section: "education", data: { data: newEntries } },
      {
        onSuccess: () => {
          toast({ title: "Education updated", description: "Changes saved successfully." });
          queryClient.invalidateQueries({ queryKey: getGetAdminSectionQueryKey("education") });
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
      degree: "",
      institution: "",
      dateRange: "",
      focus: "",
      gpa: "",
      iconKey: "graduation-cap"
    });
    setIsDialogOpen(true);
  };

  const openEdit = (item: EducationEntry) => {
    setEditingItem({ ...item });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this entry?")) {
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Education</h1>
          <p className="text-muted-foreground font-mono text-sm">Academic background and degrees.</p>
        </div>
        <Button onClick={openNew} className="font-mono uppercase tracking-wider">
          <Plus className="w-4 h-4 mr-2" /> Add Entry
        </Button>
      </div>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <Card className="border-dashed bg-muted/10">
            <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p className="font-mono text-sm mb-4">No education entries found</p>
              <Button variant="outline" onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add First</Button>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="group overflow-hidden transition-all hover:border-primary/50">
              <div className="flex items-stretch">
                <div className="bg-muted/30 w-8 flex items-center justify-center border-r">
                  <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                </div>
                <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{entry.degree}</h3>
                    <p className="text-muted-foreground text-sm font-medium">{entry.institution}</p>
                    <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground mt-1">
                      <span>{entry.dateRange}</span>
                      {entry.focus && (
                        <>
                          <span className="opacity-50">•</span>
                          <span>{entry.focus}</span>
                        </>
                      )}
                      {entry.gpa && (
                        <>
                          <span className="opacity-50">•</span>
                          <span>GPA: {entry.gpa}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={() => openEdit(entry)}>
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem?.id && entries.some(e => e.id === editingItem.id) ? "Edit Education" : "New Education"}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Degree / Certification</Label>
                <Input value={editingItem.degree} onChange={e => setEditingItem({...editingItem, degree: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Institution</Label>
                <Input value={editingItem.institution} onChange={e => setEditingItem({...editingItem, institution: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Input value={editingItem.dateRange} placeholder="e.g. 2018 - 2022" onChange={e => setEditingItem({...editingItem, dateRange: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>GPA (Optional)</Label>
                  <Input value={editingItem.gpa} onChange={e => setEditingItem({...editingItem, gpa: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Focus / Major (Optional)</Label>
                  <Input value={editingItem.focus} onChange={e => setEditingItem({...editingItem, focus: e.target.value})} />
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
              {updateMutation.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
