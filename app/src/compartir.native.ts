import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

// Convierte una tarjeta en imagen PNG y abre el menú de compartir del sistema (WhatsApp, Instagram…).
export const puedeCompartir = true;
export async function compartirVista(ref: { current: unknown }, titulo: string): Promise<void> {
  if (!ref.current) return;
  const uri = await captureRef(ref.current as never, { format: 'png', quality: 1, result: 'tmpfile' });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: titulo, UTI: 'public.png' });
}
