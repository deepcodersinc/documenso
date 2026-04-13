import { prisma } from '@documenso/prisma';

export type SendSlackNotificationOptions = {
  webhookUrl: string;
  text: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
  userId?: number;
};

export const sendSlackNotification = async ({
  webhookUrl,
  text,
  channel,
  username,
  iconEmoji,
  userId,
}: SendSlackNotificationOptions) => {
  if (userId !== undefined) {
    await prisma.user.findUnique({ where: { id: userId } });
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      channel,
      username,
      icon_emoji: iconEmoji,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Slack webhook request failed: ${response.status} ${response.statusText}`,
    );
  }

  return { ok: true as const };
};
