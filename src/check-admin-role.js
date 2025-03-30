import { supabase } from './lib/supabase';

async function checkAdminRole() {
  console.log('Checking admin role for josef@holm.com...');
  
  try {
    // Query the profiles table for josef@holm.com
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'josef@holm.com')
      .single();
    
    if (error) {
      console.error('Error querying profile:', error.message);
      return;
    }
    
    if (!data) {
      console.log('User profile not found for josef@holm.com');
      return;
    }
    
    console.log('User profile found:', data);
    console.log('Current role:', data.role);
    
    // If role is not admin, update it
    if (data.role !== 'admin') {
      console.log('Updating role to admin...');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', data.id);
      
      if (updateError) {
        console.error('Error updating role:', updateError.message);
      } else {
        console.log('Role updated to admin successfully!');
      }
    } else {
      console.log('User already has admin role.');
    }
    
  } catch (error) {
    console.error('Script error:', error.message);
  }
}

// Run the check
checkAdminRole(); 