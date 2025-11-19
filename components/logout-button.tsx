'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // 1. Clear sid cookie (your auth session)
    document.cookie = "sid=; Max-Age=0; path=/;";

    // 2. Show confirmation toast
    notifications.show({
      title: "Logged out",
      message: "You have been successfully logged out.",
    });

    // 3. Redirect to login and replace history so Back doesn’t go back to protected page
    router.replace("/auth/login");
  };

  return (
    <Button variant="default" size="sm" onClick={handleLogout}>
      Logout
    </Button>
  );
}
