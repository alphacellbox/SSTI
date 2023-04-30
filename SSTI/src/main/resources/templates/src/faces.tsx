export interface LoginFaceReq {
    username: string;
    password: string;
    rik: number;
}

export interface LoginFaceRes {
    token: string;
    rik: number;
    expire: string;
}

export interface Response<T> {
    status: string;
    message: string;
    timestamp: number;
    body: T;
}