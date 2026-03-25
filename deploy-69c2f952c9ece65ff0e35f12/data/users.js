export function initUsers(ctx) {
  async function initAuth() {
    let { data: { session } } = await ctx.supabaseClient.auth.getSession();
    if (!session) {
      const { data } = await ctx.supabaseClient.auth.refreshSession();
      session = data?.session || null;
    }
    if (session) {
      ctx.currentUser = session.user;
      await ctx.handlers.onLogin();
    }

    ctx.supabaseClient.auth.onAuthStateChange(async (_event, sessionUpdate) => {
      if (sessionUpdate) {
        ctx.currentUser = sessionUpdate.user;
        await ctx.handlers.onLogin();
      } else {
        ctx.handlers.onLogout();
      }
    });
  }

  async function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const msg = document.getElementById('auth-msg');

    if (!email || !password) {
      msg.textContent = 'Introduce email y contraseña.';
      ctx.notify.warning('Campos incompletos', 'Este email y contraseña son requeridos.');
      return;
    }
    msg.textContent = 'Conectando...';

    try {
      const { data: signInData, error: loginError } = await ctx.supabaseClient.auth.signInWithPassword({ email, password });
      if (!loginError) {
        ctx.currentUser = signInData?.user || null;
        if (ctx.currentUser) {
          await ctx.handlers.onLogin();
          msg.textContent = '';
          ctx.notify.success('¡Sesión iniciada!', 'Sincronizando datos...');
          return;
        }
        // En caso de no obtener usuario, seguimos al flujo de signup o error
      }

      const { data: signUpData, error: signUpError } = await ctx.supabaseClient.auth.signUp({ email, password });
      if (signUpError) {
        const authText = signUpError.message.includes('already registered')
          ? 'Usuario ya registrado. Revisa contraseña.'
          : `Error: ${signUpError.message}`;
        msg.textContent = authText;
        ctx.notify.error('Error de autenticación', authText, 6200);
      } else if (signUpData?.user) {
        ctx.currentUser = signUpData.user;
        await ctx.handlers.onLogin();
        msg.textContent = '';
        ctx.notify.success('Cuenta creada y sesión iniciada', 'Ya estás conectado.', 5200);
      } else {
        msg.textContent = 'Cuenta creada. Revisa tu email para confirmar y vuelve a iniciar sesión.';
        ctx.notify.success('Cuenta creada', 'Revisa tu email para confirmar y vuelve a iniciar sesión.', 5200);
      }
    } catch (error) {
      msg.textContent = 'Error inesperado. Recarga la página.';
      ctx.notify.error('Error de conexión', error.message || 'No se pudo conectar a Supabase');
    }
  }

  async function handleLogout() {
    await ctx.supabaseClient.auth.signOut();
  }

  ctx.users = {
    initAuth,
    handleLogin,
    handleLogout
  };
}
