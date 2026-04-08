import AsyncStorage from "@react-native-async-storage/async-storage";

const SECURE_PREFIX = "secure:";

function secureKey(key: string) {
  return `${SECURE_PREFIX}${key}`;
}

export async function setSecureValue(key: string, value: string) {
  await AsyncStorage.setItem(secureKey(key), value);
}

export async function getSecureValue(key: string) {
  return AsyncStorage.getItem(secureKey(key));
}

export async function deleteSecureValue(key: string) {
  await AsyncStorage.removeItem(secureKey(key));
}
