const axios = require('axios');
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 10000,
});
const getFeaturedVehicles = () => api.get('/vehicles/featured');

(async () => {
  try {
    console.log('🔹 Simulando Home.jsx useEffect...');
    console.log('');
    const response = await getFeaturedVehicles();
    console.log('Response status:', response.status);
    console.log('Response.data type:', Array.isArray(response.data) ? 'ARRAY' : typeof response.data);
    console.log('Response.data length:', response.data.length);
    console.log('');
    if (response.data && response.data.length > 0) {
      console.log('✅ Condición response.data && response.data.length > 0 = TRUE');
      const formatted = response.data.map(v => ({
        id: v.id,
        name: `${v.brand} ${v.model}`,
        price_per_day: v.price_per_day,
        image: v.image_url
      }));
      console.log('');
      console.log('Formatted data:');
      formatted.forEach(v => {
        console.log(`  - ${v.name}: $${v.price_per_day}/día`);
      });
      console.log('');
      console.log('✅ Home.jsx DEBERÍA mostrar estos 3 vehículos EN EL NAVEGADOR');
    } else {
      console.log('❌ Condición FALSE - datos NO se cargarían');
    }
  } catch (err) {
    console.error('❌ ERROR:', err.message);
  }
  process.exit(0);
})();
