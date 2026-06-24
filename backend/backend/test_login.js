const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function test() {
  const email = `test+${Date.now()}@example.com`;
  const password = "password123";
  
  console.log("Signing up...");
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) {
    console.error("SignUp Error:", signUpError.message);
    return;
  }
  
  console.log("SignUp Session:", !!signUpData.session);
  // Wait, if email confirmation is enabled, we won't get a session!
  // If we can't get a session, we can't test /api/user/profile.
  
  if (!signUpData.session) {
     console.log("Email verification required. Cannot test API without verified token.");
  }
}
test();
