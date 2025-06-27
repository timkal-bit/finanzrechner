export const calculateNetSalary = (grossSalary) => {
    const healthInsuranceCeiling = 62100;
    const pensionInsuranceCeiling = 90600;
    const healthInsuranceRate = 0.073 + 0.0085;
    const nursingCareInsuranceRate = 0.023;
    const pensionInsuranceRate = 0.093;
    const unemploymentInsuranceRate = 0.013;
    
    const healthContribution = Math.min(grossSalary, healthInsuranceCeiling) * healthInsuranceRate;
    const nursingCareContribution = Math.min(grossSalary, healthInsuranceCeiling) * nursingCareInsuranceRate;
    const pensionContribution = Math.min(grossSalary, pensionInsuranceCeiling) * pensionInsuranceRate;
    const unemploymentContribution = Math.min(grossSalary, pensionInsuranceCeiling) * unemploymentInsuranceRate;
    const socialContributions = healthContribution + nursingCareContribution + pensionContribution + unemploymentContribution;

    const taxableIncome = grossSalary - socialContributions - 1264;
    const basicTaxFreeAllowance = 11604;
    let incomeTax = 0;

    if (taxableIncome > basicTaxFreeAllowance) {
        const y = (taxableIncome - basicTaxFreeAllowance) / 10000;
        if (taxableIncome <= 17005) { incomeTax = (979.18 * y + 1400) * y; } 
        else if (taxableIncome <= 66760) { const z = (taxableIncome - 17005) / 10000; incomeTax = (192.59 * z + 2397) * z + 975.79; } 
        else if (taxableIncome <= 277825) { incomeTax = 0.42 * taxableIncome - 10253.81; } 
        else { incomeTax = 0.45 * taxableIncome - 18588.56; }
    }
    
    const soliThreshold = 18130;
    let soli = 0;
    if (incomeTax > soliThreshold) {
       soli = Math.min(0.055 * incomeTax, 0.119 * (incomeTax - soliThreshold));
       if (incomeTax > 34332) { soli = 0.055 * incomeTax; }
    }
    const totalTax = incomeTax + soli;
    return { netSalary: grossSalary - socialContributions - totalTax };
}

export const calculateProjection = (inputs) => {
    if (inputs.isRetirementMode) {
        return calculateRetirementProjection(inputs);
    } else {
        return calculateAccumulationProjection(inputs);
    }
}

export const calculateAccumulationProjection = (inputs) => {
    let currentAssets = Number(inputs.initialAssets);
    let currentGrossSalary = Number(inputs.initialGrossSalary);
    let currentAnnualExpenses = Number(inputs.monthlyExpenses) * 12;
    const capitalGainsTaxRate = 0.25;
    const taxFreeAllowance = 1000;
    
    const projectionDuration = inputs.lifeExpectancy - inputs.currentAge;
    const retirementStartYear = new Date().getFullYear() + (inputs.retirementAge - inputs.currentAge);
    let lastAnnualNetSalary = 0;
    let assetsAtRetirement = 0;
    let evolvingRetirementExpenses = 0;
    let ageAtDepletion = null;
    
    const fullData = [];
    for (let i = 0; i <= projectionDuration; i++) {
        const year = new Date().getFullYear() + i;
        const age = inputs.currentAge + i;
        
        let grossSalary = 0, netSalary = 0, annualSavings = 0, monthlyNetSalary = 0, monthlyDisposableIncome = 0, monthlySavingsAmount = 0, investmentGains = 0;
        let retirementWithdrawal = 0, netInvestmentGains = 0, realRetirementWithdrawal = 0, coverageGap = 0;

        const assetsAtYearStart = currentAssets;
        investmentGains = assetsAtYearStart * (Number(inputs.investmentReturnRate) / 100);
        
        if (investmentGains > taxFreeAllowance) {
            netInvestmentGains = taxFreeAllowance + ((investmentGains - taxFreeAllowance) * (1 - capitalGainsTaxRate));
        } else {
            netInvestmentGains = investmentGains;
        }
        
        const inflationFactor = Math.pow(1 + (Number(inputs.inflationRate) / 100), i);

        if (year < retirementStartYear) {
            if (i > 0) {
                currentGrossSalary *= 1 + (Number(inputs.salaryGrowthRate) / 100);
                // Kostensteigerung durch Inflation abgebildet
                currentAnnualExpenses *= 1 + (Number(inputs.inflationRate) / 100);
            }
            
            const result = calculateNetSalary(currentGrossSalary);
            grossSalary = currentGrossSalary;
            netSalary = result.netSalary;
            lastAnnualNetSalary = netSalary;

            const annualDisposableIncome = netSalary - currentAnnualExpenses;
            annualSavings = annualDisposableIncome > 0 ? annualDisposableIncome * (Number(inputs.savingsRate) / 100) : 0;
            
            monthlyNetSalary = netSalary / 12;
            const monthlyExpensesValue = currentAnnualExpenses / 12;
            monthlyDisposableIncome = monthlyNetSalary - monthlyExpensesValue;
            monthlySavingsAmount = monthlyDisposableIncome > 0 ? monthlyDisposableIncome * (Number(inputs.savingsRate) / 100) : 0;

            currentAssets += netInvestmentGains + annualSavings;
        } else {
            if (assetsAtRetirement === 0) {
                assetsAtRetirement = currentAssets;
                // Verwende gewünschtes Renteneinkommen wenn angegeben
                const desiredAnnualRetirement = inputs.desiredMonthlyRetirement * 12;
                evolvingRetirementExpenses = desiredAnnualRetirement || lastAnnualNetSalary;
            } else {
                evolvingRetirementExpenses *= 1 + (Number(inputs.inflationRate) / 100);
            }
            
            retirementWithdrawal = evolvingRetirementExpenses;
            // Berücksichtige erwartete Rente
            const expectedAnnualPension = inputs.expectedPension * 12 * Math.pow(1 + (Number(inputs.inflationRate) / 100), Math.max(0, i - (inputs.retirementAge - inputs.currentAge)));
            const netWithdrawalNeeded = Math.max(0, retirementWithdrawal - expectedAnnualPension);
            
            currentAssets += netInvestmentGains - netWithdrawalNeeded;
            realRetirementWithdrawal = retirementWithdrawal / inflationFactor;
            coverageGap = netWithdrawalNeeded > netInvestmentGains ? netWithdrawalNeeded - netInvestmentGains : 0;
        }

        if (inputs.inheritanceEnabled && year === Number(inputs.inheritanceYear)) {
            currentAssets += Number(inputs.inheritanceAmount);
        }
        
        if (currentAssets <= 0 && ageAtDepletion === null) {
            ageAtDepletion = age;
        }
        if(currentAssets < 0) {
            currentAssets = 0;
        }
        
        const realTotalAssets = currentAssets / inflationFactor;

        fullData.push({
            year, age,
            grossSalary: Math.round(grossSalary),
            netSalary: Math.round(netSalary),
            monthlyNetSalary: Math.round(monthlyNetSalary),
            monthlyExpenses: Math.round(currentAnnualExpenses / 12),
            monthlyDisposableIncome: Math.round(monthlyDisposableIncome),
            monthlySavingsAmount: Math.round(monthlySavingsAmount),
            totalAssets: Math.round(currentAssets),
            realTotalAssets: Math.round(realTotalAssets),
            retirementWithdrawal: Math.round(retirementWithdrawal),
            realRetirementWithdrawal: Math.round(realRetirementWithdrawal),
            investmentGains: Math.round(investmentGains),
            netInvestmentGains: Math.round(netInvestmentGains),
            coverageGap: Math.round(coverageGap),
            assetsAtYearStart: Math.round(assetsAtYearStart)
        });
    }
    
    return fullData;
}

export const calculateRetirementProjection = (inputs) => {
    const currentAge = Number(inputs.retireeCurrentAge);
    const lifeExpectancy = Number(inputs.retireeLifeExpectancy);
    let currentAssets = Number(inputs.retireeCurrentAssets);
    let annualNetIncome = Number(inputs.retireeAnnualIncome);
    let annualExpenses = Number(inputs.retireeAnnualExpenses);
    const capitalGainsTaxRate = 0.25;
    const taxFreeAllowance = 1000;

    const fullData = [];
    const projectionDuration = lifeExpectancy - currentAge;
    
    for (let i = 0; i <= projectionDuration; i++) {
        const year = new Date().getFullYear() + i;
        const age = currentAge + i;
        
        if (i > 0) {
            annualExpenses *= 1 + (Number(inputs.inflationRate) / 100);
            annualNetIncome *= 1 + (Number(inputs.retireeIncomeGrowthRate) / 100);
        }
        const assetsAtYearStart = currentAssets;
        const investmentGains = assetsAtYearStart * (Number(inputs.investmentReturnRate) / 100);
        let netInvestmentGains = investmentGains;
        if(investmentGains > taxFreeAllowance) {
            netInvestmentGains = taxFreeAllowance + ((investmentGains - taxFreeAllowance) * (1 - capitalGainsTaxRate));
        }
        
        const totalAnnualIncome = annualNetIncome + netInvestmentGains;
        const coverageGap = annualExpenses > totalAnnualIncome ? annualExpenses - totalAnnualIncome : 0;
        
        currentAssets += totalAnnualIncome - annualExpenses;

        if (inputs.inheritanceEnabled && year === Number(inputs.inheritanceYear)) {
            currentAssets += Number(inputs.inheritanceAmount);
        }

        if (currentAssets < 0) {
            currentAssets = 0;
        }
        
        const inflationFactor = Math.pow(1 + (Number(inputs.inflationRate) / 100), i);
        
        fullData.push({
            year, age,
            totalAssets: Math.round(currentAssets),
            realTotalAssets: Math.round(currentAssets / inflationFactor),
            retirementWithdrawal: Math.round(annualExpenses),
            realRetirementWithdrawal: Math.round(annualExpenses / inflationFactor),
            investmentGains: Math.round(investmentGains),
            netInvestmentGains: Math.round(netInvestmentGains),
            coverageGap: Math.round(coverageGap),
            assetsAtYearStart: Math.round(assetsAtYearStart),
            annualNetIncome: Math.round(annualNetIncome),
        });
    }
   
    return fullData;
}
