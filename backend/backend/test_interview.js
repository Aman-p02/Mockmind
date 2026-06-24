const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function test() {
  const email = `test+${Date.now()}@example.com`;
  const password = "password123";
  
  // Sign up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) {
    console.error("SignUp Error:", signUpError.message);
    return;
  }
  
  // If email confirmation is required, we can't test unless we confirm it.
  if (!signUpData.session) {
     console.log("Email verification required. Cannot test API without verified token.");
     // We can try to sign in with the user's known account if we knew the email, but we don't.
     return;
  }
}
test();
