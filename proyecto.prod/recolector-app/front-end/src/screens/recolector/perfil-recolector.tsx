// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import { verPerfil } from '../../api/services/usuario-service';

// export default function PerfilUsuario() {
//   const [usuario, setUsuario] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const cargarPerfil = async () => {
//       try {
//         const data = await verPerfil();
//         setUsuario(data);
//       } catch (error) {
//         console.error('Error al cargar perfil:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     cargarPerfil();
//   }, []);

//   if (loading) {
//     return <ActivityIndicator style={{ flex: 1 }} size="large" />;
//   }

//   if (!usuario) {
//     return (
//       <View style={styles.container}>
//         <Text>No se pudo cargar el perfil</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>ReciclApp</Text>
//       </View>

//       <View style={styles.avatarContainer}>
//         <Icon name="user-circle" size={100} color="#b0b0b0" />
//         <Text style={styles.profileTitle}>Perfil</Text>
//       </View>

//       <View style={styles.row}>
//         <Text style={styles.label}>Nombre y apellido:</Text>
//         <Text style={styles.value}>{usuario.nombre_completo || 'Sin datos'}</Text>
//       </View>
//       <View style={styles.row}>
//         <Text style={styles.label}>Email:</Text>
//         <Text style={styles.value}>{usuario.email || 'Sin datos'}</Text>
//       </View>
//       <View style={styles.row}>
//         <Text style={styles.label}>Teléfono:</Text>
//         <Text style={styles.value}>{usuario.telefono || 'Sin datos'}</Text>
//       </View>
//       <View style={styles.row}>
//         <Text style={styles.label}>Fecha de ingreso:</Text>
//         <Text style={styles.value}>{usuario.fecha_ingreso || 'Sin datos'}</Text>
//       </View>
//       <View style={styles.row}>
//         <Text style={styles.label}>Municipio actual:</Text>
//         <Text style={styles.value}>{usuario.municipio_actual || 'Sin datos'}</Text>
//       </View>

//       <TouchableOpacity style={styles.button}>
//         <Text style={styles.buttonText}>Solicitar usuario premium</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }
// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     backgroundColor: '#ffffff',
//     padding: 10,
//     paddingTop: 40, // <-- aumenta este valor para bajar más el contenido
//   },
//   header: {
//     backgroundColor: '#FFD740',
//     paddingVertical: 16,
//     alignItems: 'center',
//     marginBottom: 20,
//     borderRadius: 10,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#ffffff',
//   },
//   avatarContainer: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   profileTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 10,
//   },
//   row: {
//     marginBottom: 12,
//   },
//   label: {
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   value: {
//     backgroundColor: '#e0e0e0',
//     padding: 8,
//     borderRadius: 8,
//   },
//   button: {
//     backgroundColor: '#4287f5',
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#ffffff',
//     fontWeight: 'bold',
//   },
// });
