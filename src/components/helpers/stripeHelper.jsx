import { base44 } from '@/api/base44Client';

export async function startCheckout(stripePriceId, mode = 'subscription') {
    try {
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.split('/').slice(0, 3).join('/');

        const response = await base44.functions.invoke('createStripeCheckout', {
            stripe_price_id: stripePriceId,
            success_url: `${baseUrl}/billing-success`,
            cancel_url: currentUrl,
            mode
        });

        if (response.data.session_url) {
            window.location.href = response.data.session_url;
        }

        return response.data;
    } catch (error) {
        console.error('Checkout failed:', error);
        throw error;
    }
}

export function formatPrice(amount, currency = 'EUR') {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency
    }).format(amount);
}

export function getUpgradeUrl(appId, tier) {
    const tierMap = {
        'basic': 'basic',
        'pro': 'pro',
        'business': 'business'
    };
    return `/pricing?app=${appId}&tier=${tierMap[tier] || tier}`;
}