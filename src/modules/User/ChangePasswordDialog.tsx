import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui";
import { PasswordInput } from '@/components/ui/password-input';
import { patch } from "@/services/apiService"; // Import the patch method
import { toast } from "sonner"; // Import toast for notifications
import Joi from "joi"; // Import Joi for validation

interface ChangePasswordDialogProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false); // State to track API call status

  // Joi schema for password validation
  const schema = Joi.object({
    newPassword: Joi.string().min(8).required().label("New Password"),
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .label("Confirm Password")
      .messages({ "any.only": "Passwords do not match!" }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords using Joi
    const { error } = schema.validate({ newPassword, confirmPassword });
    if (error) {
      toast.error(error.details[0].message);
      return;
    }

    try {
      setLoading(true); // Start loading
      await patch(`/users/${userId}/password`, {
        password: newPassword,
      });

      toast.success("Password changed successfully!");
      onClose(); // Close the dialog after success
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <PasswordInput
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full"
            />
            <PasswordInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;