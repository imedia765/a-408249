import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, Key, Shield } from "lucide-react";

const formSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberNumber: string;
  isFirstTimeLogin?: boolean;
}

const ChangePasswordDialog = ({
  open,
  onOpenChange,
  memberNumber,
  isFirstTimeLogin = false,
}: ChangePasswordDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Starting password change for member:", memberNumber);
    try {
      setIsSubmitting(true);

      const { error } = await supabase.rpc('handle_password_reset', {
        member_number: memberNumber,
        new_password: values.newPassword,
        ip_address: window.location.hostname,
        user_agent: navigator.userAgent,
        client_info: JSON.stringify({
          platform: navigator.platform,
          language: navigator.language,
          timestamp: new Date().toISOString()
        })
      });

      if (error) {
        console.error("Password change error:", error);
        toast.error(error.message || "Failed to change password");
        return;
      }

      console.log("Password changed successfully for member:", memberNumber);
      toast.success("Password changed successfully");
      form.reset();
      
      if (!isFirstTimeLogin) {
        onOpenChange(false);
      } else {
        window.location.reload();
      }

    } catch (error: any) {
      console.error("Error in password change:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isFirstTimeLogin ? undefined : onOpenChange}>
      <DialogContent className="w-full max-w-md bg-dashboard-card border border-dashboard-cardBorder">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-dashboard-accent1 flex items-center gap-2">
            <Key className="w-5 h-5" />
            {isFirstTimeLogin ? "Set New Password" : "Change Password"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 rounded-lg bg-dashboard-cardHover/50 border border-dashboard-cardBorder mb-4">
          <div className="flex items-center gap-2 text-dashboard-muted">
            <Shield className="w-4 h-4" />
            <span>Password must be at least 8 characters long</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isFirstTimeLogin && (
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-dashboard-text">Current Password</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password"
                        className="bg-dashboard-dark border-dashboard-cardBorder text-dashboard-text focus:border-dashboard-accent1" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dashboard-text">New Password</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="password"
                      className="bg-dashboard-dark border-dashboard-cardBorder text-dashboard-text focus:border-dashboard-accent1" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dashboard-text">Confirm Password</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="password"
                      className="bg-dashboard-dark border-dashboard-cardBorder text-dashboard-text focus:border-dashboard-accent1" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              {!isFirstTimeLogin && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="bg-dashboard-dark hover:bg-dashboard-cardHover hover:text-white border-dashboard-cardBorder transition-all duration-200"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#9b87f5] text-white hover:bg-[#7E69AB] transition-all duration-200"
              >
                {isSubmitting ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;