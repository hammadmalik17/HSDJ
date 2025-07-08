const User = require('../models/User');

// Create super admin user if it doesn't exist
const createSuperAdmin = async () => {
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    
    if (!superAdminEmail || !superAdminPassword) {
      console.warn('⚠️  SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD not set in environment variables');
      console.warn('   Super admin will not be created automatically');
      return;
    }
    
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('✅ Super admin user already exists');
      return;
    }
    
    // Check if user with this email already exists
    const existingUser = await User.findByEmail(superAdminEmail);
    
    if (existingUser) {
      console.log('📧 User with super admin email already exists, updating role to super_admin');
      existingUser.role = 'super_admin';
      existingUser.isActive = true;
      existingUser.security.emailVerified = true;
      await existingUser.save();
      console.log('✅ Existing user promoted to super admin');
      return;
    }
    
    // Create new super admin user
    const superAdmin = new User({
      email: superAdminEmail,
      password: superAdminPassword,
      role: 'super_admin',
      profile: {
        name: 'System Administrator'
      },
      isActive: true,
      security: {
        emailVerified: true
      }
    });
    
    await superAdmin.save();
    
    console.log('🚀 Super admin user created successfully');
    console.log(`📧 Email: ${superAdminEmail}`);
    console.log('🔑 Password: [From environment variable]');
    console.log('⚠️  Please change the default password after first login');
    
  } catch (error) {
    console.error('❌ Failed to create super admin user:', error.message);
    
    // Don't crash the application, just log the error
    if (error.code === 11000) {
      console.log('📧 Super admin email already exists in database');
    }
  }
};

module.exports = createSuperAdmin;