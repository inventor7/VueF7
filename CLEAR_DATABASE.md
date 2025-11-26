// How to clear PowerSync database and resync

// Open your browser console and run this:

// 1. Clear local PowerSync database
await db.disconnectAndClear();

// 2. Reconnect to trigger fresh sync
window.location.reload();

// Or add a button in your UI to do this programmatically
