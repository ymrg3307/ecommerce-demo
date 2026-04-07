const sessions = new Map();

function createSession(record) {
  sessions.set(record.sessionId, record);
}

function getSession(sessionId) {
  return sessions.get(sessionId) ?? null;
}

function deleteSession(sessionId) {
  sessions.delete(sessionId);
}

module.exports = {
  createSession,
  getSession,
  deleteSession
};
