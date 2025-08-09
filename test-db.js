const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://mariolama@localhost:5432/donaciones_pola_allande'
});

async function testDatabase() {
  try {
    await client.connect();
    console.log('✅ Database connection successful');
    
    // Test basic queries
    const result = await client.query('SELECT COUNT(*) as count FROM donations');
    console.log(`📊 Donations in database: ${result.rows[0].count}`);
    
    const adminResult = await client.query('SELECT COUNT(*) as count FROM admin_users');
    console.log(`👤 Admin users in database: ${adminResult.rows[0].count}`);
    
    const referralResult = await client.query('SELECT COUNT(*) as count FROM referrals');
    console.log(`🔗 Referrals in database: ${referralResult.rows[0].count}`);
    
    const goalResult = await client.query('SELECT title, target_amount, current_amount FROM donation_goals WHERE is_active = true');
    if (goalResult.rows.length > 0) {
      const goal = goalResult.rows[0];
      console.log(`🎯 Active goal: ${goal.title}`);
      console.log(`💰 Target: €${goal.target_amount}, Current: €${goal.current_amount || 0}`);
    }
    
  } catch (err) {
    console.error('❌ Database error:', err);
  } finally {
    await client.end();
  }
}

testDatabase();