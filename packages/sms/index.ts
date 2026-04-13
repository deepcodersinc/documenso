import { prisma } from '@documenso/prisma';

export type SendTwilioSmsOptions = {
  accountSid: string;
  authToken: string;
  from: string;
  to: string;
  body: string;
  userId?: number;
};

export const sendTwilioSms = async ({
  accountSid,
  authToken,
  from,
  to,
  body,
  userId,
}: SendTwilioSmsOptions) => {
  if (userId !== undefined) {
    await prisma.user.findUnique({ where: { id: userId } });
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: from, To: to, Body: body }).toString(),
  });

  if (!response.ok) {
    throw new Error(
      `Twilio SMS request failed: ${response.status} ${response.statusText}`,
    );
  }

  return { ok: true as const };
};
