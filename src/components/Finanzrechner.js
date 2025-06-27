import React, { useState, useEffect } from 'react';
import { calculateProjection } from '../utils/calculations';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import SliderInput from './SliderInput';
import ToggleSwitch from './ToggleSwitch';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, annotationPlugin);

const formatCurrency = (num) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(num);

const Finanzrechner = () => {
    const [inputs, setInputs] = useState({
        // Mode und Toggles
        isRetirementMode: false,
        inheritanceEnabled: false,
        
        // Accumulation Mode Inputs
        currentAge: 29,
        retirementAge: 69,
        lifeExpectancy: 95,
        initialGrossSalary: 40000,
        salaryGrowthRate: 3,
        monthlyExpenses: 2200,
        savingsRate: 80,
        initialAssets: 60000,
        
        // Retirement Mode Inputs
        retireeCurrentAge: 65,
        retireeLifeExpectancy: 95,
        retireeCurrentAssets: 500000,
        retireeAnnualIncome: 24000,
        retireeAnnualExpenses: 36000,
        retireeIncomeGrowthRate: 1.5,
        
        // Ziele und Rente
        desiredMonthlyRetirement: 3000,
        expectedPension: 1200,
        
        // Gemeinsame Parameter
        investmentReturnRate: 6,
        inflationRate: 2,
        
        // Erbschaft (optional)
        inheritanceAmount: 150000,
        inheritanceYear: 2045,
    });

    const [projectionData, setProjectionData] = useState([]);

    useEffect(() => {
        const data = calculateProjection(inputs);
        setProjectionData(data);
    }, [inputs]);

    const handleInputChange = (e) => {
        const { id, value, type, checked } = e.target;
        setInputs(prev => ({ 
            ...prev, 
            [id]: type === 'checkbox' ? checked : Number(value) 
        }));
    };

    const handleToggleChange = (e) => {
        const { id, checked } = e.target;
        setInputs(prev => ({ 
            ...prev, 
            [id]: checked 
        }));
    };

    const retirementStartYear = inputs.isRetirementMode 
        ? new Date().getFullYear() 
        : new Date().getFullYear() + (inputs.retirementAge - inputs.currentAge);
    const accumulationData = projectionData.filter(d => d.year < retirementStartYear);
    const retirementData = projectionData.filter(d => d.year >= retirementStartYear && d.totalAssets > 0);

    const chartData = {
        labels: projectionData.map(d => d.year),
        datasets: [
            {
                label: 'Vermögen (nominal)',
                data: projectionData.map(d => d.totalAssets),
                borderColor: '#007AFF',
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                fill: 'origin',
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#007AFF',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#ffffff',
                pointHoverBorderColor: '#007AFF',
                pointHoverBorderWidth: 3,
            },
            {
                label: 'Vermögen (kaufkraftbereinigt)',
                data: projectionData.map(d => d.realTotalAssets),
                borderColor: '#FF9500',
                backgroundColor: 'transparent',
                borderDash: [8, 4],
                fill: false,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#FF9500',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#ffffff',
                pointHoverBorderColor: '#FF9500',
                pointHoverBorderWidth: 3,
            },
            {
                label: 'Nettogehalt (jährlich)',
                data: projectionData.map(d => d.netSalary),
                borderColor: '#AF52DE',
                backgroundColor: 'transparent',
                fill: false,
                borderWidth: 2,
                borderDash: [4, 4],
                hidden: true,
                pointBackgroundColor: '#AF52DE',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#ffffff',
                pointHoverBorderColor: '#AF52DE',
                pointHoverBorderWidth: 3,
            },
            ...((!inputs.isRetirementMode) ? [{
                label: 'Renteneintritt',
                data: [],
                borderColor: '#FF3B30',
                backgroundColor: 'transparent',
                borderWidth: 3,
                pointRadius: 0,
                showLine: false,
                pointHoverRadius: 0,
            }] : [])
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index',
        },
        elements: {
            point: {
                radius: 0,
                hoverRadius: 6,
                hitRadius: 8,
            },
            line: {
                borderWidth: 3,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: {
                        family: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
                        size: 12,
                        weight: '500',
                    },
                    padding: 12,
                    callback: function(value) {
                        return new Intl.NumberFormat('de-DE', {
                            notation: 'compact',
                            compactDisplay: 'short',
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                        }).format(value);
                    }
                },
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: {
                        family: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
                        size: 12,
                        weight: '500',
                    },
                    padding: 12,
                    maxTicksLimit: 10,
                }
            }
        },
        plugins: {
            legend: {
                position: 'bottom',
                align: 'center',
                labels: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    font: {
                        family: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
                        size: 13,
                        weight: '500',
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                titleFont: {
                    family: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
                    size: 14,
                    weight: '600',
                },
                bodyFont: {
                    family: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
                    size: 13,
                    weight: '500',
                },
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatCurrency(context.parsed.y);
                        }
                        return label;
                    }
                }
            },
            annotation: {
                annotations: {
                    ...((!inputs.isRetirementMode) && {
                        retirementLine: {
                            type: 'line',
                            xMin: retirementStartYear,
                            xMax: retirementStartYear,
                            borderColor: '#FF3B30',
                            borderWidth: 3,
                            label: {
                                display: true,
                                content: `Renteneintritt (${inputs.retirementAge} Jahre)`,
                                position: 'start',
                                backgroundColor: 'rgba(255, 59, 48, 0.9)',
                                color: '#ffffff',
                                font: {
                                    family: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
                                    size: 12,
                                    weight: '500',
                                },
                                padding: 8,
                                cornerRadius: 6,
                            }
                        }
                    }),
                    ...(inputs.inheritanceEnabled && {
                        inheritanceLine: {
                            type: 'line',
                            xMin: inputs.inheritanceYear,
                            xMax: inputs.inheritanceYear,
                            borderColor: '#007AFF',
                            borderWidth: 2,
                            borderDash: [8, 4],
                            label: {
                                display: true,
                                content: `Erbschaft ${formatCurrency(inputs.inheritanceAmount)}`,
                                position: 'end',
                                backgroundColor: 'rgba(0, 122, 255, 0.9)',
                                color: '#ffffff',
                                font: {
                                    family: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
                                    size: 12,
                                    weight: '500',
                                },
                                padding: 8,
                                cornerRadius: 6,
                            }
                        }
                    })
                }
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="py-16 text-center">
                <h1 className="apple-title text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 pb-4">
                    Vermögensrechner
                </h1>
                <p className="apple-subtitle text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed">
                    Prognostizieren Sie Ihre finanzielle Zukunft mit präzisen Berechnungen und eleganten Visualisierungen.
                </p>
            </header>

            <div className="glass-card p-8 mb-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-semibold flex items-center text-white">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        Ihre Parameter
                    </h2>
                    <ToggleSwitch
                        id="isRetirementMode"
                        label="Bereits im Ruhestand?"
                        checked={inputs.isRetirementMode}
                        onChange={handleToggleChange}
                    />
                </div>

                {/* Accumulation Mode */}
                {!inputs.isRetirementMode && (
                    <>
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-white mb-6">Lebensdaten</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="currentAge" className="block text-sm font-medium apple-subtitle">
                                        Aktuelles Alter
                                    </label>
                                    <input 
                                        type="number" 
                                        id="currentAge" 
                                        value={inputs.currentAge} 
                                        onChange={handleInputChange} 
                                        className="apple-input w-full p-3 text-lg font-medium"
                                        placeholder="29"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="retirementAge" className="block text-sm font-medium apple-subtitle">
                                        Rentenalter
                                    </label>
                                    <p className="text-xs text-gray-400 mb-2">Wird als rote Linie im Diagramm angezeigt</p>
                                    <input 
                                        type="number" 
                                        id="retirementAge" 
                                        value={inputs.retirementAge} 
                                        onChange={handleInputChange} 
                                        className="apple-input w-full p-3 text-lg font-medium border-red-500/30 focus:border-red-500"
                                        placeholder="69"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="lifeExpectancy" className="block text-sm font-medium apple-subtitle">
                                        Lebenserwartung
                                    </label>
                                    <input 
                                        type="number" 
                                        id="lifeExpectancy" 
                                        value={inputs.lifeExpectancy} 
                                        onChange={handleInputChange} 
                                        className="apple-input w-full p-3 text-lg font-medium"
                                        placeholder="95"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-white mb-6">Einkommen & Ausgaben</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="initialGrossSalary" className="block text-sm font-medium apple-subtitle">
                                        Bruttogehalt (jährlich)
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            id="initialGrossSalary" 
                                            value={inputs.initialGrossSalary} 
                                            onChange={handleInputChange} 
                                            className="apple-input w-full p-3 pr-12 text-lg font-medium"
                                            placeholder="40.000"
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">€</span>
                                    </div>
                                </div>
                                
                                <SliderInput
                                    id="salaryGrowthRate"
                                    label="Gehaltswachstum"
                                    value={inputs.salaryGrowthRate}
                                    onChange={handleInputChange}
                                    min={0}
                                    max={10}
                                    step={0.1}
                                />
                                
                                <div className="space-y-2">
                                    <label htmlFor="monthlyExpenses" className="block text-sm font-medium apple-subtitle">
                                        Lebenskosten (monatlich)
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            id="monthlyExpenses" 
                                            value={inputs.monthlyExpenses} 
                                            onChange={handleInputChange} 
                                            className="apple-input w-full p-3 pr-12 text-lg font-medium"
                                            placeholder="2.200"
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">€</span>
                                    </div>
                                </div>
                                
                                <SliderInput
                                    id="savingsRate"
                                    label="Sparrate (vom Rest)"
                                    value={inputs.savingsRate}
                                    onChange={handleInputChange}
                                    min={0}
                                    max={100}
                                    step={1}
                                />
                                
                                <div className="space-y-2">
                                    <label htmlFor="initialAssets" className="block text-sm font-medium apple-subtitle">
                                        Startvermögen
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            id="initialAssets" 
                                            value={inputs.initialAssets} 
                                            onChange={handleInputChange} 
                                            className="apple-input w-full p-3 pr-12 text-lg font-medium"
                                            placeholder="60.000"
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">€</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-white mb-6">Rentenziele</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="desiredMonthlyRetirement" className="block text-sm font-medium apple-subtitle">
                                        Gewünschtes monatliches Einkommen im Ruhestand
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            id="desiredMonthlyRetirement" 
                                            value={inputs.desiredMonthlyRetirement} 
                                            onChange={handleInputChange} 
                                            className="apple-input w-full p-3 pr-12 text-lg font-medium"
                                            placeholder="3.000"
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">€</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label htmlFor="expectedPension" className="block text-sm font-medium apple-subtitle">
                                        Erwartete monatliche Rente
                                    </label>
                                    <p className="text-xs text-gray-400 mb-2">Optional: Falls bekannt, trägt zur Finanzierung bei</p>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            id="expectedPension" 
                                            value={inputs.expectedPension} 
                                            onChange={handleInputChange} 
                                            className="apple-input w-full p-3 pr-12 text-lg font-medium"
                                            placeholder="1.200"
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">€</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Retirement Mode */}
                {inputs.isRetirementMode && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-white mb-6">Ruhestand-Parameter</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="retireeCurrentAge" className="block text-sm font-medium apple-subtitle">
                                    Aktuelles Alter
                                </label>
                                <input 
                                    type="number" 
                                    id="retireeCurrentAge" 
                                    value={inputs.retireeCurrentAge} 
                                    onChange={handleInputChange} 
                                    className="apple-input w-full p-3 text-lg font-medium"
                                    placeholder="65"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label htmlFor="retireeLifeExpectancy" className="block text-sm font-medium apple-subtitle">
                                    Lebenserwartung
                                </label>
                                <input 
                                    type="number" 
                                    id="retireeLifeExpectancy" 
                                    value={inputs.retireeLifeExpectancy} 
                                    onChange={handleInputChange} 
                                    className="apple-input w-full p-3 text-lg font-medium"
                                    placeholder="95"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label htmlFor="retireeCurrentAssets" className="block text-sm font-medium apple-subtitle">
                                    Aktuelles Vermögen
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        id="retireeCurrentAssets" 
                                        value={inputs.retireeCurrentAssets} 
                                        onChange={handleInputChange} 
                                        className="apple-input w-full p-3 pr-12 text-lg font-medium"
                                        placeholder="500.000"
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">€</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label htmlFor="retireeAnnualIncome" className="block text-sm font-medium apple-subtitle">
                                    Jahres-Nettoeinkommen (Rente)
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        id="retireeAnnualIncome" 
                                        value={inputs.retireeAnnualIncome} 
                                        onChange={handleInputChange} 
                                        className="apple-input w-full p-3 pr-12 text-lg font-medium"
                                        placeholder="24.000"
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">€</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label htmlFor="retireeAnnualExpenses" className="block text-sm font-medium apple-subtitle">
                                    Jahres-Lebenshaltungskosten
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        id="retireeAnnualExpenses" 
                                        value={inputs.retireeAnnualExpenses} 
                                        onChange={handleInputChange} 
                                        className="apple-input w-full p-3 pr-12 text-lg font-medium"
                                        placeholder="36.000"
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">€</span>
                                </div>
                            </div>
                            
                            <SliderInput
                                id="retireeIncomeGrowthRate"
                                label="Einkommensanpassung"
                                value={inputs.retireeIncomeGrowthRate}
                                onChange={handleInputChange}
                                min={0}
                                max={5}
                                step={0.1}
                            />
                        </div>
                    </div>
                )}

                {/* Gemeinsame Parameter */}
                <div className="border-t border-gray-600 pt-8">
                    <h3 className="text-lg font-semibold text-white mb-6">Marktparameter</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <SliderInput
                            id="investmentReturnRate"
                            label="Kapitalmarkt-Rendite"
                            value={inputs.investmentReturnRate}
                            onChange={handleInputChange}
                            min={0}
                            max={15}
                            step={0.1}
                        />
                        
                        <SliderInput
                            id="inflationRate"
                            label="Inflationsrate"
                            value={inputs.inflationRate}
                            onChange={handleInputChange}
                            min={0}
                            max={8}
                            step={0.1}
                        />
                    </div>

                    {/* Erbschaft Toggle und Inputs */}
                    <div className="border-t border-gray-600 pt-6">
                        <ToggleSwitch
                            id="inheritanceEnabled"
                            label="Erbschaft einbeziehen"
                            description="Erwarten Sie in der Zukunft eine Erbschaft? Diese wird nur berücksichtigt wenn aktiviert."
                            checked={inputs.inheritanceEnabled}
                            onChange={handleToggleChange}
                        />
                        
                        {inputs.inheritanceEnabled && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-2">
                                    <label htmlFor="inheritanceAmount" className="block text-sm font-medium apple-subtitle">
                                        Erbsumme
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            id="inheritanceAmount" 
                                            value={inputs.inheritanceAmount} 
                                            onChange={handleInputChange} 
                                            className="apple-input w-full p-3 pr-12 text-lg font-medium"
                                            placeholder="150.000"
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">€</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label htmlFor="inheritanceYear" className="block text-sm font-medium apple-subtitle">
                                        Jahr des Erbes
                                    </label>
                                    <input 
                                        type="number" 
                                        id="inheritanceYear" 
                                        value={inputs.inheritanceYear} 
                                        onChange={handleInputChange} 
                                        className="apple-input w-full p-3 text-lg font-medium"
                                        placeholder="2045"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Active Features Status */}
                    <div className="mt-6 pt-6 border-t border-gray-600">
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Aktive Berechnungsparameter</h4>
                        <div className="flex flex-wrap gap-2">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${inputs.isRetirementMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700/50 text-gray-400 border border-gray-600'}`}>
                                <div className={`w-2 h-2 rounded-full mr-2 ${inputs.isRetirementMode ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
                                Ruhestand-Modus
                            </div>
                            {!inputs.isRetirementMode && (
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                    <div className="w-2 h-2 rounded-full mr-2 bg-red-400"></div>
                                    Renteneintritt: {inputs.retirementAge} Jahre ({new Date().getFullYear() + (inputs.retirementAge - inputs.currentAge)})
                                </div>
                            )}
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${inputs.inheritanceEnabled ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-gray-700/50 text-gray-400 border border-gray-600'}`}>
                                <div className={`w-2 h-2 rounded-full mr-2 ${inputs.inheritanceEnabled ? 'bg-purple-400' : 'bg-gray-500'}`}></div>
                                Erbschaft {inputs.inheritanceEnabled ? `${inputs.inheritanceYear} (${formatCurrency(inputs.inheritanceAmount)})` : '(deaktiviert)'}
                            </div>
                            {!inputs.isRetirementMode && (
                                <>
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${inputs.desiredMonthlyRetirement > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-700/50 text-gray-400 border border-gray-600'}`}>
                                        <div className={`w-2 h-2 rounded-full mr-2 ${inputs.desiredMonthlyRetirement > 0 ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                                        Rentenziel: {inputs.desiredMonthlyRetirement > 0 ? formatCurrency(inputs.desiredMonthlyRetirement) : 'nicht gesetzt'}
                                    </div>
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${inputs.expectedPension > 0 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-gray-700/50 text-gray-400 border border-gray-600'}`}>
                                        <div className={`w-2 h-2 rounded-full mr-2 ${inputs.expectedPension > 0 ? 'bg-orange-400' : 'bg-gray-500'}`}></div>
                                        Staatliche Rente: {inputs.expectedPension > 0 ? formatCurrency(inputs.expectedPension) : 'nicht gesetzt'}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main className="space-y-12">
                {/* Summary Metrics */}
                {!inputs.isRetirementMode && (
                    <div className="glass-card p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-white mb-2">Ziele & Prognose</h2>
                            <p className="apple-subtitle">Bewertung Ihrer finanziellen Ziele</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(() => {
                                const retirementYear = new Date().getFullYear() + (inputs.retirementAge - inputs.currentAge);
                                const retirementData = projectionData.find(d => d.year === retirementYear);
                                const assetsAtRetirement = retirementData?.totalAssets || 0;
                                const realAssetsAtRetirement = retirementData?.realTotalAssets || 0;
                                
                                // 4% Regel Berechnung
                                const safeWithdrawalRate = 0.04;
                                const sustainableMonthlyIncome = (assetsAtRetirement * safeWithdrawalRate) / 12;
                                const desiredMonthlyIncome = inputs.desiredMonthlyRetirement;
                                const expectedPension = inputs.expectedPension;
                                const totalExpectedIncome = sustainableMonthlyIncome + expectedPension;
                                
                                const goalMet = totalExpectedIncome >= desiredMonthlyIncome;
                                const gapOrSurplus = totalExpectedIncome - desiredMonthlyIncome;
                                
                                return (
                                    <>
                                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-medium text-gray-400">Vermögen bei Renteneintritt</h3>
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            </div>
                                            <p className="text-2xl font-bold text-white">{formatCurrency(assetsAtRetirement)}</p>
                                            <p className="text-sm text-gray-400 mt-1">Kaufkraft: {formatCurrency(realAssetsAtRetirement)}</p>
                                        </div>
                                        
                                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-medium text-gray-400">Mögliches Einkommen (4%-Regel)</h3>
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            </div>
                                            <p className="text-2xl font-bold text-white">{formatCurrency(sustainableMonthlyIncome)}</p>
                                            <p className="text-sm text-gray-400 mt-1">Pro Monat aus Kapitalerträgen</p>
                                        </div>
                                        
                                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-medium text-gray-400">Gesamteinkommen in Rente</h3>
                                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                            </div>
                                            <p className="text-2xl font-bold text-white">{formatCurrency(totalExpectedIncome)}</p>
                                            <p className="text-sm text-gray-400 mt-1">Kapitalerträge + Rente</p>
                                        </div>
                                        
                                        <div className={`bg-gray-800/50 rounded-xl p-6 border ${goalMet ? 'border-green-500/50' : 'border-red-500/50'}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-medium text-gray-400">Zielerreichung</h3>
                                                <div className={`w-3 h-3 rounded-full ${goalMet ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            </div>
                                            <p className={`text-2xl font-bold ${goalMet ? 'text-green-400' : 'text-red-400'}`}>
                                                {goalMet ? '✓ Erreicht' : '✗ Verfehlt'}
                                            </p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {gapOrSurplus >= 0 ? 'Überschuss: ' : 'Lücke: '}{formatCurrency(Math.abs(gapOrSurplus))}/Monat
                                            </p>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}
                
                <div className="glass-card p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-white mb-2">Vermögensentwicklung</h2>
                        <p className="apple-subtitle">Ihre finanzielle Entwicklung über den gesamten Lebenszyklus</p>
                    </div>
                    <div className="chart-container">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                    
                    {/* Chart Legend Explanation */}
                    {(!inputs.isRetirementMode && (inputs.inheritanceEnabled || inputs.retirementAge)) && (
                        <div className="mt-6 pt-4 border-t border-gray-600">
                            <h4 className="text-sm font-medium text-gray-400 mb-3">Markierungen im Diagramm</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {!inputs.isRetirementMode && (
                                    <div className="flex items-center space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                        <div className="w-4 h-0.5 bg-red-500"></div>
                                        <div>
                                            <p className="text-sm font-medium text-red-400">Rote Linie</p>
                                            <p className="text-xs text-gray-400">Renteneintritt bei {inputs.retirementAge} Jahren</p>
                                        </div>
                                    </div>
                                )}
                                {inputs.inheritanceEnabled && (
                                    <div className="flex items-center space-x-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                        <div className="w-4 h-0.5 bg-blue-500 border-dashed border-t-2"></div>
                                        <div>
                                            <p className="text-sm font-medium text-blue-400">Blaue gestrichelte Linie</p>
                                            <p className="text-xs text-gray-400">Erbschaft {inputs.inheritanceYear}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="glass-card p-6 border-l-4 border-orange-500">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold text-orange-400 mb-1">Wichtiger Hinweis</p>
                            <p className="apple-subtitle text-sm leading-relaxed">
                                Dies ist eine vereinfachte Modellrechnung. Annahmen: Renteneintritt mit 70, Lebenskosten in der Rente entsprechen dem letzten Nettogehalt. Keine Steuern auf Kapitalerträge berücksichtigt.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="p-8 pb-0">
                        <h2 className="text-2xl font-semibold text-white mb-2">Ansparphase bis zur Rente</h2>
                        <p className="apple-subtitle mb-6">Detaillierte Übersicht Ihrer Vermögensbildung</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="apple-table w-full">
                            <thead>
                                <tr>
                                    <th className="apple-table th p-4 text-left">Jahr</th>
                                    <th className="apple-table th p-4 text-left">Alter</th>
                                    <th className="apple-table th p-4 text-left">Brutto (jährl.)</th>
                                    <th className="apple-table th p-4 text-left">Netto (monatl.)</th>
                                    <th className="apple-table th p-4 text-left">Kosten (monatl.)</th>
                                    <th className="apple-table th p-4 text-left">Übrig (monatl.)</th>
                                    <th className="apple-table th p-4 text-left">Sparbetrag (monatl.)</th>
                                    <th className="apple-table th p-4 text-left">Vermögen (Ende)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accumulationData.map(d => (
                                    <tr key={d.year} className={`apple-table tr transition-all duration-200 ${d.year === inputs.inheritanceYear && inputs.inheritanceEnabled ? 'bg-blue-500/10 border-l-4 border-blue-500' : ''}`}>
                                        <td className="p-4 text-gray-400 font-medium">{d.year}</td>
                                        <td className="p-4 text-white font-semibold">{d.age}</td>
                                        <td className="p-4 text-white font-medium">{formatCurrency(d.grossSalary)}</td>
                                        <td className="p-4 text-white font-bold">{formatCurrency(d.monthlyNetSalary)}</td>
                                        <td className="p-4 status-negative font-medium">{formatCurrency(d.monthlyExpenses)}</td>
                                        <td className="p-4 text-white font-medium">{formatCurrency(d.monthlyDisposableIncome)}</td>
                                        <td className="p-4 status-positive font-bold">{formatCurrency(d.monthlySavingsAmount)}</td>
                                        <td className="p-4 text-white font-bold text-lg">{formatCurrency(d.totalAssets)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="p-8 pb-0">
                        <h2 className="text-2xl font-semibold text-white mb-2">Entnahmephase in der Rente (ab 70)</h2>
                        <p className="apple-subtitle mb-6">Wie lange reicht Ihr Vermögen im Ruhestand</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="apple-table w-full">
                            <thead>
                                <tr>
                                    <th className="apple-table th p-4 text-left">Jahr</th>
                                    <th className="apple-table th p-4 text-left">Alter</th>
                                    <th className="apple-table th p-4 text-left">Lebenskosten (jährl.)</th>
                                    <th className="apple-table th p-4 text-left">Zinserträge</th>
                                    <th className="apple-table th p-4 text-left">Vermögen (Ende)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {retirementData.map(d => (
                                     <tr key={d.year} className={`apple-table tr transition-all duration-200 ${d.year === inputs.inheritanceYear && inputs.inheritanceEnabled ? 'bg-blue-500/10 border-l-4 border-blue-500' : ''}`}>
                                        <td className="p-4 text-gray-400 font-medium">{d.year}</td>
                                        <td className="p-4 text-white font-semibold">{d.age}</td>
                                        <td className="p-4 status-negative font-medium">{formatCurrency(d.retirementWithdrawal)}</td>
                                        <td className="p-4 status-positive font-medium">{formatCurrency(d.investmentGains)}</td>
                                        <td className="p-4 text-white font-bold text-lg">{formatCurrency(d.totalAssets)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <footer className="text-center py-16">
                <p className="apple-subtitle text-sm">
                    Erstellt mit React, Tailwind CSS und Chart.js. Berechnungen sind Schätzungen.
                </p>
            </footer>
        </div>
    );
};

export default Finanzrechner;
