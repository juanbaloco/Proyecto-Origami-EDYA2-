import { useState } from 'react';
import { apiLogin, saveToken } from '../api'; // Importamos la nueva función apiLogin y saveToken
import { useNavigate } from 'react-router-dom'; // Necesitas instalar react-router-dom

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Hook para navegar tras el login

    function onChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        setError('');
        setSending(true);

        // Validación básica en cliente
        if (!form.email || !form.password) {
            setError('Todos los campos son obligatorios.');
            setSending(false);
            return;
        }

        try {
            // Llama a la API de login
            const data = await apiLogin(form.email, form.password);
            
            // Si el login es exitoso, apiLogin ya guarda el token con saveToken(data.access_token)
            
            // Navegación consistente: redirige a la lista de productos
            navigate('/productos'); 

        } catch (err) {
            // Muestra mensaje de fracaso
            setError(err.message || 'Credenciales inválidas. Inténtalo de nuevo.');
            
        } finally {
            setSending(false);
        }
    }

    // Nota: El formulario de Registro sería muy similar, llamando a otra función de la API (ej: apiRegister)
    // y manejando un estado de éxito en lugar de la navegación directa.

    return (
        <section className="card">
            <h2>Inicio de Sesión</h2>
            <form onSubmit={onSubmit}>
                <label>Correo Electrónico
                    <input 
                        type="email" 
                        name="email" 
                        value={form.email} 
                        onChange={onChange} 
                        required 
                    />
                </label>
                <label>Contraseña
                    <input 
                        type="password" 
                        name="password" 
                        value={form.password} 
                        onChange={onChange} 
                        required 
                    />
                </label>
                
                <div className="row">
                    {/* Botón con estado de loading */}
                    <button type="submit" disabled={sending}>
                        {sending ? "Iniciando..." : "Ingresar"}
                    </button>
                    {/* Mensaje de error */}
                    {error && <span className="error">{error}</span>}
                </div>
            </form>
            
            <p className="muted">
                ¿No tienes cuenta? <a href="/registro">Regístrate aquí</a>.
            </p>
        </section>
    );
}