export const parseLoginError = (error) => {
  if (!error.response) {
    return { type: "network", message: "Network error" };
  }

  const status = error.response.status;
  const message = (
    error.response.data?.message ||
    error.response.data?.error ||
    error.response.data?.code ||
    ""
  ).toLowerCase();

  if (
    status === 400 ||
    status === 401 ||
    message.includes("invalid_credentials")
  ) {
    return { type: "auth", message };
  }

  if (message.includes("email_not_confirmed")) {
    return { type: "unverified", message };
  }

  if (message.includes("account_disabled")) {
    return { type: "disabled", message };
  }

  return { type: "unknown", message };
};
