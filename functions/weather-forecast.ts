import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Weather forecasts for property locations
// Used for maintenance planning (winter service, storm alerts)

const WEATHER_API_KEY = Deno.env.get('OPENWEATHERMAP_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { latitude, longitude, days = 7 } = payload;

    // Mock weather data
    const forecast = [];
    const now = Date.now();

    for (let i = 0; i < days; i++) {
      const date = new Date(now + i * 24 * 60 * 60 * 1000);
      const temp = Math.floor(Math.random() * 20 - 5); // -5 to 15°C
      const precipitation = Math.random() > 0.7 ? Math.floor(Math.random() * 20) : 0;

      forecast.push({
        date: date.toISOString().split('T')[0],
        temp_min: temp,
        temp_max: temp + 8,
        precipitation_mm: precipitation,
        wind_speed_kmh: Math.floor(Math.random() * 30),
        weather_type: precipitation > 10 ? 'rain' : temp < 0 ? 'snow' : 'clear',
        alerts:
          temp < -2
            ? ['Frostgefahr - Winterdienst einplanen']
            : precipitation > 15
              ? ['Starkregen erwartet']
              : [],
      });
    }

    return Response.json({
      success: true,
      location: { latitude, longitude },
      forecast,
      winter_service_needed: forecast.some((f) => f.temp_min < -2),
    });
  } catch (error) {
    console.error(`Weather error: ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
});