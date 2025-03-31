// Create a script to set admin overrides
// Browser localStorage isn't available in Node, this script needs to be run in the browser console
console.log("Please run the following code in your browser console:");
console.log(
  `localStorage.setItem('akii_admin_override', 'true'); localStorage.setItem('akii_admin_override_email', 'josef@holm.com'); localStorage.setItem('akii_admin_override_expiry', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()); localStorage.setItem('admin_override', 'true'); localStorage.setItem('admin_override_email', 'josef@holm.com'); localStorage.setItem('admin_override_time', Date.now().toString()); console.log('Admin overrides set for Josef');`,
);
