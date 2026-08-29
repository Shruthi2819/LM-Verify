/**
 * Toast — re-exports react-hot-toast for consistent usage across the app.
 *
 * Usage:
 *   import toast from '../feedback/Toast';
 *   toast.success('Application submitted successfully.');
 *   toast.error('Unable to upload document.');
 *   toast.warning('Certificate expires in 30 days.') — use toast with custom config
 *
 * The Toaster component is mounted once in App.jsx.
 */
export { default } from "react-hot-toast";
