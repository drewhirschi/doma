import { useEffect, useState } from "react";

import { PostgrestBuilder } from "@supabase/postgrest-js";
import { PostgrestError } from "@supabase/supabase-js";

export function useSBFetch<T>(fn: () => PostgrestBuilder<T>, deps: any[] = []) {
  const [data, setData] = useState<null | T>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | PostgrestError>(null);

  useEffect(() => {
    refetch();
  }, deps);

  const refetch = () => {
    setLoading(true);
    fn().then((d) => {
      if (d.error) {
        setError(d.error);
      } else {
        setData(d.data);
      }
      setLoading(false);
    });
  };

  // const abort = () => {
  //     setLoading(false);
  //     setError(new Error('Aborted'));
  // };

  return {
    data,
    loading,
    error,
    refetch,
    // abort
  };
}
