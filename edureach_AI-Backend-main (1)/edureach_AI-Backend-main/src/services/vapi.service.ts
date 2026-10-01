// ============================================
// PURPOSE: Handle Vapi API calls for outbound calling
// ============================================

interface CallPayload {
  phoneNumber: string;
  userName: string;
  userEmail: string;
  preferredCourse?: string;
  queryTopic?: string;
}

interface VapiCallResponse {
  id: string;
  status: string;
  [key: string]: unknown;
}

export const initiateOutboundCall = async (
  payload: CallPayload
): Promise<VapiCallResponse> => {
  const {
    phoneNumber,
    userName,
    userEmail,
    preferredCourse,
    queryTopic,
  } = payload;

  const VAPI_API_KEY = process.env.VAPI_API_KEY;
  const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID;
  const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;

  if (!VAPI_API_KEY || !VAPI_PHONE_NUMBER_ID || !VAPI_ASSISTANT_ID) {
    throw new Error(
      "Vapi configuration missing. Check VAPI_API_KEY, VAPI_PHONE_NUMBER_ID, VAPI_ASSISTANT_ID in .env"
    );
  }

  // Format Indian number
  const formattedPhone = phoneNumber.startsWith("+")
    ? phoneNumber
    : `+91${phoneNumber.replace(/^0+/, "")}`;

  console.log("========== VAPI REQUEST ==========");
  console.log("Phone:", formattedPhone);
  console.log("User:", userName);
  console.log(
    "API Key:",
    VAPI_API_KEY.substring(0, 8) + "..."
  );
  console.log("Assistant ID:", VAPI_ASSISTANT_ID);
  console.log("Phone Number ID:", VAPI_PHONE_NUMBER_ID);

  const response = await fetch("https://api.vapi.ai/call", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assistantId: VAPI_ASSISTANT_ID,

      phoneNumberId: VAPI_PHONE_NUMBER_ID,

      customer: {
        number: formattedPhone,
        name: userName,
      },

      assistantOverrides: {
        firstMessage: `Hi ${userName}, this is Ava from EduReach College. I'm calling to help you with information about ${
          preferredCourse || "our programs"
        }. Do you have a quick moment?`,

        variableValues: {
          studentName: userName,
          studentEmail: userEmail,
          preferredCourse: preferredCourse || "Not specified",
          queryTopic: queryTopic || "General inquiry",
        },
      },
    }),
  });

  const responseText = await response.text();

  console.log("========== VAPI RESPONSE ==========");
  console.log("Status:", response.status);
  console.log("Body:", responseText);

  if (!response.ok) {
    throw new Error(
      `Vapi call failed with status ${response.status}: ${responseText}`
    );
  }

  const data = JSON.parse(responseText) as VapiCallResponse;

  return data;
};