import { useToast } from '../../context/ToastContext.jsx';
import styles from './Toast.module.css';

export default function Toast() {
  const { toast } = useToast();
  if (!toast) return null;
  return (
    <div key={toast.key} className={`${styles.toast} ${toast.type === 'error' ? styles.error : ''}`}>
      <span>{toast.type === 'error' ? '✗' : '✓'}</span>
      {toast.message}
    </div>
  );
}
