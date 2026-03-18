import supabase from './supabaseClient';

async function signIn(email, password) {
  const result = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return result;
}

async function signUp(email, password, fullName) {
  const result = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  return result;
}

async function signOut() {
  const result = await supabase.auth.signOut();

  return result;
}

async function resetPassword(email) {
  const result = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  return result;
}

async function getSession() {
  const result = await supabase.auth.getSession();

  return result;
}

async function onAuthStateChange(callback) {
  const unsubscribe = supabase.auth.onAuthStateChange(callback);

  return unsubscribe;
}

export {
  signIn,
  signUp,
  signOut,
  resetPassword,
  getSession,
  onAuthStateChange,
};
