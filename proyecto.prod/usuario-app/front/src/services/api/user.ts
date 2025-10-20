// src/services/api/user.ts
import * as ImagePicker from "expo-image-picker";
import { BASE_URL, getToken } from "./http";

export function getUserPhotoUrl(userId: number) {
  // Evitar caché con timestamp
  return `${BASE_URL}/users/${userId}/photo?ts=${Date.now()}`;
}

export async function pickImageFromLibrary(): Promise<ImagePicker.ImagePickerAsset | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (perm.status !== "granted") return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  });

  if (result.canceled) return null;

  const asset = result.assets?.[0] ?? null;
  return asset;
}

export async function uploadUserPhoto(userId: number, asset: ImagePicker.ImagePickerAsset): Promise<void> {
  const token = await getToken();

  const form = new FormData();

  const file: any = {
    uri: asset.uri,
    name: asset.fileName ?? "profile.jpg",
    type: (asset as any).mimeType ?? "image/jpeg",
  };

  (form as any).append("image", file);

  const res = await fetch(`${BASE_URL}/users/${userId}/photo`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    } as any,
    body: form,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }
}
