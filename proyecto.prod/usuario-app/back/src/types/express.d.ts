declare namespace Express {
  export interface Request {
    user?: {
      uid: number;
      email?: string;
      [key: string]: any;
    };
  }
}
