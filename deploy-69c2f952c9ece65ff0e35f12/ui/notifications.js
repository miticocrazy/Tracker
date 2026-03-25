export function initNotifications() {
  const container = document.getElementById('notifications-container');
  const notifications = new Map();
  let notificationId = 0;

  function createNotification(type, title, message, duration = 5000, action = null) {
    const id = ++notificationId;
    
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.id = `notif-${id}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    const icon = icons[type] || 'ℹ️';

    notif.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-title">${escapeHtml(title)}</div>
        ${message ? `<div class="notification-message">${escapeHtml(message)}</div>` : ''}
      </div>
      <button class="notification-close" onclick="window.closeNotification(${id})">×</button>
    `;

    notifications.set(id, {
      element: notif,
      timeout: null,
      type,
      title,
      message
    });

    if (container) {
      container.appendChild(notif);
    }

    if (duration > 0) {
      const timeout = setTimeout(() => removeNotification(id), duration);
      notifications.get(id).timeout = timeout;
    }

    return id;
  }

  function removeNotification(id) {
    const notif = notifications.get(id);
    if (!notif) return;

    const { element, timeout } = notif;
    if (timeout) clearTimeout(timeout);

    if (element) {
      element.classList.add('removing');
      setTimeout(() => {
        element.remove();
        notifications.delete(id);
      }, 300);
    } else {
      notifications.delete(id);
    }
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text || '').replace(/[&<>"']/g, char => map[char]);
  }

  function success(title, message = '', duration = 4000) {
    return createNotification('success', title, message, duration);
  }

  function error(title, message = '', duration = 6000) {
    return createNotification('error', title, message, duration);
  }

  function warning(title, message = '', duration = 5000) {
    return createNotification('warning', title, message, duration);
  }

  function info(title, message = '', duration = 4000) {
    return createNotification('info', title, message, duration);
  }

  // Exportar función global para cerrar notificaciones
  window.closeNotification = removeNotification;

  return {
    success,
    error,
    warning,
    info,
    remove: removeNotification,
    create: createNotification
  };
}
