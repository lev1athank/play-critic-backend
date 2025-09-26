export interface UpdateUserProfileRequest {
    userId: string;
    userName?: string;
    descriptionProfile?: string;
    loveGame?: number[];
    isCloseProfile?: boolean;
    avatar?: File;
}

export interface UpdateUserProfileResponse {
    message: string;
    userInfo: any;
} 