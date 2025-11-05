import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { navigate } from '../../navigation/refglobal-navigation';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from "@expo/vector-icons";

const RegisterForm: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false); // Cierra el picker al seleccionar
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/background/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Registro</Text>

            {/* Correo */}
            <Text>Correo Electrónico</Text>
            <View style={styles.input}>
              <Ionicons name='mail-outline' size={20} color='#000000ff' style={{ marginLeft: 4 }} />
              <TextInput
                placeholder="Correo electrónico"
                autoCapitalize="none"
                keyboardType="email-address"

              />
            </View>

            {/* Nombre */}
            <Text>Nombre Completo</Text>
            <View style={styles.input}>
              <Ionicons name='person-outline' size={20} color='#000000ff' style={{ marginLeft: 4 }} />
              <TextInput
                placeholder="Nombre completo"
              />
            </View>
            {/* Teléfono */}
            <Text>Número de teléfono</Text>
            <View style={styles.input}>
              <Ionicons name='call-outline' size={20} color='#000000ff' style={{ marginLeft: 4 }} />
              <TextInput
                placeholder="Número de teléfono"
                keyboardType="phone-pad"

              />
            </View>
            {/* Fecha de nacimiento */}
            <Text>Fecha de Nacimiento</Text>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={styles.dateInputContainer}
            >
              <Ionicons name='calendar-outline' size={20} color='#000000ff' style={styles.calendarIcon} />
              <Text style={styles.dateText}>
                {date.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChange}
                maximumDate={new Date()}
              />
            )}

            {/* Contraseña */}
            <Text>Contraseña</Text>
            <View style={styles.input}>
              <Ionicons name='lock-closed-outline' size={20} color='#000000ff' style={{ marginLeft: 4 }} />
              <TextInput
                placeholder="Contraseña"
                secureTextEntry
              />
            </View>
            {/* Botón */}
            <TouchableOpacity
              style={styles.boton}
              onPress={() => navigate('Home')}
            >
              <Text style={styles.botonTexto}>Registrarse</Text>
            </TouchableOpacity>
            {/* Botón */}
            <TouchableOpacity
              style={styles.boton}
              onPress={() => navigate('Home')}
            >
              <Text style={styles.botonTexto}>Volver al Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground >
  );
};

export default RegisterForm;

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', margin: 10 },
  formContainer: {
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#005C41',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 25,
    gap: 10,
    padding: 5,
    marginBottom: 15,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
  },

  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },

  calendarIcon: {
    marginLeft: 4,
    marginRight: 8,
  },
  boton: {
    backgroundColor: '#2e7040',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  botonTexto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
