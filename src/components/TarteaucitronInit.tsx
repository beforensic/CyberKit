import { useEffect } from 'react';
import { initTarteaucitron } from '../lib/tarteaucitron';

export default function TarteaucitronInit() {
  useEffect(() => {
    initTarteaucitron().catch((error) => {
      console.error('[CyberKit] tarteaucitron:', error);
    });
  }, []);

  return null;
}
