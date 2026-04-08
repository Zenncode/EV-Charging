import { PermissionsAndroid, Platform } from "react-native";

export async function requestLocationPermission() {
  if (Platform.OS !== "android") return true;

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  return status === PermissionsAndroid.RESULTS.GRANTED;
}

export function usePermissions() {
  return {
    requestLocationPermission,
  };
}
