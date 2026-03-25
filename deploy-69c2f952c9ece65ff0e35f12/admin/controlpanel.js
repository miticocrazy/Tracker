export function initControlPanel(ctx) {
  const panel = document.getElementById('control-panel');
  const usersEl = document.getElementById('control-users');
  const passwordsEl = document.getElementById('control-passwords');
  const resetEl = document.getElementById('control-reset');
  const advancedEl = document.getElementById('control-advanced');
  const logsEl = document.getElementById('control-logs');
  const noteEl = document.getElementById('control-note');
  let open = false;
  const logs = [];

  function setNote(id, text, error = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = error ? 'note error' : 'note';
    el.textContent = text;
    setTimeout(() => {
      if (el.textContent === text) el.textContent = '';
    }, 2300);
  }

  function addLog(action, details) {
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    logs.push({ timestamp, action, details });
    if (logs.length > 50) logs.shift();
  }

  function openPanel() {
    if (!panel) return;
    if (!ctx.utils.isAdmin()) {
      addLog('DENEGADO', 'Acceso rechazado: no eres admin');
      return;
    }
    panel.classList.remove('hidden');
    open = true;
    refresh();
  }

  function close() {
    if (!panel) return;
    panel.classList.add('hidden');
    open = false;
  }

  function refresh() {
    if (!open) return;

    // Control de usuarios
    if (usersEl) {
      const users = ['Paulo (paulodacunha08@icloud.com)', 'Naroa'];
      usersEl.innerHTML = `
        <div style="font-size: 0.9em; line-height: 1.6;">
          ${users.map(u => `<div>✅ ${u}</div>`).join('')}
        </div>
        <button class="option-btn" onclick="window.viewAllUsers()" style="margin-top: 10px;">Ver todos</button>
      `;
    }

    // Control de contraseñas
    if (passwordsEl) {
      passwordsEl.innerHTML = `
        <div style="font-size: 0.9em; line-height: 1.8;">
          <button class="option-btn" onclick="window.resetPassword('Paulo')" style="width:100%; margin-bottom: 6px;">
            🔑 Reset Paulo
          </button>
          <button class="option-btn" onclick="window.resetPassword('Naroa')" style="width:100%; margin-bottom: 6px;">
            🔑 Reset Naroa
          </button>
          <p class="muted" style="margin-top: 8px; font-size: 0.85em;">Se enviará email de recuperación</p>
          <div style="margin-top: 12px;">
            <select id="admin-change-user" style="width:100%; margin-bottom: 6px; padding: 9px;">
              <option value="paulo">Paulo</option>
              <option value="naroa">Naroa</option>
            </select>
            <input id="admin-change-password" type="password" placeholder="Nueva contraseña" style="width:100%; margin-bottom: 6px;">
            <input id="admin-confirm-change-password" type="password" placeholder="Confirmar contraseña" style="width:100%; margin-bottom: 8px;">
            <button class="option-btn" onclick="window.updateSelectedUserPassword()" style="width:100%; background-color: #5b21b6; color: #fff;">
              ⚡ Cambiar contraseña de usuario
            </button>
            <p class="muted" style="margin-top: 6px; font-size: 0.85em;">Cambia contraseña de la cuenta seleccionada</p>
          </div>
        </div>
      `;
    }

    // Reset & Limpiar
    if (resetEl) {
      resetEl.innerHTML = `
        <div style="font-size: 0.9em;">
          <button class="option-btn" onclick="window.clearAllHabits()" style="width:100%; margin-bottom: 6px; background-color: #fca5a5;">
            🗑️ Limpiar hábitos
          </button>
          <button class="option-btn" onclick="window.clearAllLogs()" style="width:100%; margin-bottom: 6px; background-color: #fca5a5;">
            🗑️ Limpiar registros
          </button>
          <button class="option-btn" onclick="window.resetDuel()" style="width:100%; margin-bottom: 6px; background-color: #fca5a5;">
            🔄 Reset duelo
          </button>
          <p class="muted" style="margin-top: 8px; font-size: 0.85em;">⚠️ Acciones irreversibles</p>
        </div>
      `;
    }

    // Acciones avanzadas
    if (advancedEl) {
      advancedEl.innerHTML = `
        <div style="font-size: 0.9em;">
          <button class="option-btn" onclick="window.forceSyncNow()" style="width:100%; margin-bottom: 6px;">
            🔄 Force Sync Now
          </button>
          <button class="option-btn" onclick="window.clearLocalCache()" style="width:100%; margin-bottom: 6px;">
            🧹 Limpiar caché local
          </button>
          <button class="option-btn" onclick="window.refreshBackendDetection()" style="width:100%; margin-bottom: 6px;">
            🧭 Verificar backend Supabase
          </button>
          <button class="option-btn" onclick="window.dumpState()" style="width:100%; margin-bottom: 6px;">
            📦 Ver estado actual (console.log)
          </button>
          <p class="muted" style="margin-top: 8px; font-size: 0.85em;">Estas acciones ayudan a depurar y recomponer epic.</p>
        </div>
      `;
    }

    // Logs del sistema
    if (logsEl) {
      const logsHtml = logs.length ? 
        logs.map(log => `<div style="font-size:0.85em; padding: 4px 0;"><span style="color: #666;">[${log.timestamp}]</span> <strong>${log.action}</strong>: ${log.details}</div>`).reverse().join('') :
        '<div class="muted">Sin logs todavía</div>';
      logsEl.innerHTML = logsHtml;
    }
  }

  // Funciones de administración
  window.viewAllUsers = function() {
    addLog('VIEW', 'Viewed all users');
    setNote('control-note', 'Ver usuarios: Paulo, Naroa');
  };

  window.resetPassword = async function(user) {
    if (!confirm(`¿Enviar link de reset de contraseña a ${user}?`)) {
      addLog('PASSWORD_RESET_CANCELLED', user);
      return;
    }

    setNote('control-note', `Enviando link a ${user}...`);
    addLog('PASSWORD_RESET_SENDING', user);

    try {
      // Mapear nombre a email
      const emails = {
        'Paulo': 'paulodacunha08@icloud.com',
        'Naroa': 'naroaalonso21@gmail.com'
      };

      const email = emails[user];
      if (!email) {
        throw new Error('Email no encontrado');
      }

      if (!ctx.supabaseClient) {
        throw new Error('Supabase no disponible');
      }

      const { error } = await ctx.supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });

      if (error) {
        addLog('PASSWORD_RESET_ERROR', `${user}: ${error.message}`);
        setNote('control-note', `Error: ${error.message}`, true);
      } else {
        addLog('PASSWORD_RESET_SUCCESS', user);
        setNote('control-note', `Link enviado a ${email}. Revisa tu email.`, false);
      }
    } catch (error) {
      addLog('PASSWORD_RESET_EXCEPTION', `${user}: ${error.message}`);
      setNote('control-note', `Error: ${error.message}`, true);
    }
  };

  window.clearAllHabits = function() {
    if (confirm('⚠️ CUIDADO: Esto eliminará TODOS los hábitos. ¿Continuar?')) {
      ctx.state.habits = [];
      addLog('CLEAR_HABITS', 'Todos los hábitos eliminados');
      ctx.data.save(true);
      ctx.dashboard.render();
      setNote('control-note', 'Hábitos eliminados', true);
    }
  };

  window.updateSelectedUserPassword = async function() {
    const target = document.getElementById('admin-change-user')?.value;
    const newPass = document.getElementById('admin-change-password')?.value;
    const confirmPass = document.getElementById('admin-confirm-change-password')?.value;

    if (!target || !newPass || !confirmPass) {
      setNote('control-note', 'Rellena los campos de contraseña.', true);
      return;
    }
    if (newPass !== confirmPass) {
      setNote('control-note', 'Las contraseñas no coinciden.', true);
      return;
    }
    if (newPass.length < 6) {
      setNote('control-note', 'La contraseña debe tener al menos 6 caracteres.', true);
      return;
    }

    // Servicios de Supabase: la forma segura requiere SERVICE_ROLE (backend).
    // En cliente solo podemos recirigir por email si no es el usuario actual.

    if (!ctx.supabaseClient) {
      setNote('control-note', 'Supabase no disponible.', true);
      return;
    }

    if (target === 'paulo') {
      // cambia la cuenta activa de Paulo
      const { error } = await ctx.supabaseClient.auth.updateUser({ password: newPass });
      if (error) {
        setNote('control-note', `Error actualizando Paulo: ${error.message}`, true);
        ctx.notify.error('Error', error.message);
      } else {
        setNote('control-note', 'Contraseña de Paulo actualizada.', false);
        ctx.notify.success('Éxito', 'Contraseña actualizada.');
      }
      return;
    }

    if (target === 'naroa') {
      // En cliente no se puede cambiar directamente otra cuenta, enviamos reset
      const emails = {
        'naroa': 'naroaalonso21@gmail.com'
      };
      const email = emails[target];
      const { error } = await ctx.supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) {
        setNote('control-note', `Error enviando reset Naroa: ${error.message}`, true);
        ctx.notify.error('Error', error.message);
      } else {
        setNote('control-note', 'Enviado enlace de restablecimiento a Naroa.', false);
        ctx.notify.success('Enviado', 'Revisa el correo de Naroa.');
      }
      return;
    }

    setNote('control-note', 'Usuario no válido', true);
  };

  window.clearAllLogs = function() {
    if (confirm('⚠️ CUIDADO: Esto eliminará TODOS los registros/logs. ¿Continuar?')) {
      ctx.state.logs = {};
      addLog('CLEAR_LOGS', 'Todos los logs eliminados');
      ctx.data.save(true);
      ctx.dashboard.render();
      setNote('control-note', 'Registros eliminados', true);
    }
  };

  window.resetDuel = function() {
    if (confirm('⚠️ Se resetearán datos del duelo. ¿Continuar?')) {
      addLog('DUEL_RESET', 'Duelo reseteado');
      ctx.data.save(true);
      setNote('control-note', 'Duelo reseteado', true);
    }
  };

  window.updateAdminPassword = async function() {
    const newPassword = document.getElementById('admin-new-password')?.value;
    const confirmPassword = document.getElementById('admin-confirm-password')?.value;

    if (!newPassword || !confirmPassword) {
      setNote('control-note', 'Introduce ambos campos de contraseña.', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setNote('control-note', 'Las contraseñas no coinciden.', true);
      return;
    }
    if (newPassword.length < 6) {
      setNote('control-note', 'La contraseña debe tener al menos 6 caracteres.', true);
      return;
    }

    if (!ctx.supabaseClient) {
      setNote('control-note', 'Supabase no disponible.', true);
      return;
    }

    try {
      const { error } = await ctx.supabaseClient.auth.updateUser({ password: newPassword });
      if (error) {
        setNote('control-note', `Error: ${error.message}`, true);
      } else {
        setNote('control-note', 'Contraseña actualizada con éxito.', false);
        ctx.notify.success('Contraseña actualizada', 'Tu contraseña de sesión actual ha sido cambiada.', 4500);
      }
    } catch (err) {
      const msg = err?.message || 'Error desconocido';
      setNote('control-note', `Error: ${msg}`, true);
      ctx.notify.error('Error cambiando contraseña', msg, 4500);
    }
  };

  window.forceSyncNow = async function() {
    addLog('FORCE_SYNC', 'Sincronización forzada solicitada');
    setNote('control-note', 'Sincronizando ahora...');
    try {
      await ctx.data.syncNow();
      setNote('control-note', 'Sincronización forzada completada.');
      ctx.notify.success('Sincronización', 'Sincronización forzada completada', 3500);
    } catch (err) {
      setNote('control-note', `Error al sincronizar: ${err.message || err}`, true);
      ctx.notify.error('Error de sincronización', err.message || String(err), 4500);
    }
  };

  window.clearLocalCache = function() {
    const key = ctx.currentUser ? `${ctx.config.LOCAL_CACHE_PREFIX}${ctx.currentUser.id}` : `${ctx.config.LOCAL_CACHE_PREFIX}guest`;
    localStorage.removeItem(key);
    setNote('control-note', 'Caché local borrada.', false);
    addLog('CLEAR_CACHE', `Local cache removed for ${key}`);
    ctx.notify.info('Caché limpiada', 'Recarga la app para aplicar cambios.', 3200);
  };

  window.refreshBackendDetection = async function() {
    setNote('control-note', 'Detectando backend Supabase...');
    addLog('BACKEND_DETECT', 'Detección de backend solicitada');
    try {
      const backend = await ctx.data.detectDataBackend(true);
      if (backend) {
        setNote('control-note', `Backend activo: ${backend.table}`, false);
        ctx.notify.success('Backend detectado', `${backend.table}`, 3200);
      } else {
        setNote('control-note', 'No se encontró backend activo', true);
        ctx.notify.error('No hay backend', 'No se detectó backend Supabase activo', 3200);
      }
    } catch (err) {
      setNote('control-note', `Error detectando backend: ${err.message || err}` , true);
      ctx.notify.error('Error backend', err.message || String(err), 4500);
    }
  };

  window.dumpState = function() {
    console.log('=== APP STATE DUMP ===', ctx.state);
    setNote('control-note', 'State volcado a la consola. Revisa el inspector.');
    addLog('DUMP_STATE', 'State dump ejecutado');
  };

  if (panel) {
    panel.addEventListener('click', (event) => {
      if (event.target === panel) close();
    });
  }

  return { open: openPanel, close, refresh, addLog };
}
