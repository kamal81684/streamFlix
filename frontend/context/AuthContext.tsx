"use client";

import {
    createContext,
    useState,
    ReactNode,
} from "react";
import { User } from "@/types/auth.types";

interface AuthContextType {
    user: User | null;

    setUser: React.Dispatch<
        React.SetStateAction<User | null>
    >;

    loading: boolean;

    isAuthenticated: boolean;
}

export const AuthContext =
    createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({
    children,
}: AuthProviderProps) => {

    const [user, setUser] =
        useState<User | null>(null);

    const [loading] =
        useState(false);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );

};