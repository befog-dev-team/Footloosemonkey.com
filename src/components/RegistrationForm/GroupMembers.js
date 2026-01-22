"use client";
import React from "react";

const GroupMembers = ({ members, onChange, onAdd, onRemove, errors }) => (
    <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Group Members (2-5):</label>
        {members.map((member, index) => (
            <div key={index} className="mb-3 p-4 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm">
                <div className="mb-3">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Member {index + 1} Name:</label>
                    <input
                        type="text"
                        value={member.name}
                        onChange={(e) => onChange(index, 'name', e.target.value)}
                        className={`w-full p-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${errors[`memberName_${index}`] ? "border-red-500" : "border-gray-200"}`}
                    />
                    {errors[`memberName_${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`memberName_${index}`]}</p>}
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Member {index + 1} Email:</label>
                    <input
                        type="email"
                        value={member.email}
                        onChange={(e) => onChange(index, 'email', e.target.value)}
                        className={`w-full p-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${errors[`memberEmail_${index}`] ? "border-red-500" : "border-gray-200"}`}
                    />
                    {errors[`memberEmail_${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`memberEmail_${index}`]}</p>}
                </div>
                {members.length > 1 && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="mt-3 text-xs font-medium text-red-500 hover:text-red-700 hover:underline transition-colors"
                    >
                        Remove Member
                    </button>
                )}
            </div>
        ))}
        {members.length < 5 && (
            <button
                type="button"
                onClick={onAdd}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
                + Add Member
            </button>
        )}
        {errors.members && <p className="text-red-500 text-sm mt-1">{errors.members}</p>}
    </div>
);

export default GroupMembers;