"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    ViewProfile,
    EditProfile,
    ChangePassword,
    Section,
} from "@/components/profile/ProfileContent";

export default function UserProfile() {
    const { user, setUser, logout } = useAuth();
    const router = useRouter();
    const [section, setSection] = useState<Section>("view");

    if (!user) return null;

    const handleLogout = async () => {
        await logout();
        router.push("/auth/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Profile</h1>
                    <Button variant="destructive" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={section === "view" ? "default" : "outline"}
                        onClick={() => setSection("view")}
                    >
                        View Profile
                    </Button>
                    <Button
                        variant={section === "edit" ? "default" : "outline"}
                        onClick={() => setSection("edit")}
                    >
                        Edit Profile
                    </Button>
                    <Button
                        variant={section === "password" ? "default" : "outline"}
                        onClick={() => setSection("password")}
                    >
                        Change Password
                    </Button>
                </div>

                {section === "view" && (
                    <ViewProfile
                        user={user}
                        onUpdate={(updated) => setUser(updated)}
                    />
                )}
                {section === "edit" && (
                    <EditProfile
                        user={user}
                        onUpdate={(updated) => setUser(updated)}
                    />
                )}
                {section === "password" && <ChangePassword />}
            </div>
        </div>
    );
}
