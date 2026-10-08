require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || process.env.NOT_PORT || 4004;

app.listen(PORT, () => {
  console.log(`[notifications-service] Servidor corriendo en http://localhost:${PORT}`);
});
