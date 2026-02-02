const APP_ID = 'mieterapp';
const SUPABASE_URL = 'https://aaefocdqgdgexkcrjhks.supabase.co';
const KI_SERVICE_URL = `${SUPABASE_URL}/functions/v1/fintutto-ki-service`;
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA0NzAsImV4cCI6MjA4NDMzNjQ3MH0.qsLTEZo7shbafWY9w4Fo7is9GDW-1Af1wup_iCy2vVQ';

Deno.serve(async (req) => {
    try {
        const { message, context, user_tier = 'free' } = await req.json();

        const response = await fetch(`${KI_SERVICE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ANON_KEY}`,
                'x-app-source': APP_ID,
                'x-user-tier': user_tier,
            },
            body: JSON.stringify({
                feature: 'mietrecht',
                message,
                context,
            })
        });

        const data = await response.json();
        return Response.json(data);

    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});