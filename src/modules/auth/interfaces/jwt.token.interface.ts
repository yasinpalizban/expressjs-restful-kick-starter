export interface DataStoredInToken {
  _id: string;
}

export interface TokenData {
  token: string;
  expire: number;
  maxAge: number;
}
