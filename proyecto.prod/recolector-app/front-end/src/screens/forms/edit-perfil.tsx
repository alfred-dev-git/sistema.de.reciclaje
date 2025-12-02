import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { navigate } from "../../navigation/refglobal-navigation";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { updatePerfil } from "../../api/services/perfil-service";
import { Picker } from "@react-native-picker/picker";
import { Municipio, getMunicipios } from "../../api/services/perfil-service";

const EditarPerfilScreen: React.FC = () => {
  const route = useRoute<any>();
  const { perfil } = route.params || {};

  const [nombre, setNombre] = useState(perfil?.nombre || "");
  const [apellido, setApellido] = useState(perfil?.apellido || "");
  const [email, setEmail] = useState(perfil?.email || "");
  const [telefono, setTelefono] = useState(perfil?.telefono || "");
  const [fecha, setFecha] = useState(
    perfil?.fecha_nacimiento ? new Date(perfil.fecha_nacimiento) : new Date()
  );

  const [municipioId, setMunicipioId] = useState(
    perfil?.municipio_idmunicipio ?? null
  );

  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(true);

  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  //  TRAER MUNICIPIOS AL ENTRAR
  useEffect(() => {
    const fetchMunicipios = async () => {
      const resp = await getMunicipios();
      if (resp.success && resp.data) {
        setMunicipios(resp.data);
      } else {
        Alert.alert("Error", "No se pudieron cargar los municipios");
      }
      setLoadingMunicipios(false);
    };

    fetchMunicipios();
  }, []);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setFecha(selectedDate);
  };

  const handleUpdate = async () => {
    if (!nombre || !apellido || !email || !telefono) {
      Alert.alert("Validación", "Todos los campos son obligatorios");
      return;
    }

    const payload = {
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento: fecha.toISOString().split("T")[0],
      municipio_idmunicipio: municipioId,
    };

    try {
      setLoading(true);
      const resp = await updatePerfil(payload);
      setLoading(false);

      if (!resp.success) {
        Alert.alert("Error", resp.message);
        return;
      }

      Alert.alert("Éxito", "Perfil actualizado correctamente", [
        { text: "OK", onPress: () => navigate("Perfil") },
      ]);
    } catch (e) {
      setLoading(false);
      Alert.alert("Error", "Hubo un problema al actualizar");
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/background/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Editar Perfil</Text>

            {/* Nombre */}
            <Text>Nombre</Text>
            <View style={styles.input}>
              <Ionicons name="person-outline" size={20} color="#000" />
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                style={{ flex: 1 }}
                maxLength={80}
              />
            </View>

            {/* Apellido */}
            <Text>Apellido</Text>
            <View style={styles.input}>
              <Ionicons name="person-outline" size={20} color="#000" />
              <TextInput
                value={apellido}
                onChangeText={setApellido}
                style={{ flex: 1 }}
                maxLength={50}
              />
            </View>

            {/* Email */}
            <Text>Email</Text>
            <View style={styles.input}>
              <Ionicons name="mail-outline" size={20} color="#000" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ flex: 1 }}
                maxLength={80}
              />
            </View>

            {/* Teléfono */}
            <Text>Teléfono</Text>
            <View style={styles.input}>
              <Ionicons name="call-outline" size={20} color="#000" />
              <TextInput
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
                style={{ flex: 1 }}
                maxLength={15}
              />
            </View>

            {/* Fecha nacimiento */}
            <Text>Fecha de Nacimiento</Text>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={styles.dateInputContainer}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#000000ff"
                style={styles.calendarIcon}
              />
              <Text style={styles.dateText}>
                {fecha.toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={fecha}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChangeDate}
                maximumDate={new Date()}
              />
            )}

            {/* Select de Municipios */}
            <Text>Municipio</Text>

            {loadingMunicipios ? (
              <Text>Cargando municipios...</Text>
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={municipioId}
                  onValueChange={(value) => setMunicipioId(Number(value))}
                >
                  {/* Item informativo, no seleccionable */}
                  <Picker.Item
                    label="Seleccione un municipio"
                    value={0}
                    enabled={false}
                  />

                  {municipios.map((m) => (
                    <Picker.Item
                      key={m.idmunicipio}
                      label={m.descripcion}
                      value={m.idmunicipio}
                    />
                  ))}
                </Picker>
              </View>
            )}

            {/* Botón Guardar */}
            <TouchableOpacity
              style={styles.boton}
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text style={styles.botonTexto}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Text>
            </TouchableOpacity>

            {/* Volver */}
            <TouchableOpacity style={styles.boton} onPress={() => navigate("Perfil")}>
              <Text style={styles.botonTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default EditarPerfilScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  formContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: "#ffffffdd",
    borderRadius: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 10,
    height: 45,
  },
  boton: {
    backgroundColor: "#307043",
    padding: 12,
    marginTop: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  botonTexto: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  calendarIcon: { marginRight: 10 },
  dateText: { fontSize: 16 },
  pickerContainer: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  marginBottom: 12,
  backgroundColor: "#fff",
},
});
