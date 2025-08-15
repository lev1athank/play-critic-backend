export interface UpdateUserProfileRequest {
    userId: string;
    descriptionProfile?: string;
    loveGame?: string;
    isCloseProfile?: boolean;
    avatar?: string;
}

export interface UpdateUserProfileResponse {
    message: string;
    userInfo: any;
} 