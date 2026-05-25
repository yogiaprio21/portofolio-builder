const state = {
  ready: false,
  database: 'starting',
  error: null,
  startedAt: new Date().toISOString()
};

function markReady() {
  state.ready = true;
  state.database = 'ok';
  state.error = null;
}

function markStarting() {
  state.ready = false;
  state.database = 'starting';
  state.error = null;
}

function markFailed(error) {
  state.ready = false;
  state.database = 'failed';
  state.error = error?.message || String(error || 'Unknown error');
}

function getReadiness() {
  return { ...state };
}

module.exports = {
  getReadiness,
  markFailed,
  markReady,
  markStarting
};
