import AsyncStorage from '@react-native-async-storage/async-storage';

// Preferencias guardadas solo en el dispositivo (nunca se envían a ningún servidor).
export async function leer<T>(clave: string, defecto: T): Promise<T> {
  try {
    const v = await AsyncStorage.getItem(`pleno:${clave}`);
    return v == null ? defecto : (JSON.parse(v) as T);
  } catch {
    return defecto;
  }
}

export async function guardar<T>(clave: string, valor: T): Promise<void> {
  try {
    await AsyncStorage.setItem(`pleno:${clave}`, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento disponible */
  }
}
