import { useCallback, useState } from "react";

type Fn<TArgs extends any[], TResult> = (...args: TArgs) => Promise<TResult>;

export function useApi<TArgs extends any[], TResult>(fn: Fn<TArgs, TResult>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const call = useCallback(async (...args: TArgs) => {
    setLoading(true);
    setError(undefined);
    try {
      const res = await fn(...args);
      return res;
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Error desconocido";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { call, loading, error, setError };
}
