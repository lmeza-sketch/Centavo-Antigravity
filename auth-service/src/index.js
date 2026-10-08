require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`[auth-service] Servidor corriendo en http://localhost:${PORT}`);
});
