import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// OpenImmo is the German standard for real estate data
// This function handles XML parsing and data mapping

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { xml_url, building_id, action = 'import' } = payload;

    // Fetch XML from OpenImmo provider
    const xmlResponse = await fetch(xml_url);
    if (!xmlResponse.ok) {
      throw new Error(`Failed to fetch OpenImmo XML: ${xmlResponse.statusText}`);
    }

    const xmlText = await xmlResponse.text();

    // Parse XML (simplified - in production use xml2js)
    const properties = extractPropertiesFromXML(xmlText);

    // Import/update properties in database
    if (action === 'import') {
      for (const prop of properties) {
        await base44.entities.Building.create({
          name: prop.title,
          street: prop.street,
          house_number: prop.house_number,
          zip: prop.zip,
          city: prop.city,
          created_by: user.email,
          status: 'active',
        });
      }
    }

    console.log(`✓ OpenImmo sync completed: ${properties.length} properties`);

    return Response.json({
      success: true,
      action,
      properties_count: properties.length,
      properties,
    });
  } catch (error) {
    console.error(`OpenImmo sync error: ${error.message}`);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});

function extractPropertiesFromXML(xmlText) {
  // Simplified XML parsing
  // In production, use: npm:xml2js
  const properties = [];

  const propertyMatches = xmlText.match(/<immobilie>(.*?)<\/immobilie>/gs) || [];

  propertyMatches.forEach((match) => {
    const title = extractTag(match, 'objekttitel');
    const street = extractTag(match, 'strasse');
    const house_number = extractTag(match, 'hausnummer');
    const zip = extractTag(match, 'plz');
    const city = extractTag(match, 'ort');

    if (title && street && zip && city) {
      properties.push({
        title,
        street,
        house_number,
        zip,
        city,
      });
    }
  });

  return properties;
}

function extractTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}>([^<]*)</${tagName}>`);
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}