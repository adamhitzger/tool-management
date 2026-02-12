import { string } from "zod";

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
    organization_id: number;
}

export type Organization = {
    id: number;
    name: string;
    created_at?: number;
};

export interface ToolHistoryPayload {
  tool_id: number
  start: number
  end: number;
  obrobek_id: string
  korekce: string
  organization_id: number,
  type: string,
  machine_id: number
}