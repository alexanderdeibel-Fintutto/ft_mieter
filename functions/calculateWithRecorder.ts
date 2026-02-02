import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 5: Unified Calculator Backend
 * Führt Berechnungen durch und speichert sie für spätere Referenz
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { calculator_type, input_data, config } = await req.json();

        if (!calculator_type || !input_data) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        let results;

        // Führe richtige Berechnung basierend auf Typ aus
        switch (calculator_type) {
            case 'rendite':
                results = calculateRendite(input_data);
                break;
            case 'nebenkosten':
                results = calculateNebenkosten(input_data);
                break;
            case 'mieterhoehung':
                results = calculateMieterhoehung(input_data);
                break;
            case 'kaution':
                results = calculateKaution(input_data);
                break;
            default:
                return Response.json({ error: 'Unknown calculator type' }, { status: 400 });
        }

        // Speichere Berechnung in Datenbank
        await base44.entities.RechnerCalculation.create({
            user_id: user.id,
            calculator_type: calculator_type,
            input_data: input_data,
            result_data: results,
            calculated_at: new Date().toISOString()
        });

        return Response.json({ 
            results: results,
            message: 'Calculation completed and saved'
        });
    } catch (error) {
        console.error('Calculation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateRendite(data) {
    const {
        purchase_price = 0,
        annual_rent = 0,
        annual_costs = 0,
        loan_amount = 0,
        loan_rate = 0,
        loan_years = 0
    } = data;

    const netIncome = annual_rent - annual_costs;
    const grossYield = (annual_rent / purchase_price) * 100;
    const netYield = (netIncome / purchase_price) * 100;
    
    let monthlyPayment = 0;
    if (loan_amount > 0) {
        const monthlyRate = loan_rate / 100 / 12;
        const months = loan_years * 12;
        monthlyPayment = (loan_amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                        (Math.pow(1 + monthlyRate, months) - 1);
    }

    return {
        annual_rent: annual_rent,
        annual_costs: annual_costs,
        net_income: netIncome,
        gross_yield: parseFloat(grossYield.toFixed(2)),
        net_yield: parseFloat(netYield.toFixed(2)),
        monthly_loan_payment: parseFloat(monthlyPayment.toFixed(2)),
        equity_investment: purchase_price - loan_amount
    };
}

function calculateNebenkosten(data) {
    const {
        living_area = 0,
        cold_rent = 0,
        utilities_per_sqm = 0,
        heating_per_sqm = 0,
        water_per_sqm = 0,
        other_per_sqm = 0
    } = data;

    const heatingCosts = living_area * heating_per_sqm;
    const waterCosts = living_area * water_per_sqm;
    const otherCosts = living_area * other_per_sqm;
    const utilitiesCosts = living_area * utilities_per_sqm;
    
    const totalNebenkosten = heatingCosts + waterCosts + otherCosts + utilitiesCosts;
    const warmRent = cold_rent + (totalNebenkosten / 12);

    return {
        living_area: living_area,
        heating_costs_annual: parseFloat(heatingCosts.toFixed(2)),
        water_costs_annual: parseFloat(waterCosts.toFixed(2)),
        utilities_costs_annual: parseFloat(utilitiesCosts.toFixed(2)),
        other_costs_annual: parseFloat(otherCosts.toFixed(2)),
        total_nebenkosten_annual: parseFloat(totalNebenkosten.toFixed(2)),
        total_nebenkosten_monthly: parseFloat((totalNebenkosten / 12).toFixed(2)),
        warm_rent_monthly: parseFloat(warmRent.toFixed(2))
    };
}

function calculateMieterhoehung(data) {
    const {
        current_rent = 0,
        indexation_rate = 0,
        similar_apartments_avg_rent = 0,
        increase_percentage = 0
    } = data;

    const indexationIncrease = current_rent * (indexation_rate / 100);
    const comparableIncrease = similar_apartments_avg_rent - current_rent;
    const percentageIncrease = current_rent * (increase_percentage / 100);

    return {
        current_rent: current_rent,
        indexation_increase: parseFloat(indexationIncrease.toFixed(2)),
        new_rent_after_indexation: parseFloat((current_rent + indexationIncrease).toFixed(2)),
        comparable_market_rent: parseFloat(similar_apartments_avg_rent.toFixed(2)),
        comparable_increase_potential: parseFloat(comparableIncrease.toFixed(2)),
        percentage_increase: parseFloat(percentageIncrease.toFixed(2)),
        new_rent_after_percentage: parseFloat((current_rent + percentageIncrease).toFixed(2))
    };
}

function calculateKaution(data) {
    const {
        cold_rent = 0,
        warm_rent = 0,
        deposit_months = 3
    } = data;

    const depositAmount = cold_rent * deposit_months;

    return {
        cold_rent: cold_rent,
        warm_rent: warm_rent,
        deposit_months: deposit_months,
        deposit_amount: parseFloat(depositAmount.toFixed(2)),
        monthly_savings_needed: parseFloat((depositAmount / 12).toFixed(2))
    };
}