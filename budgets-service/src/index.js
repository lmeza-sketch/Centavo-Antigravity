require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 4003;

app.listen(PORT, () => {
  console.log(`[budgets-service] Servidor corriendo en http://localhost:${PORT}`);
});
