export interface ActionResponse<T> {
    success: boolean;
    message: string;
    submitted: boolean;
    errors?: {
        [K in keyof T]?: string[];
    };
    inputs?: T;
}

export type User = {
    id: number;
    name: string | null;
    surname: string | null;
    email: string;
    role: string;
}