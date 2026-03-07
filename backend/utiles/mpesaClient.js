const randomId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

const normalizePhoneToE164 = (phoneNumber) => {
  const digits = String(phoneNumber || "").replace(/\D/g, "");

  if (digits.startsWith("251") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+251${digits.slice(1)}`;
  if (digits.startsWith("7") && digits.length === 9) return `+251${digits}`;

  return null;
};

const isMockEnabled = () => {
  const raw = String(process.env.MPESA_MOCK_MODE || "true").toLowerCase();
  return raw !== "false";
};

const initiateStkPush = async ({ amount, phoneNumber, reference, description }) => {
  const e164Phone = normalizePhoneToE164(phoneNumber);
  if (!e164Phone) {
    const error = new Error("Invalid Ethiopian phone number");
    error.statusCode = 400;
    throw error;
  }

  if (isMockEnabled()) {
    return {
      provider: "mock",
      success: true,
      merchantRequestId: randomId("MR"),
      checkoutRequestId: randomId("CR"),
      customerMessage: "Mock STK request sent",
      raw: {
        amount,
        phoneNumber: e164Phone,
        reference,
        description,
      },
    };
  }

  const endpoint = process.env.MPESA_STK_PUSH_URL;
  const token = process.env.MPESA_ACCESS_TOKEN;
  const shortCode = process.env.MPESA_SHORT_CODE;

  if (!endpoint || !token || !shortCode) {
    const error = new Error("Missing live M-Pesa configuration. Set MPESA_STK_PUSH_URL, MPESA_ACCESS_TOKEN, MPESA_SHORT_CODE.");
    error.statusCode = 500;
    throw error;
  }

  const payload = {
    BusinessShortCode: shortCode,
    Amount: Number(amount),
    PartyA: e164Phone,
    PartyB: shortCode,
    PhoneNumber: e164Phone,
    AccountReference: reference,
    TransactionDesc: description,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.errorMessage || "Failed to initiate M-Pesa payment");
    error.statusCode = 502;
    throw error;
  }

  return {
    provider: "live",
    success: true,
    merchantRequestId: data.MerchantRequestID || data.merchantRequestId || randomId("MR"),
    checkoutRequestId: data.CheckoutRequestID || data.checkoutRequestId || randomId("CR"),
    customerMessage: data.CustomerMessage || "Request sent to your phone",
    raw: data,
  };
};

module.exports = {
  normalizePhoneToE164,
  initiateStkPush,
  isMockEnabled,
};
