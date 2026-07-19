import { useState } from "react";
import { useGetAdminSection, useUpdateAdminSection, getGetAdminSectionQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDateRange } from "@/lib/date-utils";

type ExperienceEntry = {
  id: number;
  role: string;
  company: string;
  startDate: string;
  endDate: string | null;
  employmentType: string;
  description: string;
  tech: string[];
};

export default function ExperienceSection() {
  const { data, isLoading } = useGetAdminSection("experience");
  const updateMutation = useUpdateAdminSection();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const entries: ExperienceEntry[] = (data?.data as ExperienceEntry[]) || [];
  
  const [editingItem, setEditingItem] = useState<ExperienceEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [techInput, setTechInput] = useState("");

  const handleSave = (newEntries: ExperienceEntry[]) => {
    updateMutation.mutate(
      { section: "experience", data: { data: newEntries } },
      {
        onSuccess: () => {
          toast({ title: "Experience updated", description: "Changes saved successfully." });
          queryClient.invalidateQueries({ queryKey: getGetAdminSectionQueryKey("experience") });
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
      role: "",
      company: "",
      startDate: "",
      endDate: null,
      employmentType: "Full-time",
      description: "",
      tech: []
    });
    setTechInput("");
    setIsDialogOpen(true);
  };

  const openEdit = (item: ExperienceEntry) => {
    setEditingItem({ ...item });
    setTechInput(item.tech.join(", "));
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    handleSave(entries.filter(e => e.id !== id));
  };

  const submitDialog = () => {
    if (!editingItem) return;
    
    const processedTech = techInput.split(",").map(t => t.trim()).filter(Boolean);
    const updatedItem = { ...editingItem, tech: processedTech };
    
    let newEntries;
    if (entries.some(e => e.id === updatedItem.id)) {
      newEntries = entries.map(e => e.id === updatedItem.id ? updatedItem : e);
    } else {
      newEntries = [updatedItem, ...entries];
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Experience</h1>
          <p className="text-muted-foreground font-mono text-sm">Work history and roles.</p>
        </div>
        <Button onClick={openNew} className="font-mono uppercase tracking-wider">
          <Plus className="w-4 h-4 mr-2" /> Add Entry
        </Button>
      </div>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <Card className="border-dashed bg-muted/10">
            <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p className="font-mono text-sm mb-4">No experience entries found</p>
              <Button variant="outline" onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Create First Entry</Button>
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{entry.role}</h3>
                      <Badge variant="secondary" className="font-mono text-[10px] uppercase">{entry.employmentType}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">{entry.company}</p>
                    <p className="text-muted-foreground font-mono text-xs">{formatDateRange(entry.startDate, entry.endDate)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={() => openEdit(entry)}>
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      }
                      title="Delete this entry?"
                      description={<>This will permanently remove <strong>{entry.role}</strong> at {entry.company}. This action cannot be undone.</>}
                      onConfirm={() => handleDelete(entry.id)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem?.id && entries.some(e => e.id === editingItem.id) ? "Edit Entry" : "New Entry"}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role Title</Label>
                  <Input value={editingItem.role} onChange={e => setEditingItem({...editingItem, role: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={editingItem.company} onChange={e => setEditingItem({...editingItem, company: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="month"
                    value={editingItem.startDate}
                    onChange={e => setEditingItem({...editingItem, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={editingItem.endDate ?? ""}
                    disabled={editingItem.endDate === null}
                    onChange={e => setEditingItem({...editingItem, endDate: e.target.value})}
                  />
                  <label className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <Checkbox
                      checked={editingItem.endDate === null}
                      onCheckedChange={(checked) => setEditingItem({...editingItem, endDate: checked ? null : ""})}
                    />
                    Currently working here (Present)
                  </label>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Employment Type</Label>
                  <Input value={editingItem.employmentType} placeholder="e.g. Full-time, Contract" onChange={e => setEditingItem({...editingItem, employmentType: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={editingItem.description} rows={4} onChange={e => setEditingItem({...editingItem, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Technologies (comma separated)</Label>
                <Input value={techInput} placeholder="React, TypeScript, Node.js" onChange={e => setTechInput(e.target.value)} />
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
