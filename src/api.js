app.options('/api/registro', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(200);
});



export const registrarUsuario = async (datos) => {
  try {
    const respuesta = await fetch('https://sistema-de-gestion-backend.onrender.com/users', {  // Asegúrate de usar /users
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    if (!respuesta.ok) throw new Error('Error en la solicitud');

    return await respuesta.json();
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return null;
  }
};