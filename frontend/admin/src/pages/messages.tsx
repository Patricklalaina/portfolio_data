import { useListAdminMessages, useDeleteAdminMessage, getListAdminMessagesQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Trash2, Mail, Calendar, User, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Messages() {
  const { data: messages, isLoading } = useListAdminMessages();
  const deleteMutation = useDeleteAdminMessage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({
            title: "Message Deleted",
            description: "The message has been permanently removed.",
          });
          queryClient.invalidateQueries({ queryKey: getListAdminMessagesQueryKey() });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete message.",
            variant: "destructive",
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="border rounded-lg p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Inbox</h1>
        <p className="text-muted-foreground font-mono text-sm">Contact form submissions from portfolio.</p>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[150px] font-mono text-xs uppercase tracking-wider"><div className="flex items-center gap-2"><Calendar className="w-3 h-3"/> Date</div></TableHead>
              <TableHead className="w-[200px] font-mono text-xs uppercase tracking-wider"><div className="flex items-center gap-2"><User className="w-3 h-3"/> Sender</div></TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider"><div className="flex items-center gap-2"><AlignLeft className="w-3 h-3"/> Message</div></TableHead>
              <TableHead className="w-[80px] text-right font-mono text-xs uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!messages || messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Mail className="w-8 h-8 mb-2 opacity-20" />
                    <p className="font-mono text-sm">Inbox is empty</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              messages.map((msg) => (
                <TableRow key={msg.id} className="group">
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(msg.createdAt), 'yyyy-MM-dd HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{msg.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{msg.email}</div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete message?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove the message from {msg.name}. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(msg.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
