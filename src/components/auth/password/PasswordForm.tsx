import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const formSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface PasswordFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  isSubmitting: boolean;
  isFirstTimeLogin: boolean;
  onCancel: () => void;
}

export const PasswordForm = ({
  onSubmit,
  isSubmitting,
  isFirstTimeLogin,
  onCancel,
}: PasswordFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  return (
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
              onClick={onCancel}
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
  );
};