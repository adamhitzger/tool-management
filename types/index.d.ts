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

export type Obrobek = {
    id: number;
    obrobek_id: string;
}

export interface ToolHistoryPayload {
  tool_id: string
  start: number
  end: number;
  obrobek_id: string
  korekce: string
  type: string,
  machine_id: number
}
