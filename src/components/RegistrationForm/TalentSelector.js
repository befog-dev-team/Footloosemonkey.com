"use client";
import React from "react";

const TalentSelector = ({ value, onChange, options, error }) => {
    const allTalents = ["Acting", "Singing", "Dancing", "Mimicry"];

    // Normalize options: support array of strings or array of objects with a 'talent' key
    const enabledTalents = Array.isArray(options)
        ? options.map(opt => (typeof opt === 'object' ? opt.talent : opt))
        : [];

    return (
        <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Participant&apos;s Talent:</label>
            <select
                name="Talent"
                value={value}
                onChange={onChange}
                className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm ${error ? "border-red-500" : "border-gray-200"}`}
            >
                <option value="">Select Talent</option>
                {allTalents.map((talent) => (
                    <option
                        key={talent}
                        value={talent}
                        disabled={!enabledTalents.includes(talent)}
                        className={`${enabledTalents.includes(talent)
                            ? "font-semibold text-gray-900"
                            : "text-gray-400"
                            }`}
                    >
                        {talent}
                        {!enabledTalents.includes(talent) ? " (Unavailable)" : ""}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default TalentSelector;
