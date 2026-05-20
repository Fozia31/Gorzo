const crypto = require("crypto");

const normalizePhoneNumber = (input) => {
	const digits = String(input || "").replace(/\D/g, "");
	if (/^251[79]\d{8}$/.test(digits)) return `+${digits}`;
	if (/^0[79]\d{8}$/.test(digits)) return `+251${digits.slice(1)}`;
	if (/^[79]\d{8}$/.test(digits)) return `+251${digits}`;
	return null;
};

const generateExternalReference = () => {
	const stamp = Date.now();
	const token = crypto.randomBytes(4).toString("hex");
	return `GORZO-${stamp}-${token}`;
};

const toMpesaTimestamp = () => {
	const now = new Date();
	const yyyy = now.getUTCFullYear().toString();
	const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
	const dd = String(now.getUTCDate()).padStart(2, "0");
	const hh = String(now.getUTCHours()).padStart(2, "0");
	const mi = String(now.getUTCMinutes()).padStart(2, "0");
	const ss = String(now.getUTCSeconds()).padStart(2, "0");
	return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
};

const buildPassword = ({ shortcode, passkey, timestamp }) => {
	return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
};

const ensureConfig = () => {
	const required = [
		"MPESA_CONSUMER_KEY",
		"MPESA_CONSUMER_SECRET",
		"MPESA_SHORTCODE",
		"MPESA_PASSKEY",
		"MPESA_CALLBACK_URL",
		"MPESA_TOKEN_URL",
		"MPESA_STK_PUSH_URL",
	];
	const missing = required.filter((key) => !process.env[key]);
	if (missing.length > 0) {
		throw new Error(`Missing M-Pesa config: ${missing.join(", ")}`);
	}
};

const fetchMpesaAccessToken = async () => {
	ensureConfig();
	const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");

	const response = await fetch(process.env.MPESA_TOKEN_URL, {
		method: "GET",
		headers: {
			Authorization: `Basic ${auth}`,
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Failed to fetch M-Pesa token (${response.status}): ${body}`);
	}

	const json = await response.json();
	const accessToken = json.access_token || json.accessToken;
	if (!accessToken) {
		throw new Error("M-Pesa token response missing access token");
	}

	return accessToken;
};

const initiateStkPush = async ({ amount, phoneNumber, externalReference }) => {
	const accessToken = await fetchMpesaAccessToken();
	const timestamp = toMpesaTimestamp();
	const shortcode = process.env.MPESA_SHORTCODE;
	const passkey = process.env.MPESA_PASSKEY;

	const payload = {
		BusinessShortCode: shortcode,
		Password: buildPassword({ shortcode, passkey, timestamp }),
		Timestamp: timestamp,
		TransactionType: process.env.MPESA_TRANSACTION_TYPE || "CustomerPayBillOnline",
		Amount: Number(amount),
		PartyA: phoneNumber.replace("+", ""),
		PartyB: shortcode,
		PhoneNumber: phoneNumber.replace("+", ""),
		CallBackURL: process.env.MPESA_CALLBACK_URL,
		AccountReference: externalReference,
		TransactionDesc: "Gorzo doctor consultation payment",
	};

	const response = await fetch(process.env.MPESA_STK_PUSH_URL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify(payload),
	});

	const json = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(`Failed to initiate STK push (${response.status}): ${JSON.stringify(json)}`);
	}

	return { requestPayload: payload, responsePayload: json };
};

const parseCallbackPayload = (payload) => {
	const stk = payload?.Body?.stkCallback || payload?.stkCallback || payload;
	const metaItems = stk?.CallbackMetadata?.Item || [];
	const meta = {};

	for (const item of metaItems) {
		if (item?.Name) {
			meta[item.Name] = item?.Value;
		}
	}

	return {
		merchantRequestId: stk?.MerchantRequestID || stk?.MerchantRequestId || "",
		checkoutRequestId: stk?.CheckoutRequestID || stk?.CheckoutRequestId || "",
		resultCode: Number(stk?.ResultCode ?? -1),
		resultDescription: stk?.ResultDesc || stk?.ResultDescription || "",
		meta,
	};
};

module.exports = {
	normalizePhoneNumber,
	generateExternalReference,
	initiateStkPush,
	parseCallbackPayload,
};
