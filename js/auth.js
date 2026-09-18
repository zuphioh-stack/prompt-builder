// Thin wrapper around Supabase Auth that presents a plain username/password
// interface to the rest of the app. Supabase itself only understands
// email/password, so usernames are silently mapped to a fake email under
// USERNAME_EMAIL_DOMAIN (see js/supabase-config.js) before ever touching
// the Supabase client — the login screen never shows or asks for an email.
(function () {
  "use strict";

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  function normalizeUsername(username) {
    return String(username || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");
  }

  function usernameToEmail(username) {
    return `${normalizeUsername(username)}@${USERNAME_EMAIL_DOMAIN}`;
  }

  // Recovers the display username from the session's (fake) email —
  // this is the only place a "username" is stored, so it doubles as the
  // display name shown in the UI ("Signed in as alice").
  function usernameFromSession(session) {
    if (!session || !session.user || !session.user.email) return null;
    return session.user.email.split("@")[0];
  }

  async function login(username, password) {
    if (!normalizeUsername(username)) throw new Error("Enter a username.");
    const { data, error } = await client.auth.signInWithPassword({
      email: usernameToEmail(username),
      password
    });
    if (error) throw error;
    return data.session;
  }

  async function logout() {
    await client.auth.signOut();
  }

  async function getSession() {
    const { data } = await client.auth.getSession();
    return data.session || null;
  }

  // Fires immediately with the current state, then again on every login/logout.
  function onChange(callback) {
    client.auth.onAuthStateChange((_event, session) => callback(session));
  }

  window.Auth = {
    client,
    login,
    logout,
    getSession,
    onChange,
    usernameFromSession
  };
})();
