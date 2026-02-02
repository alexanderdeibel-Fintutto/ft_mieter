import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// KfW Förderung - Find matching subsidies for property improvements
// KfW is the German development bank

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { improvement_type, building_age, energy_class, budget } = payload;

    // Mock KfW programs
    const programs = [
      {
        id: 'kfw_261',
        name: 'KfW 261 - Energieeffizient Bauen und Sanieren',
        subsidy_percent: 45,
        max_subsidy: 120000,
        requirements: 'EH 55 oder besser',
      },
      {
        id: 'kfw_262',
        name: 'KfW 262 - Energieeffizient Sanieren',
        subsidy_percent: 30,
        max_subsidy: 60000,
        requirements: 'Einzelmaßnahmen möglich',
      },
      {
        id: 'kfw_270',
        name: 'KfW 270 - Energieeffizient Bauen',
        subsidy_percent: 35,
        max_subsidy: 100000,
        requirements: 'Neubauten nur',
      },
    ];

    // Filter based on inputs
    const matching_programs = programs.filter((p) => {
      if (improvement_type === 'neubau' && !p.name.includes('Bauen')) return false;
      if (improvement_type === 'sanierung' && !p.name.includes('Sanieren')) return false;
      return true;
    });

    return Response.json({
      success: true,
      improvement_type,
      matching_programs,
      recommendation: matching_programs[0] || null,
      next_step: 'Energieberater kontaktieren',
    });
  } catch (error) {
    console.error(`KfW error: ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
});