"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";

import { updateProfile, changePassword, uploadAvatar } from "@/services/user.api";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
});

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export type Section = "view" | "edit" | "password";

export function ViewProfile({
    user,
    onUpdate,
}: {
    user: { name: string; email: string; role: string; avatar?: string };
    onUpdate: (user: any) => void;
}) {
    const [file, setFile] = useState<File | null>(null);

    const handleUpload = async () => {
        if (!file) return;
        try {
            const response = await uploadAvatar(file);
            onUpdate(response.data.user);
            setFile(null);
            toast.success("Avatar updated");
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    {user.avatar ? (
                        <img
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${user.avatar}`}
                            alt="avatar"
                            className="h-20 w-20 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl font-bold text-gray-500">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setFile(e.target.files?.[0] ?? null)
                            }
                        />
                        <Button
                            size="sm"
                            onClick={handleUpload}
                            disabled={!file}
                        >
                            Upload
                        </Button>
                    </div>
                </div>
                <div>
                    <Label>Name</Label>
                    <p className="text-lg font-medium">{user.name}</p>
                </div>
                <div>
                    <Label>Email</Label>
                    <p className="text-lg font-medium">{user.email}</p>
                </div>
                <div>
                    <Label>Role</Label>
                    <p className="text-lg font-medium capitalize">{user.role}</p>
                </div>
            </CardContent>
        </Card>
    );
}

export function EditProfile({
    user,
    onUpdate,
}: {
    user: { name: string; email: string };
    onUpdate: (user: any) => void;
}) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: user.name },
    });

    const onSubmit = async (data: ProfileFormData) => {
        try {
            const response = await updateProfile(data);
            onUpdate(response.data.user);
            toast.success("Profile updated");
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your name and email</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label>Email</Label>
                        <p className="text-sm text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export function ChangePassword() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
    });

    const onSubmit = async (data: PasswordFormData) => {
        try {
            await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            toast.success("Password changed successfully");
            reset();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                    Enter your current password and a new password
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="currentPassword">
                            Current Password
                        </Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            {...register("currentPassword")}
                        />
                        {errors.currentPassword && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.currentPassword.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            {...register("newPassword")}
                        />
                        {errors.newPassword && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.newPassword.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="confirmPassword">
                            Confirm New Password
                        </Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Changing..." : "Change Password"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
