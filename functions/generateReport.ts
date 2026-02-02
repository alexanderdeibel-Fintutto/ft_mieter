import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 12: Advanced Reporting & Data Export System
 * Generiert PDF/Excel Reports basierend auf Daten-Queries
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            report_type,      // 'payments', 'tenants', 'properties', 'maintenance', 'custom'
            organization_id,
            format,           // 'pdf', 'excel', 'csv'
            filters,          // Query-Filter
            date_from,
            date_to,
            columns,          // Spalten für Custom Reports
            title
        } = await req.json();

        if (!report_type || !organization_id || !format) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Daten basierend auf Report-Typ laden
        let data = [];
        
        switch (report_type) {
            case 'payments':
                data = await getPaymentsData(base44, organization_id, { date_from, date_to, ...filters });
                break;
            case 'tenants':
                data = await getTenantsData(base44, organization_id, filters);
                break;
            case 'properties':
                data = await getPropertiesData(base44, organization_id, filters);
                break;
            case 'maintenance':
                data = await getMaintenanceData(base44, organization_id, { date_from, date_to, ...filters });
                break;
            case 'custom':
                data = await getCustomData(base44, organization_id, filters);
                break;
        }

        // Report generieren basierend auf Format
        let fileContent, fileType, fileName;

        if (format === 'csv') {
            const csv = generateCSV(data, columns || Object.keys(data[0] || {}));
            fileContent = csv;
            fileType = 'text/csv';
            fileName = `${report_type}_${new Date().toISOString().split('T')[0]}.csv`;
        } else if (format === 'excel') {
            // Vereinfacht: Excel über CSV (für vollständiges Excel: Library wie xlsx nötig)
            const csv = generateCSV(data, columns || Object.keys(data[0] || {}));
            fileContent = csv;
            fileType = 'application/vnd.ms-excel';
            fileName = `${report_type}_${new Date().toISOString().split('T')[0]}.xlsx`;
        } else if (format === 'pdf') {
            // PDF generieren
            fileContent = `Report: ${title || report_type}\n\nGenerated: ${new Date().toLocaleString('de-DE')}\n\n`;
            fileContent += generatePDFContent(data, columns);
            fileType = 'application/pdf';
            fileName = `${report_type}_${new Date().toISOString().split('T')[0]}.pdf`;
        }

        // Report in DB speichern
        const report = await base44.asServiceRole.entities.Report.create({
            organization_id: organization_id,
            user_id: user.id,
            report_type: report_type,
            title: title || `${report_type} Report`,
            format: format,
            file_name: fileName,
            record_count: data.length,
            generated_at: new Date().toISOString()
        });

        return Response.json({
            report_id: report.id,
            file_name: fileName,
            record_count: data.length,
            file_content: fileContent
        });
    } catch (error) {
        console.error('Report generation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function getPaymentsData(base44, organizationId, filters) {
    let payments = await base44.asServiceRole.entities.PaymentTransaction.filter({
        ...filters
    });

    return payments.map(p => ({
        'Datum': new Date(p.created_date).toLocaleDateString('de-DE'),
        'Betrag': `€${p.amount.toFixed(2)}`,
        'Typ': p.type,
        'Status': p.status,
        'Referenz': p.reference,
        'User': p.user_id
    }));
}

async function getTenantsData(base44, organizationId, filters) {
    let tenants = await base44.asServiceRole.entities.Tenant.filter({
        organization_id: organizationId,
        ...filters
    });

    return tenants.map(t => ({
        'Name': `${t.first_name} ${t.last_name}`,
        'Email': t.email,
        'Telefon': t.phone || '-',
        'Erstellt': new Date(t.created_date).toLocaleDateString('de-DE')
    }));
}

async function getPropertiesData(base44, organizationId, filters) {
    let buildings = await base44.asServiceRole.entities.Building.filter({
        organization_id: organizationId,
        ...filters
    });

    return buildings.map(b => ({
        'Name': b.name,
        'Adresse': `${b.address?.street} ${b.address?.zip} ${b.address?.city}`,
        'Einheiten': b.unit_count || 0,
        'Status': b.is_active ? 'Aktiv' : 'Inaktiv'
    }));
}

async function getMaintenanceData(base44, organizationId, filters) {
    let tasks = await base44.asServiceRole.entities.MaintenanceTask.filter({
        ...filters
    });

    return tasks.map(t => ({
        'Titel': t.title,
        'Kategorie': t.category,
        'Priorität': t.priority,
        'Status': t.status,
        'Fällig': t.due_date ? new Date(t.due_date).toLocaleDateString('de-DE') : '-'
    }));
}

async function getCustomData(base44, organizationId, filters) {
    // Flexibel für Custom Reports
    return [];
}

function generateCSV(data, columns) {
    if (data.length === 0) return '';
    
    const headers = columns.join(',');
    const rows = data.map(row => 
        columns.map(col => {
            const value = row[col] || '';
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
    );
    
    return [headers, ...rows].join('\n');
}

function generatePDFContent(data, columns) {
    if (data.length === 0) return 'Keine Daten verfügbar.\n';
    
    let content = '';
    content += `Anzahl Einträge: ${data.length}\n\n`;
    
    // Simple Table
    columns = columns || Object.keys(data[0] || {});
    content += columns.join(' | ') + '\n';
    content += '-'.repeat(100) + '\n';
    
    data.forEach(row => {
        content += columns.map(col => row[col] || '-').join(' | ') + '\n';
    });
    
    return content;
}