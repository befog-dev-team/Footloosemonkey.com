"use client";
import React from "react";
import { IoMdLocate } from "react-icons/io";

const AddressInput = ({ value, onChange, onLocateClick, error }) => (
    <div className="mb-4 relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Address:</label>
        <textarea
            name="Address"
            value={value}
            onChange={onChange}
            className={`w-full p-3 pr-10 bg-white border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm ${error ? "border-red-500" : "border-gray-200"}`}
        />
        <IoMdLocate
            className="absolute top-11 right-3 cursor-pointer text-2xl text-purple-500 hover:text-purple-700 transition-colors bg-white/50 backdrop-blur-sm rounded-full"
            onClick={onLocateClick}
            title="Locate Me"
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

export default AddressInput;