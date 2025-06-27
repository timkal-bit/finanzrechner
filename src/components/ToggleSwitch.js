import React from 'react';

const ToggleSwitch = ({ id, label, checked, onChange, description }) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <label htmlFor={id} className="block text-sm font-medium apple-subtitle">
                        {label}
                    </label>
                    {description && (
                        <p className="text-xs text-gray-400 mt-1">{description}</p>
                    )}
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <input
                        type="checkbox"
                        id={id}
                        checked={checked}
                        onChange={onChange}
                        className="sr-only"
                    />
                    <span
                        className={`${
                            checked 
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                                : 'bg-gray-600'
                        } relative inline-block h-6 w-11 rounded-full transition-colors duration-200 ease-in-out cursor-pointer`}
                        onClick={() => onChange({ target: { id, checked: !checked } })}
                    >
                        <span
                            className={`${
                                checked ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out mt-1 shadow-lg`}
                        />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ToggleSwitch;
