export interface IRespError {
  message?: string;
  [key: string]: any;
}
export interface ISuccessResp<TOK> {
  ok: TOK;
  error?: never;
}

export interface IErrorResp<TError = IRespError> {
  ok?: never;
  error: TError;
}

export type IResp<TOK = any, TError = IRespError> =
  | ISuccessResp<TOK>
  | IErrorResp<TError>;

export function rok<T>(ok: T): IResp<T> {
  return { ok };
}

export function rerm<TError = any>(
  message: string,
  anyErrorData: TError,
  errorCode?: string,
): IResp<any, TError> {
  return { error: { message, ...anyErrorData } };
}
