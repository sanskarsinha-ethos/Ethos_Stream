const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://klxzihjdnpkogwuqcuau.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtseHppaGpkbnBrb2d3dXFjdWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODkzOTMsImV4cCI6MjA5Nzc2NTM5M30.RgnAmy7wXZBk3idCfFnGyEdmSYjuVxgJwfYUQwY6RmA');
async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'sanskar@gmail.com', password: 'Password123!' });
  if (error) console.error(error);
  else {
    const token = data.session.access_token;
    console.log("Header:", Buffer.from(token.split('.')[0], 'base64').toString());
  }
}
test();
