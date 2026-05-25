import toast from 'react-hot-toast';

const baseOptions = {
  duration: 3600,
};

export const notify = {
  success(message, options = {}) {
    if (!message) return undefined;
    return toast.success(message, { ...baseOptions, ...options });
  },
  error(message, options = {}) {
    if (!message) return undefined;
    return toast.error(message, { duration: 5200, ...options });
  },
  warning(message, options = {}) {
    if (!message) return undefined;
    return toast(message, {
      icon: '!',
      duration: 4800,
      ...options,
    });
  },
  info(message, options = {}) {
    if (!message) return undefined;
    return toast(message, { ...baseOptions, ...options });
  },
  loading(message, options = {}) {
    if (!message) return undefined;
    return toast.loading(message, options);
  },
  dismiss(id) {
    toast.dismiss(id);
  },
};

