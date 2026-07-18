import { useState } from "react";
import { useGetAdminSection, useUpdateAdminSection, getGetAdminSectionQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GripVertical, Star, Link as LinkIcon, Github } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Project = {
  id: number;
  name: string;
  description: string;
  tech: string[];
  stars: number;
  liveUrl: string;
  githubUrl: string;
  iconKey: string;
  colorKey: string;
};

export default function ProjectsSection() {
  const { data, isLoading } = useGetAdminSection("projects");
  const updateMutation = useUpdateAdminSection();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const entries: Project[] = (data?.data as Project[]) || [];
  
  const [editingItem, setEditingItem] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [techInput, setTechInput] = useState("");

  const handleSave = (newEntries: Project[]) => {
    updateMutation.mutate(
      { section: "projects", data: { data: newEntries } },
      {
        onSuccess: () => {
          toast({ title: "Projects updated", description: "Changes saved successfully." });
          queryClient.invalidateQueries({ queryKey: getGetAdminSectionQueryKey("projects") });
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
      description: "",
      tech: [],
      stars: 0,
      liveUrl: "",
      githubUrl: "",
      iconKey: "Folder",
      colorKey: "blue"
    });
    setTechInput("");
    setIsDialogOpen(true);
  };

  const openEdit = (item: Project) => {
    setEditingItem({ ...item });
    setTechInput(item.tech.join(", "));
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      handleSave(entries.filter(e => e.id !== id));
    }
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Projects</h1>
          <p className="text-muted-foreground font-mono text-sm">Featured work and portfolio pieces.</p>
        </div>
        <Button onClick={openNew} className="font-mono uppercase tracking-wider">
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {entries.length === 0 ? (
          <Card className="col-span-full border-dashed bg-muted/10">
            <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p className="font-mono text-sm mb-4">No projects found</p>
              <Button variant="outline" onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Create First Project</Button>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="group overflow-hidden flex flex-col transition-all hover:border-primary/50 relative h-full">
              <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 backdrop-blur-sm shadow-sm rounded-md border p-1 z-10">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(entry)}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive" onClick={() => handleDelete(entry.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-xl leading-tight pr-12">{entry.name}</h3>
                </div>
                {entry.stars > 0 && (
                  <div className="flex items-center text-amber-500 text-xs font-mono mt-1">
                    <Star className="w-3 h-3 fill-current mr-1" /> {entry.stars} stars
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground text-sm flex-1">{entry.description}</p>
                
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {entry.tech.slice(0, 4).map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[10px] font-mono uppercase">
                        {t}
                      </span>
                    ))}
                    {entry.tech.length > 4 && (
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[10px] font-mono uppercase">
                        +{entry.tech.length - 4}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-mono">
                    {entry.liveUrl && (
                      <a href={entry.liveUrl} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center hover:underline">
                        <LinkIcon className="w-3 h-3 mr-1" /> Live Demo
                      </a>
                    )}
                    {entry.githubUrl && (
                      <a href={entry.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground flex items-center hover:underline">
                        <Github className="w-3 h-3 mr-1" /> Repository
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem?.id && entries.some(e => e.id === editingItem.id) ? "Edit Project" : "New Project"}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>GitHub Stars</Label>
                  <Input type="number" value={editingItem.stars} onChange={e => setEditingItem({...editingItem, stars: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={editingItem.description} rows={3} onChange={e => setEditingItem({...editingItem, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Technologies (comma separated)</Label>
                <Input value={techInput} placeholder="React, Node, Tailwind..." onChange={e => setTechInput(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Live URL</Label>
                  <Input value={editingItem.liveUrl} placeholder="https://" onChange={e => setEditingItem({...editingItem, liveUrl: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>GitHub URL</Label>
                  <Input value={editingItem.githubUrl} placeholder="https://github.com/..." onChange={e => setEditingItem({...editingItem, githubUrl: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon Key</Label>
                  <Input value={editingItem.iconKey} onChange={e => setEditingItem({...editingItem, iconKey: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Color Key</Label>
                  <Input value={editingItem.colorKey} placeholder="e.g. blue, amber, emerald" onChange={e => setEditingItem({...editingItem, colorKey: e.target.value})} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitDialog} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
