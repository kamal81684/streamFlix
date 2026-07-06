"use client";

import {
    createContext,
    useState,
    useRef,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
} from "react";
import { User, LoginRequest } from "@/types/auth.types";
import * as authApi from "@/services/auth.api";
import api from "@/lib/axios";

interface AuthContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    loading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<User>;
    logout: () => Promise<void>;
}

export const AuthContext =
    createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({
    children,
}: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const accessTokenRef = useRef<string | null>(null);

    useEffect(() => {
        const interceptor = api.interceptors.request.use((config) => {
            if (accessTokenRef.current) {
                config.headers.Authorization = `Bearer ${accessTokenRef.current}`;
            }
            return config;
        });
        return () => {
            api.interceptors.request.eject(interceptor);
        };
    }, []);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const response = await authApi.refreshToken();
                accessTokenRef.current = response.data.accessToken;
                const profileRes = await authApi.getProfile();
                setUser(profileRes.data.user);
            } catch {
                // Not authenticated
            } finally {
                setLoading(false);
            }
        };
        restoreSession();
    }, []);

    const login = useCallback(
        async (data: LoginRequest): Promise<User> => {
            const response = await authApi.login(data);
            const { user: userData, accessToken } = response.data;
            accessTokenRef.current = accessToken;
            setUser(userData);
            return userData;
        },
        []
    );

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            accessTokenRef.current = null;
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                isAuthenticated: !!user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};