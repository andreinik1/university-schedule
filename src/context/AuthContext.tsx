import { createContext } from 'react';

type Role = 'guest' | 'monitor' | 'dean' | null;

interface User {
    role: Role;
    username: string;
    group?: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => boolean;
    loginAsGuest: () => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export type { AuthContextType, User, Role };