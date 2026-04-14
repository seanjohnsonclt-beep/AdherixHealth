import twilio from 'twilio';

let client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return client;
}

export type SendArgs = {
  to: string;
  from?: string;
  body: string;
};

export type SendResult = {
  sid: string;
  status: string;
};

export async function sendSms({ to, from, body }: SendArgs): Promise<SendResult> {
  const fromNumber = from || process.env.TWILIO_DEFAULT_FROM!;
  const msg = await getClient().messages.create({
    to,
    from: fromNumber,
    body,
    statusCallback: `${process.env.APP_URL}/api/twilio/status`,
  });
  return { sid: msg.sid, status: msg.status };
}
