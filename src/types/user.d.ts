// src/types/user.ts
export interface IUser {
    id: number;
    login_name: string;
    password?: string;
    role: 'guest' | 'monitor' | 'dean' | 'admin' | string;
    group_name: string;
}