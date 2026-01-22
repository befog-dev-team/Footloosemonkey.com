"use client";
import React from "react";

const TermsAndConditions = ({ termsAccepted, onChange, errors }) => (
    <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Terms and Conditions:</label>

        <label className="items-start flex gap-3 mb-3 cursor-pointer group">
            <input
                type="checkbox"
                name="Video Sharing"
                checked={termsAccepted.videoSharing}
                onChange={onChange}
                className="mt-0.5 w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 transition-all"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                By submitting the video, I confirm that I have voluntarily chosen to do so and have no objection to sharing the video.
            </span>
        </label>
        {errors.termsAccepted?.videoSharing && (
            <p className="text-red-500 text-sm mt-1 ml-8">{errors.termsAccepted.videoSharing}</p>
        )}

        <label className="items-start flex gap-3 mb-3 cursor-pointer group">
            <input
                type="checkbox"
                name="Offensive Content"
                checked={termsAccepted.offensiveContent}
                onChange={onChange}
                className="mt-0.5 w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 transition-all"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                By submitting, I confirm that no offensive language or content is being used. Disqualification is at the company&apos;s discretion if found. Registration fees plus GST are non-refundable upon disqualification.
            </span>
        </label>
        {errors.termsAccepted?.offensiveContent && (
            <p className="text-red-500 text-sm mt-1 ml-8">{errors.termsAccepted.offensiveContent}</p>
        )}

        <label className="items-start flex gap-3 mb-4 cursor-pointer group">
            <input
                type="checkbox"
                name="Incidents"
                checked={termsAccepted.incident}
                onChange={onChange}
                className="mt-0.5 w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 transition-all"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                By submitting, I acknowledge that the company is not responsible for any incidents that may occur during the shooting and video-making process.
            </span>
        </label>
        {errors.termsAccepted?.incident && (
            <p className="text-red-500 text-sm mt-1 ml-8">{errors.termsAccepted.incident}</p>
        )}
    </div>
);

export default TermsAndConditions;