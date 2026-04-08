export async function registerForPushNotifications() {
  return {
    granted: false,
    token: null as string | null,
  };
}

export async function scheduleLocalNotification(title: string, body: string) {
  return {
    id: `local-${Date.now()}`,
    title,
    body,
  };
}
