import React from 'react';

const SliderInput = ({ id, label, value, onChange, min = 0, max = 100, step = 0.1, suffix = '%' }) => {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label htmlFor={id} className="block text-sm font-medium apple-subtitle">
                    {label}
                </label>
                <span className="text-white font-semibold text-lg">
                    {value}{suffix}
                </span>
            </div>
            <div className="relative">
                <input
                    type="range"
                    id={id}
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={onChange}
                    className="apple-slider w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{min}{suffix}</span>
                    <span>{max}{suffix}</span>
                </div>
            </div>
        </div>
    );
};

export default SliderInput;
