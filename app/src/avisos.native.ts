import * as BackgroundTask from 'expo-background-task';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { leer, guardar } from './almacen';
import { calcularAvisos, EstadoAvisos } from './avisos-logica';
import { URL_DATOS, datasetValido } from './datos';

// Avisos locales: una tarea en segundo plano descarga cada pocas horas el fichero público de
// datos y, si hay votaciones anunciadas o resultados nuevos, muestra una notificación.
// No hay servidor de notificaciones ni identificadores de dispositivo: nada sale del móvil.
const TAREA = 'pleno-abierto-avisos';
export const avisosDisponibles = Boolean(URL_DATOS);

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

async function comprobar(): Promise<void> {
  const r = await fetch(URL_DATOS, { cache: 'no-cache' });
  if (!r.ok) return;
  const datos: unknown = await r.json();
  if (!datasetValido(datos)) return;
  const previo = await leer<EstadoAvisos | null>('avisos-estado', null);
  const { avisos, estado } = calcularAvisos(datos, previo);
  for (const a of avisos) {
    await Notifications.scheduleNotificationAsync({
      content: { title: a.titulo, body: a.cuerpo, data: { leyId: a.leyId } },
      trigger: null,
    });
  }
  await guardar('avisos-estado', estado);
}

if (!TaskManager.isTaskDefined(TAREA)) {
  TaskManager.defineTask(TAREA, async () => {
    try {
      await comprobar();
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

export async function activarAvisos(): Promise<'ok' | 'denegado' | 'no-disponible'> {
  if (!avisosDisponibles) return 'no-disponible';
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('votaciones', {
      name: 'Votaciones del Congreso',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const permiso = await Notifications.requestPermissionsAsync();
  if (!permiso.granted) return 'denegado';
  await BackgroundTask.registerTaskAsync(TAREA, { minimumInterval: 180 });
  await comprobar().catch(() => undefined); // memoriza el estado actual sin avisar
  return 'ok';
}

export async function desactivarAvisos(): Promise<void> {
  if (await TaskManager.isTaskRegisteredAsync(TAREA)) await BackgroundTask.unregisterTaskAsync(TAREA);
}

export function alAbrirAviso(f: (leyId: string | null) => void): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((r) => {
    const id = (r.notification.request.content.data as { leyId?: string | null })?.leyId ?? null;
    f(id);
  });
  return () => sub.remove();
}
