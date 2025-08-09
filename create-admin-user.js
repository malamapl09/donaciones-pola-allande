const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// You'll need to provide your Supabase URL and key
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  try {
    // New admin credentials
    const email = 'admin@test.com';
    const password = 'TestAdmin123!';
    const username = 'testadmin';
    
    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('Creating admin user with:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Username:', username);
    console.log('Password hash:', passwordHash);
    
    // Insert the user into Supabase
    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          username: username,
          email: email,
          password_hash: passwordHash,
          name: 'Test Admin',
          role: 'admin',
          is_active: true
        }
      ])
      .select();
    
    if (error) {
      console.error('Error creating user:', error);
    } else {
      console.log('✅ Admin user created successfully!');
      console.log('User data:', data);
      console.log('\n📝 Login credentials:');
      console.log('Email:', email);
      console.log('Password:', password);
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

createAdminUser();