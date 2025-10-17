import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import background from '../assets/Backgrounds/backgroundLogin.jpg'; 
import logo from '../assets/logos/logo1.png'; 


export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      nav('/');
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Error de autenticación');
    }
  };

  return (
    <div style={styles.container}>
      {/* Logo */}
      <div style={styles.left}>
        <img src={logo} alt="ReColectApp" style={styles.logo} />
      </div>

      {/* Formulario */}
      <div style={styles.right}>
        <form onSubmit={onSubmit} style={styles.form}>
          <h2>Ingresar</h2>
          {!!err && <div className="error">{err}</div>}
          <label>Email</label>
          <input style={styles.input} placeholder='Ingrese su Correo' value={email} onChange={e => setEmail(e.target.value)} type="email" required />
          <label>Password</label>
          <input style={styles.input} placeholder='Ingrese su Contraseña' value={password} onChange={e => setPassword(e.target.value)} type="password" required />
          <button style={styles.button} type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundImage: `url(${background})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    padding: '0 5vw',
  },
  left: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  logo: {
    width: '400px',
    height: 'auto',
  },
  form: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    width: '350px',
    color: '#ffffffff',
    padding: '2rem',
    borderRadius: '1rem',
    gap: '8px',
  },
  input:{
    padding: '10px',
    border: 'none',
    borderRadius: '25px',
    fontSize: '16px',
    backgroundColor: '#f9f9f9',
   },
  button:{
    padding: '10px',
    border: 'none',
    borderRadius: '35px',
    fontSize: '16px',
    backgroundColor: '#bcc31c',
    color: '#fff',
    cursor: 'pointer',    
   }
};
