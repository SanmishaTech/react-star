import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LoaderCircle } from "lucide-react"; // Import the LoaderCircle icon
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { get, post, put } from "@/services/apiService";

type UserFormInputs = {
  name: string;
  email: string;
  password?: string;
  role: string;
  active: boolean;
};

const userFormSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Name is required",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email address",
    }),
  password: Joi.string().min(6).optional().messages({
    "string.min": "Password must be at least 6 characters long",
  }),
  role: Joi.string().required().messages({
    "string.empty": "Role is required",
  }),
  active: Joi.boolean().required(),
});

const UserForm = ({ mode }: { mode: "create" | "edit" }) => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<string[]>([]); // Roles fetched from API
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormInputs>({
    resolver: joiResolver(userFormSchema),
  });

  const active = watch("active");

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await get("/roles");
        const formattedRoles = Object.values(rolesData.roles); // Use only role values
        setRoles(formattedRoles);
      } catch (error: any) {
        toast.error("Failed to fetch roles");
      }
    };

    fetchRoles();
  }, []);

  // Fetch user data for edit mode
  useEffect(() => {
    if (mode === "edit" && id) {
      const fetchUser = async () => {
        setIsLoading(true);
        try {
          const user = await get(`/users/${id}`);
          setValue("name", user.name);
          setValue("email", user.email);
          setValue("role", user.role);
          setValue("active", user.active);
        } catch (error: any) {
          toast.error("Failed to fetch user details");
        } finally {
          setIsLoading(false);
        }
      };

      fetchUser();
    }
  }, [id, mode, setValue]);

  // Handle form submission
  const onSubmit: SubmitHandler<UserFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      if (mode === "create") {
        await post("/users", data);
        toast.success("User created successfully");
      } else {
        await put(`/users/${id}`, data);
        toast.success("User updated successfully");
      }
      navigate("/users");
    } catch (error: any) {
      toast.error("Failed to save user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto mt-10">
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name")}
            />
            {errors.name && (
              <span className="text-red-500 text-sm">{errors.name.message}</span>
            )}
          </div>

          {/* Email Field */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register("email")}
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email.message}</span>
            )}
          </div>

          {/* Password Field (Only for Create Mode) */}
          {mode === "create" && (
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter a secure password"
                {...register("password")}
              />
              {errors.password && (
                <span className="text-red-500 text-sm">{errors.password.message}</span>
              )}
            </div>
          )}

          {/* Role and Active Fields in the Same Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Role Dropdown */}
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={watch("role")} // Use value instead of defaultValue
                onValueChange={(value) => setValue("role", value)} // Update the form state
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <span className="text-red-500 text-sm">{errors.role.message}</span>
              )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={active}
                onCheckedChange={(checked) => setValue("active", checked)}
              />
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <LoaderCircle className="animate-spin h-4 w-4" />
                  Saving...
                </>
              ) : mode === "create" ? (
                "Create User"
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/users")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserForm;
