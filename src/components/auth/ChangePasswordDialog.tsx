import { useState } from "react";
import { Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PasswordForm } from "./password/PasswordForm";
import { PasswordRequirements } from "./password/PasswordRequirements";

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

  const handleSubmit = async (values: any) => {
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

        <PasswordRequirements />
        
        <PasswordForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isFirstTimeLogin={isFirstTimeLogin}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;