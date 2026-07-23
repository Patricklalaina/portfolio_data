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
import { IconPicker } from "@/components/ui/icon-picker";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader2, Save, Plus, Trash2, BarChart3 } from "lucide-react";

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
      contactMessage: "",
      socialLinks: [] as { id: number; platform: string; url: string; iconKey: string }[],
      contactInfo: [] as { id: number; label: string; value: string; url?: string | null; iconKey: string }[],
    }
  });

  const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({
    control: form.control,
    name: "socialLinks",
    keyName: "_fieldId",
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control: form.control,
    name: "contactInfo",
    keyName: "_fieldId",
  });

  useEffect(() => {
    if (data?.data) {
      const raw = data.data as any;
      form.reset({
        ...raw,
        socialLinks: Array.isArray(raw.socialLinks) ? raw.socialLinks : [],
        contactInfo: Array.isArray(raw.contactInfo) ? raw.contactInfo : [],
      });
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
              <CardTitle className="text-lg">Contact Section</CardTitle>
              <CardDescription>Shown above the contact form on the public site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Contact Message</Label>
                <Textarea
                  {...form.register("contactMessage")}
                  rows={4}
                  placeholder="I'm currently open to new opportunities. Whether you have a question, a project proposal, or just want to say hi, I'll try my best to get back to you!"
                />
                <p className="text-xs text-muted-foreground">Leave blank to use the default message.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed bg-muted/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Hero Stats
              </CardTitle>
              <CardDescription>
                Years of experience, project count, and certification count are calculated automatically
                from your Experience, Projects, and Certifications data — no need to edit them here.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Info</CardTitle>
              <CardDescription>Core identity fields. The Contact section below uses "Contact Info" instead.</CardDescription>
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
              <CardTitle className="text-lg">Contact Info</CardTitle>
              <CardDescription>
                The list of methods shown on the Contact section (Email, Phone, Location, or anything else).
                Managed independently from Social Links below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {contactFields.map((field, index) => (
                <div key={field._fieldId} className="space-y-2 p-3 border rounded-md bg-muted/20">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      className="flex-1 font-medium"
                      placeholder="Label (e.g. Email)"
                      {...form.register(`contactInfo.${index}.label` as const)}
                    />
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon" className="shrink-0 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      }
                      title="Remove this contact entry?"
                      description="This will remove it from your Contact section once you commit changes."
                      confirmLabel="Remove"
                      onConfirm={() => removeContact(index)}
                    />
                  </div>
                  <Input
                    placeholder="Display value (e.g. hello@example.com)"
                    {...form.register(`contactInfo.${index}.value` as const)}
                  />
                  <Input
                    placeholder="Link (optional, e.g. mailto:hello@example.com)"
                    {...form.register(`contactInfo.${index}.url` as const)}
                  />
                  <IconPicker
                    value={form.watch(`contactInfo.${index}.iconKey` as const)}
                    onChange={(value) => form.setValue(`contactInfo.${index}.iconKey` as const, value, { shouldDirty: true })}
                    placeholder="Choose icon"
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendContact({ id: Date.now(), label: "", value: "", url: "", iconKey: "mail" })}
                className="w-full font-mono text-xs"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Contact Entry
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social Links</CardTitle>
              <CardDescription>Shown in the hero and footer. Add as many as you like.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {socialFields.map((field, index) => (
                <div key={field._fieldId} className="space-y-2 p-3 border rounded-md bg-muted/20">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      className="flex-1 font-medium"
                      placeholder="Platform (e.g. GitHub)"
                      {...form.register(`socialLinks.${index}.platform` as const)}
                    />
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon" className="shrink-0 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      }
                      title="Remove this social link?"
                      description="This will remove it from your profile once you commit changes."
                      confirmLabel="Remove"
                      onConfirm={() => removeSocial(index)}
                    />
                  </div>
                  <Input
                    placeholder="https://…"
                    {...form.register(`socialLinks.${index}.url` as const)}
                  />
                  <IconPicker
                    value={form.watch(`socialLinks.${index}.iconKey` as const)}
                    onChange={(value) => form.setValue(`socialLinks.${index}.iconKey` as const, value, { shouldDirty: true })}
                    placeholder="Choose icon"
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendSocial({ id: Date.now(), platform: "", url: "", iconKey: "link" })}
                className="w-full font-mono text-xs"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Social Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
