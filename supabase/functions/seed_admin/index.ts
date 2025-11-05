import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-seed-token',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🌱 Seed admin function called');

    // Verificar token de segurança
    const seedToken = req.headers.get('X-Seed-Token');
    const expectedToken = Deno.env.get('SEED_TOKEN');

    if (!seedToken || seedToken !== expectedToken) {
      console.error('❌ Invalid seed token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid seed token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Seed token validated');

    // Criar cliente Supabase com Service Role Key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin';

    // Verificar se o usuário admin já existe
    console.log('🔍 Checking if admin user exists...');
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error listing users:', listError);
      throw listError;
    }

    const existingAdmin = existingUsers.users.find(user => user.email === adminEmail);

    let adminUserId: string;

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.id);
      adminUserId = existingAdmin.id;
    } else {
      // Criar usuário admin
      console.log('🔨 Creating admin user...');
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Confirmar email automaticamente
        user_metadata: {
          full_name: 'Administrador',
          user_type: 'autistic'
        }
      });

      if (createError) {
        console.error('❌ Error creating admin user:', createError);
        throw createError;
      }

      console.log('✅ Admin user created successfully:', newUser.user.id);
      adminUserId = newUser.user.id;
    }

    // Atribuir papel de admin (upsert para evitar duplicatas)
    console.log('🔑 Assigning admin role...');
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert(
        { user_id: adminUserId, role: 'admin' },
        { onConflict: 'user_id,role' }
      );

    if (roleError) {
      console.error('❌ Error assigning admin role:', roleError);
      throw roleError;
    }

    console.log('✅ Admin role assigned successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created and role assigned successfully',
        user_id: adminUserId,
        credentials: {
          email: adminEmail,
          password: adminPassword
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in seed_admin function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
