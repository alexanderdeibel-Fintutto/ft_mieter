import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const SUPABASE_URL = 'https://aaefocdqgdgexkcrjhks.supabase.co';
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, status, priority, assignedTo, notes } = body;

    if (!taskId) {
      return Response.json({ error: 'taskId erforderlich' }, { status: 400 });
    }

    const updates = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (assignedTo) updates.assigned_to = assignedTo;
    if (notes) updates.notes = notes;

    // Task aktualisieren
    const { data: task, error: updateError } = await supabase
      .from('maintenance_tasks')
      .update({
        ...updates,
        updated_date: new Date().toISOString(),
        updated_by_user_id: user.id
      })
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Email an Mieter bei Status-Änderung senden
    if (status) {
      try {
        const { data: tenant } = await supabase
          .from('v_tenant_management')
          .select('tenant_email')
          .eq('unit_id', task.unit_id)
          .single();

        if (tenant?.tenant_email) {
          await base44.integrations.Core.SendEmail({
            to: tenant.tenant_email,
            subject: `Schadensmeldung aktualisiert: ${task.title}`,
            body: `
              Deine Schadensmeldung "${task.title}" hat einen neuen Status: ${status}
              ${notes ? `Notiz: ${notes}` : ''}
            `
          });
        }
      } catch (emailError) {
        console.warn('Failed to send email:', emailError);
      }
    }

    return Response.json({
      success: true,
      task,
      message: 'Aufgabe aktualisiert'
    });
  } catch (error) {
    console.error('Error in updateMaintenanceTask:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});