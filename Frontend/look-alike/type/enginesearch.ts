export interface PlayApp {
    app_name: string;
    package: string;
    developer: string;
    developer_id: string;
    developer_email: string;
    score: number;
    ratings: number;
    installs: string;
    genre: string;
    description: string;
    icon: string;
    version: string;
    updated: number;
    android_version?: string;
    content_rating?: string;
    released?: string;
    permissions?: string[];
    source: string;
}

export interface LookalikeResult {
    app_name: string;
    link: string;
    source: string;
    risk_score: number;
    similarity: number;
    reasons: string[];
    is_suspicious: boolean;
    package?: string;
    developer?: string;
    sha256?: string;
    icon?: string;
    version?: string;
    score?: number;
    installs?: string;
    updated?: number | string;
    appid?: string;
    md5?: string;
    released?: string;
    is_official?: boolean;
}