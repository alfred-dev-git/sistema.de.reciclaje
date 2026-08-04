import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getToken } from "@/services/api/http";
import { refreshCurrentUser } from "@/services/api/auth";

export default function Index() {
  const [destination, setDestination] = useState<"/(app)/home" | "/(auth)/login" | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) return setDestination("/(auth)/login");
      try {
        await refreshCurrentUser();
        setDestination("/(app)/home");
      } catch {
        setDestination("/(auth)/login");
      }
    })();
  }, []);

  if (!destination) return null;
  return <Redirect href={destination} />;
}
