import { useEffect } from "react";
import { useGetAdminSection, useUpdateAdminSection, getGetAdminSectionQueryKey } from "@workspace/api-client-react";
import { useForm, useFieldArray } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

export default function ProfileSection() {
  const { data, isLoading } = useGetAdminSection("profile");
  const updateMutation = useUpdateAdminSection();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
      initials: "",
      role: "",
      tagline: "",
      bio: "",
      location: "",
      availableForWork: false,
      email: "",
      phone: "",
      resumeUrl: "",
      socialLinks: { github: "", linkedin: "", twitter: "" },
      stats: [] as { iconKey: string; label: string }[]
    }
  });

  const { fields: statFields, append: appendStat, remove: removeStat } = useFieldArray({
    control: form.control,
    name: "stats"
  });

  useEffect(() => {
    if (data?.data) {
      form.reset(data.data as any);
    }
  }, [data, form]);

  const onSubmit = (values: any) => {
    updateMutation.mutate(
      { section: "profile", data: { data: values } },
      {
        onSuccess: () => {
          toast({ title: "Profile updated", description: "Changes saved successfully." });
          queryClient.invalidateQueries({ queryKey: getGetAdminSectionQueryKey("profile") });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
          <p className="text-muted-foreground font-mono text-sm">Manage core identity and contact details.</p>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={updateMutation.isPending || !form.formState.isDirty}
          className="font-mono uppercase tracking-wider"
        >
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Commit Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Primary Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input {...form.register("name")} />
                </div>
                <div className="space-y-2">
                  <Label>Initials</Label>
                  <Input {...form.register("initials")} maxLength={3} className="uppercase" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input {...form.register("role")} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input {...form.register("location")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input {...form.register("tagline")} />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea {...form.register("bio")} rows={5} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stats</CardTitle>
              <CardDescription>Key metrics shown in the hero section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {statFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md bg-muted/20">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Icon Key (Lucide)</Label>
                    <Input {...form.register(`stats.${index}.iconKey` as const)} placeholder="e.g. Code2" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Label</Label>
                    <Input {...form.register(`stats.${index}.label` as const)} placeholder="e.g. 5+ Years Exp" />
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeStat(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendStat({ iconKey: "", label: "" })} className="w-full font-mono text-xs">
                <Plus className="w-4 h-4 mr-2" /> Add Stat
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                <div className="space-y-0.5">
                  <Label>Available for Work</Label>
                  <div className="text-xs text-muted-foreground font-mono">Shows open to work badge</div>
                </div>
                <Switch 
                  checked={form.watch("availableForWork")} 
                  onCheckedChange={(c) => form.setValue("availableForWork", c, { shouldDirty: true })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input {...form.register("email")} type="email" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...form.register("phone")} />
              </div>
              <div className="space-y-2">
                <Label>Resume URL</Label>
                <Input {...form.register("resumeUrl")} placeholder="https://" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input {...form.register("socialLinks.github")} placeholder="https://github.com/..." />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input {...form.register("socialLinks.linkedin")} placeholder="https://linkedin.com/in/..." />
              </div>
              <div className="space-y-2">
                <Label>Twitter / X URL</Label>
                <Input {...form.register("socialLinks.twitter")} placeholder="https://x.com/..." />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
