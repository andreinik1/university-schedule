import { createContext } from 'react';

export type Role = 'guest' | 'monitor' | 'dean' | 'admin' | 'scientific_dept' | null;

export interface User {
    role: Role;
    username: string;
    group?: string;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    loginAsGuest: () => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);