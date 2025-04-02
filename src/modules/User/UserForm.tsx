import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { get, post, put } from "@/services/apiService";

type UserFormInputs = {
  name: string;
  email: string;
  password?: string;
  role: string;
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
});

const UserForm = ({ mode }: { mode: "create" | "edit" }) => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserFormInputs>({
    resolver: joiResolver(userFormSchema),
  });

  useEffect(() => {
    if (mode === "edit" && id) {
      const fetchUser = async () => {
        setIsLoading(true);
        try {
          const user = await get(`/users/${id}`);
          setValue("name", user.name);
          setValue("email", user.email);
          setValue("role", user.role);
        } catch (error: any) {
          toast.error("Failed to fetch user");
        } finally {
          setIsLoading(false);
        }
      };

      fetchUser();
    }
  }, [id, mode, setValue]);

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
      <div className="grid gap-2">
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          type="text"
          placeholder="Enter user role (e.g., admin, user)"
          {...register("role")}
        />
        {errors.role && (
          <span className="text-red-500 text-sm">{errors.role.message}</span>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : mode === "create" ? "Create User" : "Save Changes"}
      </Button>
    </form>
  );
};

export default UserForm;