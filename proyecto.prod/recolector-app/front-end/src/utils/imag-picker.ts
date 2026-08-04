import * as ImagePicker from "expo-image-picker";
/**
 * 🔹 Seleccionar una imagen desde la galería
 */
export const useImagePicker = () => {
  const pickImageFromLibrary = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images", // ✅ la forma correcta en tu versión
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return null;
    return result.assets?.[0] ?? null;
  };

  return { pickImageFromLibrary };
};
