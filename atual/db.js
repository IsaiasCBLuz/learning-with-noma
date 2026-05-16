// ============================================================
// SUPABASE CONFIG
// ============================================================
var SB = "https://dznzzlgwcnwckubpgwjk.supabase.co";
var SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bnp6bGd3Y253Y2t1YnBnd2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzAxMzQsImV4cCI6MjA5MzY0NjEzNH0.j-kgLIxqM1KWrk3thV_xtDMVdyvOKAc4IpA5lBDYgps";
function sbq(path, opts) {
  var h = {
    "apikey": SK,
    "Authorization": "Bearer " + SK,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };
  if (opts && opts.headers) Object.assign(h, opts.headers);
  return fetch(SB + "/rest/v1/" + path, Object.assign({}, opts, {headers: h}));
}
