import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileWarning, SlidersHorizontal } from 'lucide-react';

// German Localization for Tooltip and Legend
const formatNumber = (num) => {
  if (num === undefined || num === null) return 'N/A';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(num);
};

// Main App Component
export default function App() {
  // --- STATE MANAGEMENT ---
  const [initialGrossSalary, setInitialGrossSalary] = React.useState(40000);
  const [salaryGrowthRate, setSalaryGrowthRate] = React.useState(3);
  const [monthlyExpenses, setMonthlyExpenses] = React.useState(1500);
  const [expensesGrowthRate, setExpensesGrowthRate] = React.useState(2);
  const [savingsRate, setSavingsRate] = React.useState(80);
  const [initialAssets, setInitialAssets] = React.useState(60000);
  const [investmentReturnRate, setInvestmentReturnRate] = React.useState(6);
  const [inflationRate, setInflationRate] = React.useState(2);
  const [inheritanceAmount, setInheritanceAmount] = React.useState(150000);
  const [inheritanceYear, setInheritanceYear] = React.useState(2045);

  const [projectionData, setProjectionData] = React.useState([]);
  const [accumulationData, setAccumulationData] = React.useState([]);
  const [retirementData, setRetirementData] = React.useState([]);

  // --- CALCULATION LOGIC ---

  const calculateNetSalary = (grossSalary) => {
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
  };

  const runProjection = React.useCallback(() => {
    let currentAssets = Number(initialAssets);
    let currentGrossSalary = Number(initialGrossSalary);
    let currentAnnualExpenses = Number(monthlyExpenses) * 12;
    const birthYear = 1996; 
    const retirementStartYear = 2065; // Corrected retirement start year
    let lastAnnualNetSalary = 0;
    
    const fullData = Array.from({ length: 71 }, (_, i) => {
      const year = new Date().getFullYear() + i;
      const age = year - birthYear;
      
      let grossSalary = 0, netSalary = 0, annualSavings = 0, monthlyNetSalary = 0, monthlyDisposableIncome = 0, monthlySavingsAmount = 0, investmentGains = 0;
      let retirementWithdrawal = 0;

      investmentGains = currentAssets * (Number(investmentReturnRate) / 100);

      if (year < retirementStartYear) {
        if (i > 0) {
          currentGrossSalary *= 1 + (Number(salaryGrowthRate) / 100);
          currentAnnualExpenses *= 1 + (Number(expensesGrowthRate) / 100);
        }
        
        const result = calculateNetSalary(currentGrossSalary);
        grossSalary = currentGrossSalary;
        netSalary = result.netSalary;
        lastAnnualNetSalary = netSalary;

        const annualDisposableIncome = netSalary - currentAnnualExpenses;
        annualSavings = annualDisposableIncome > 0 ? annualDisposableIncome * (Number(savingsRate) / 100) : 0;
        
        monthlyNetSalary = netSalary / 12;
        const monthlyExpensesValue = currentAnnualExpenses / 12;
        monthlyDisposableIncome = monthlyNetSalary - monthlyExpensesValue;
        monthlySavingsAmount = monthlyDisposableIncome > 0 ? monthlyDisposableIncome * (Number(savingsRate) / 100) : 0;

        currentAssets += investmentGains + annualSavings;
      } else {
        retirementWithdrawal = lastAnnualNetSalary;
        currentAssets += investmentGains - retirementWithdrawal;
      }

      if (year === Number(inheritanceYear)) {
          currentAssets += Number(inheritanceAmount);
      }
      
      if (currentAssets < 0) currentAssets = 0;

      const inflationFactor = Math.pow(1 + (Number(inflationRate) / 100), i);
      const realTotalAssets = currentAssets / inflationFactor;

      return {
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
        investmentGains: Math.round(investmentGains),
      };
    });

    setProjectionData(fullData);
    setAccumulationData(fullData.filter(d => d.year < retirementStartYear));
    setRetirementData(fullData.filter(d => d.year >= retirementStartYear && d.totalAssets > 0));
  }, [initialGrossSalary, salaryGrowthRate, monthlyExpenses, expensesGrowthRate, savingsRate, initialAssets, investmentReturnRate, inheritanceAmount, inheritanceYear, inflationRate]);

  React.useEffect(() => { runProjection(); }, [runProjection]);

  const InputField = ({ label, value, setValue, unit, type = "number" }) => (
    <div className="flex-1 min-w-[150px]">
      <label className="block text-sm font-medium text-gray-400">{label}</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input type={type} value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" />
        {unit && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">{unit}</div>}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="p-4 sm:p-6 lg:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Finanzieller Vermögensrechner</h1>
          <p className="mt-2 text-lg text-gray-400">Prognostizieren Sie Ihre finanzielle Zukunft über den gesamten Lebenszyklus.</p>
        </header>

        {/* Sticky Parameter Box */}
        <div className="sticky top-0 z-10 bg-gray-900 py-4">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 flex items-center"><SlidersHorizontal className="mr-2 h-5 w-5"/>Ihre Parameter</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <InputField label="Start Bruttogehalt (jährl.)" value={initialGrossSalary} setValue={setInitialGrossSalary} unit="€" />
                    <InputField label="Gehaltswachstum p.a." value={salaryGrowthRate} setValue={setSalaryGrowthRate} unit="%" />
                    <InputField label="Lebenskosten (monatl.)" value={monthlyExpenses} setValue={setMonthlyExpenses} unit="€" />
                    <InputField label="Kostensteigerung p.a." value={expensesGrowthRate} setValue={setExpensesGrowthRate} unit="%" />
                    <InputField label="Sparrate (von Übrigem)" value={savingsRate} setValue={setSavingsRate} unit="%" />
                    <InputField label="Startvermögen" value={initialAssets} setValue={setInitialAssets} unit="€" />
                    <InputField label="Kapitalmarktrendite p.a." value={investmentReturnRate} setValue={setInvestmentReturnRate} unit="%" />
                    <InputField label="Inflationsrate p.a." value={inflationRate} setValue={setInflationRate} unit="%" />
                    <InputField label="Erbsumme" value={inheritanceAmount} setValue={setInheritanceAmount} unit="€" />
                    <InputField label="Jahr des Erbes" value={inheritanceYear} setValue={setInheritanceYear} type="number" />
                </div>
            </div>
        </div>

        {/* Scrollable Content */}
        <main className="p-4 sm:p-6 lg:p-8 pt-0">
            <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg my-8">
               <h2 className="text-xl font-semibold mb-4">Vermögensentwicklung über den Lebenszyklus</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                  <XAxis dataKey="year" stroke="#a0aec0" />
                  <YAxis tickFormatter={(value) => new Intl.NumberFormat('de-DE', { notation: 'compact', compactDisplay: 'short' }).format(value)} stroke="#a0aec0" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }} formatter={(value, name) => [formatNumber(value), name]} />
                  <Legend />
                  <Line type="monotone" name="Vermögen (nominal)" dataKey="totalAssets" stroke="#48bb78" strokeWidth={3} dot={false} />
                  <Line type="monotone" name="Vermögen (kaufkraftbereinigt)" dataKey="realTotalAssets" stroke="#f6ad55" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                  <Line type="monotone" name="Nettogehalt (jährl.)" dataKey="netSalary" stroke="#9f7aea" strokeWidth={2} dot={false} opacity={0.7}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-yellow-900/20 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg relative mb-8" role="alert">
              <strong className="font-bold flex items-center"><FileWarning className="mr-2 h-5 w-5" /> Wichtiger Hinweis:</strong>
              <span className="block sm:inline ml-1">Dies ist eine vereinfachte Modellrechnung. Annahmen: Renteneintritt nach der Ansparphase, Lebenskosten in der Rente entsprechen dem letzten Nettogehalt. Keine Steuern auf Kapitalerträge berücksichtigt.</span>
            </div>
    
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
              <h2 className="text-xl font-semibold p-6">Ansparphase bis zur Rente</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-4 font-semibold">Jahr</th><th className="p-4 font-semibold">Alter</th><th className="p-4 font-semibold">Brutto (jährl.)</th><th className="p-4 font-semibold">Netto (monatl.)</th><th className="p-4 font-semibold">Kosten (monatl.)</th><th className="p-4 font-semibold">Übrig (monatl.)</th><th className="p-4 font-semibold">Sparbetrag (monatl.)</th><th className="p-4 font-semibold">Vermögen (Ende)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accumulationData.map((d, index) => (
                      <tr key={d.year} className={`border-t border-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'} ${d.year === Number(inheritanceYear) ? 'bg-blue-900/50' : ''}`}>
                        <td className="p-4">{d.year}</td><td className="p-4">{d.age}</td><td className="p-4">{formatNumber(d.grossSalary)}</td><td className="p-4 font-semibold">{formatNumber(d.monthlyNetSalary)}</td><td className="p-4 text-red-400">{formatNumber(d.monthlyExpenses)}</td><td className="p-4">{formatNumber(d.monthlyDisposableIncome)}</td><td className="p-4 text-green-400">{formatNumber(d.monthlySavingsAmount)}</td><td className="p-4 font-bold text-green-300">{formatNumber(d.totalAssets)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
    
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <h2 className="text-xl font-semibold p-6">Entnahmephase in der Rente</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-4 font-semibold">Jahr</th><th className="p-4 font-semibold">Alter</th><th className="p-4 font-semibold">Lebenskosten (jährl.)</th><th className="p-4 font-semibold">Zinserträge</th><th className="p-4 font-semibold">Vermögen (Ende)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retirementData.map((d, index) => (
                      <tr key={d.year} className={`border-t border-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'}`}>
                        <td className="p-4">{d.year}</td><td className="p-4">{d.age}</td><td className="p-4 text-red-400">{formatNumber(d.retirementWithdrawal)}</td><td className="p-4 text-green-400">{formatNumber(d.investmentGains)}</td><td className="p-4 font-bold text-green-300">{formatNumber(d.totalAssets)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <footer className="text-center mt-12 text-gray-500 text-sm">
                <p>Erstellt mit React und Recharts. Berechnungen sind Schätzungen.</p>
            </footer>
        </main>
      </div>
    </div>
  );
}

