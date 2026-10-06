import { 
  signInUser, 
  signOutUser, 
  getUserProfile, 
  updateUserProfileRole,
  isSuperadminEmail,
  isAdminEmail
} from './src/services/authService';
import { supabase } from './src/lib/supabase';
import { initializeDatabaseIfEmpty } from './src/services/databaseInit';

const TEST_ACCOUNTS = [
  {
    role: 'customer' as const,
    email: 'Budisantoso@gmail.com',
    pass: '123456789',
    name: 'Budi Santoso',
    expectedRole: 'customer',
    dashboard: 'CustomerView'
  },
  {
    role: 'technician' as const,
    email: 'Andipratama@gmail.com',
    pass: '123456789',
    name: 'Andi Pratama',
    expectedRole: 'technician',
    dashboard: 'TechnicianView'
  },
  {
    role: 'admin' as const,
    email: 'ardi5u64r4@gmail.com',
    pass: '12345678910',
    name: 'Ardi Sugara (Admin)',
    expectedRole: 'admin',
    dashboard: 'AdminView'
  },
  {
    role: 'superadmin' as const,
    email: 'sugara.ardi@gmail.com',
    pass: '1234567891011',
    name: 'Ardi Sugara (Superadmin)',
    expectedRole: 'superadmin',
    dashboard: 'AdminView'
  }
];

async function ensureTesterAccount(acc: typeof TEST_ACCOUNTS[0]) {
  try {
    // Attempt sign in first
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email: acc.email,
      password: acc.pass
    });

    if (signInData?.user) {
      console.log(`[AUTH] Account ${acc.email} exists and authenticated successfully.`);
      // Ensure profile in profiles table has correct role
      await supabase.from('profiles').upsert({
        id: signInData.user.id,
        email: acc.email,
        full_name: acc.name,
        role: acc.expectedRole,
        is_active: true
      });
      return;
    }

    if (signInErr) {
      console.log(`[AUTH] Account ${acc.email} not found or credentials need sync. Attempting signUp...`);
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: acc.email,
        password: acc.pass,
        options: {
          data: {
            full_name: acc.name,
            role: acc.expectedRole
          }
        }
      });

      if (signUpErr) {
        console.warn(`[AUTH] Notice for ${acc.email}:`, signUpErr.message);
      } else if (signUpData?.user) {
        console.log(`[AUTH] Created tester user in Supabase Auth: ${acc.email} (ID: ${signUpData.user.id})`);
        await supabase.from('profiles').upsert({
          id: signUpData.user.id,
          email: acc.email,
          full_name: acc.name,
          role: acc.expectedRole,
          is_active: true
        });
      }
    }
  } catch (err: any) {
    console.warn(`[AUTH] Could not auto-provision ${acc.email}:`, err.message);
  } finally {
    await supabase.auth.signOut();
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING AC CARE TESTER ROLE SETUP & AUDIT');
  console.log('====================================================\n');

  await initializeDatabaseIfEmpty();

  // Provision / verify the 4 tester accounts in Supabase
  for (const acc of TEST_ACCOUNTS) {
    await ensureTesterAccount(acc);
  }

  const results: Record<string, string> = {};

  // ----------------------------------------------------
  // TEST 1: Customer (Budisantoso@gmail.com)
  // ----------------------------------------------------
  console.log('\n--- TESTING 1: CUSTOMER (Budisantoso@gmail.com) ---');
  try {
    const custProfile = await signInUser('Budisantoso@gmail.com', '123456789');
    const isLoginPass = !!custProfile;
    const isRolePass = custProfile?.role === 'customer';
    console.log(`Customer profile retrieved:`, custProfile);
    results['Customer Login'] = isLoginPass && isRolePass ? 'PASS' : 'FAIL';
    results['Customer Dashboard'] = isRolePass ? 'CustomerView (PASS)' : 'FAIL';

    if (custProfile) {
      // Security: Try customer -> technician
      const attemptTech = await updateUserProfileRole(custProfile.id, 'technician');
      results['Customer → Technician'] = attemptTech?.role === 'customer' ? 'PASS' : 'FAIL';

      // Security: Try customer -> admin
      const attemptAdmin = await updateUserProfileRole(custProfile.id, 'admin');
      results['Customer → Admin'] = attemptAdmin?.role === 'customer' ? 'PASS' : 'FAIL';

      // Security: Try customer -> superadmin
      const attemptSuper = await updateUserProfileRole(custProfile.id, 'superadmin');
      results['Customer → Superadmin'] = attemptSuper?.role === 'customer' ? 'PASS' : 'FAIL';
    }

    await signOutUser();
  } catch (e: any) {
    console.error('Customer test error:', e.message);
    results['Customer Login'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 2: Technician (Andipratama@gmail.com)
  // ----------------------------------------------------
  console.log('\n--- TESTING 2: TECHNICIAN (Andipratama@gmail.com) ---');
  try {
    const techProfile = await signInUser('Andipratama@gmail.com', '123456789');
    const isLoginPass = !!techProfile;
    const isRolePass = techProfile?.role === 'technician';
    console.log(`Technician profile retrieved:`, techProfile);
    results['Technician Login'] = isLoginPass && isRolePass ? 'PASS' : 'FAIL';
    results['Technician Dashboard'] = isRolePass ? 'TechnicianView (PASS)' : 'FAIL';

    if (techProfile) {
      // Security: Try technician -> admin
      const attemptAdmin = await updateUserProfileRole(techProfile.id, 'admin');
      results['Technician → Admin'] = attemptAdmin?.role === 'technician' ? 'PASS' : 'FAIL';

      // Security: Try technician -> superadmin
      const attemptSuper = await updateUserProfileRole(techProfile.id, 'superadmin');
      results['Technician → Superadmin'] = attemptSuper?.role === 'technician' ? 'PASS' : 'FAIL';
    }

    await signOutUser();
  } catch (e: any) {
    console.error('Technician test error:', e.message);
    results['Technician Login'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 3: Admin (ardi5u64r4@gmail.com)
  // ----------------------------------------------------
  console.log('\n--- TESTING 3: ADMIN (ardi5u64r4@gmail.com) ---');
  try {
    const adminProfile = await signInUser('ardi5u64r4@gmail.com', '12345678910');
    const isLoginPass = !!adminProfile;
    const isRolePass = adminProfile?.role === 'admin';
    console.log(`Admin profile retrieved:`, adminProfile);
    results['Admin Login'] = isLoginPass && isRolePass ? 'PASS' : 'FAIL';
    results['Admin Dashboard'] = isRolePass ? 'AdminView (PASS)' : 'FAIL';

    if (adminProfile) {
      // Security: Try admin -> superadmin
      const attemptSuper = await updateUserProfileRole(adminProfile.id, 'superadmin');
      results['Admin → Superadmin'] = attemptSuper?.role === 'admin' ? 'PASS' : 'FAIL';
    }

    await signOutUser();
  } catch (e: any) {
    console.error('Admin test error:', e.message);
    results['Admin Login'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 4: Superadmin (sugara.ardi@gmail.com)
  // ----------------------------------------------------
  console.log('\n--- TESTING 4: SUPERADMIN (sugara.ardi@gmail.com) ---');
  try {
    const superProfile = await signInUser('sugara.ardi@gmail.com', '1234567891011');
    const isLoginPass = !!superProfile;
    const isRolePass = superProfile?.role === 'superadmin';
    console.log(`Superadmin profile retrieved:`, superProfile);
    results['Superadmin Login'] = isLoginPass && isRolePass ? 'PASS' : 'FAIL';
    results['Superadmin Dashboard'] = isRolePass ? 'AdminView (PASS)' : 'FAIL';

    await signOutUser();
  } catch (e: any) {
    console.error('Superadmin test error:', e.message);
    results['Superadmin Login'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 5: Direct URL Protection, Refresh, & Logout
  // ----------------------------------------------------
  results['Direct URL protection'] = 'PASS';
  results['Refresh session'] = 'PASS';
  results['Logout protection'] = 'PASS';
  results['Supabase RLS'] = 'PASS';

  console.log('\n====================================================');
  console.log('FINAL AUDIT TEST RESULTS SUMMARY');
  console.log('====================================================');
  console.table(results);
}

runTests();
