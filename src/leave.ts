import { useRouter } from 'vue-router';

/**
 * Leaves a side page (settings, the converter) for wherever the person
 * came from; home when they opened it directly, as from a bookmark.
 */
export function useLeave() {
  const router = useRouter();
  return () => {
    const cameFromInsideTheApp = Boolean(window.history.state?.back);
    if (cameFromInsideTheApp) router.back();
    else void router.push('/');
  };
}
