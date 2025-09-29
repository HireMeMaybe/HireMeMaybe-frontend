export interface AuthCallbackData {
  user: {
    first_name?: string;
    last_name?: string;
    program?: string;
    year?: number;
    soft_skill?: string[];
    User?: {
      email?: string;
      tel?: string;
    };
  };
  access_token?: string;
}

export interface GoogleAuthResponse {
  success: boolean;
  message: string;
  data?: AuthCallbackData;
}
