import { useState, useEffect } from "react";
import { useGetAdminSection, useUpdateAdminSection, getGetAdminSectionQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPicker } from "@/components/ui/icon-picker";

type SkillItem = {
  name: string;
  level: number;
};

type SkillCategory = {
  title: string;
  iconKey: string;
  skills: SkillItem[];
};

type SkillsData = {
  categories: SkillCategory[];
  secondary: string[];
};

export default function SkillsSection() {
  const { data, isLoading } = useGetAdminSection("skills");
  const updateMutation = useUpdateAdminSection();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<SkillsData>({
    categories: [],
    secondary: []
  });
  
  const [secondaryInput, setSecondaryInput] = useState("");

  useEffect(() => {
    if (data?.data) {
      const skills = data.data as SkillsData;
      setFormData(skills);
      setSecondaryInput(skills.secondary?.join(", ") || "");
    }
  }, [data]);

  const handleSave = () => {
    const secondary = secondaryInput.split(",").map(s => s.trim()).filter(Boolean);
    const updatedData = { ...formData, secondary };
    
    updateMutation.mutate(
      { section: "skills", data: { data: updatedData } },
      {
        onSuccess: () => {
          toast({ title: "Skills updated", description: "Changes saved successfully." });
          queryClient.invalidateQueries({ queryKey: getGetAdminSectionQueryKey("skills") });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to save data.", variant: "destructive" });
        }
      }
    );
  };

  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [
        ...formData.categories,
        { title: "New Category", iconKey: "code", skills: [] }
      ]
    });
  };

  const updateCategory = (index: number, field: string, value: string) => {
    const newCategories = [...formData.categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setFormData({ ...formData, categories: newCategories });
  };

  const removeCategory = (index: number) => {
    const newCategories = [...formData.categories];
    newCategories.splice(index, 1);
    setFormData({ ...formData, categories: newCategories });
  };

  const addSkill = (catIndex: number) => {
    const newCategories = [...formData.categories];
    newCategories[catIndex].skills.push({ name: "", level: 80 });
    setFormData({ ...formData, categories: newCategories });
  };

  const updateSkill = (catIndex: number, skillIndex: number, field: string, value: any) => {
    const newCategories = [...formData.categories];
    newCategories[catIndex].skills[skillIndex] = { 
      ...newCategories[catIndex].skills[skillIndex], 
      [field]: field === 'level' ? parseInt(value) || 0 : value 
    };
    setFormData({ ...formData, categories: newCategories });
  };

  const removeSkill = (catIndex: number, skillIndex: number) => {
    const newCategories = [...formData.categories];
    newCategories[catIndex].skills.splice(skillIndex, 1);
    setFormData({ ...formData, categories: newCategories });
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-[500px] w-full" /></div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Skills</h1>
          <p className="text-muted-foreground font-mono text-sm">Manage core competencies and tools.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={updateMutation.isPending}
          className="font-mono uppercase tracking-wider"
        >
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Commit Changes
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Skill Categories</CardTitle>
            <CardDescription>Primary skill groups displayed with proficiency levels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.categories.map((category, catIndex) => (
              <div key={catIndex} className="p-5 border rounded-lg bg-card/50 relative group">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-opacity"
                  onClick={() => removeCategory(catIndex)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                
                <div className="grid grid-cols-2 gap-4 mb-4 pr-10">
                  <div className="space-y-2">
                    <Label className="text-xs font-mono uppercase text-muted-foreground">Category Title</Label>
                    <Input value={category.title} onChange={e => updateCategory(catIndex, "title", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-mono uppercase text-muted-foreground">Icon</Label>
                    <IconPicker
                      value={category.iconKey}
                      onChange={(value) => updateCategory(catIndex, "iconKey", value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-mono uppercase text-muted-foreground">Skills inside {category.title}</Label>
                  
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex} className="flex items-center gap-3">
                      <div className="flex-1">
                        <Input 
                          placeholder="Skill Name" 
                          value={skill.name} 
                          onChange={e => updateSkill(catIndex, skillIndex, "name", e.target.value)} 
                        />
                      </div>
                      <div className="w-24">
                        <Input 
                          type="number" 
                          min="0" max="100" 
                          placeholder="Level" 
                          value={skill.level} 
                          onChange={e => updateSkill(catIndex, skillIndex, "level", e.target.value)} 
                        />
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeSkill(catIndex, skillIndex)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button variant="outline" size="sm" onClick={() => addSkill(catIndex)} className="font-mono text-xs w-full">
                    <Plus className="w-3 h-3 mr-2" /> Add Skill
                  </Button>
                </div>
              </div>
            ))}
            
            <Button variant="secondary" onClick={addCategory} className="w-full font-mono border-dashed border-2">
              <Plus className="w-4 h-4 mr-2" /> Add New Category
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Secondary Skills / Tools</CardTitle>
            <CardDescription>A flat list of tags displayed below main categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input 
                value={secondaryInput} 
                onChange={e => setSecondaryInput(e.target.value)} 
                placeholder="Git, Docker, CI/CD, Agile..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
