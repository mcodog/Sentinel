import { sentinel_backend } from "./index.js";

export async function getPatientConsents() {
  try {
    const consents = await sentinel_backend.getConsentBlockChain({});
    return consents;
  } catch (err) {
    console.error("Error fetching patient consents:", err);
    throw err;
  }
}

export async function getSessions() {
  try {
    const sessions = await sentinel_backend.getSessions({});
    return sessions;
  } catch (err) {
    console.error("Error fetching sessions:", err);
    throw err;
  }
}

export async function getAuditLogs() {
  try {
    const auditLogs = await sentinel_backend.getAuditLogs({});
    return auditLogs;
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    throw err;
  }
}

export async function addSession(session) {
  try {
    const result = await sentinel_backend.addSession({
      session: {
        id: session.id,
        patientId: session.patientId,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
      },
    });
    return result;
  } catch (err) {
    console.error("Error adding session:", err);
    throw err;
  }
}
