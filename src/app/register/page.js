"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import Cookies from 'js-cookie';
import { motion } from "framer-motion";
import CategorySelector from "../../components/RegistrationForm/CategorySelector";
import IndividualDetails from "../../components/RegistrationForm/IndividualDetails";
import GroupMembers from "../../components/RegistrationForm/GroupMembers";
import TalentSelector from "../../components/RegistrationForm/TalentSelector";
import AddressInput from "../../components/RegistrationForm/AddressInput";
import TermsAndConditions from "../../components/RegistrationForm/TermsAndConditions";
import { addRegistrationData, getAdminData } from "../services";
import { getAgeGroup } from "../../lib/utils";
import axios from "axios";

const RegisterForm = () => {
  const router = useRouter();
  const [values, setValues] = useState({
    category: "",
    groupName: "",
    email: "",
    name: "",
    age: "",
    guardianNumber: "",
    address: "",
    talent: "",
    members: [{ name: "", email: "", age: "" }],
    termsAccepted: {
      videoSharing: false,
      offensiveContent: false,
      incident: false,
    },
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [talentOptions, setTalentOptions] = useState([]);
  const [calculatedCharge, setCalculatedCharge] = useState(0);

  const [isLocating, setIsLocating] = useState(false);

  const isGroup = values.category === "Group";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAdminData();
        if (response.success && response.data) {
          setTalentOptions(response.data);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };
    fetchData();
  }, []);

  // Calculate charge based on category and age
  useEffect(() => {
    if (values.talent && values.category) {
      const talentData = talentOptions.find(t => t.talent === values.talent);
      if (talentData) {
        let charge = 0;

        switch (values.category) {
          case "Kid":
            charge = talentData.groupACharge || 0;
            break;
          case "Teenage":
            charge = talentData.groupBCharge || 0;
            break;
          case "Group":
            charge = talentData.groupCCharge || 0;
            break;
          default:
            charge = 0;
        }

        // Apply offer if available
        if (talentData.isOfferActive && talentData.offerCharge) {
          charge = talentData.offerCharge;
        }

        setCalculatedCharge(charge);
      }
    }
  }, [values.talent, values.category, talentOptions]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const nameMapping = {
      "Category": "category",
      "Group Name": "groupName",
      "Email": "email",
      "Participant Name": "name",
      "Age": "age",
      "Guardian Number": "guardianNumber",
      "Address": "address",
      "Talent": "talent",
      "Video Sharing": "videoSharing",
      "Offensive Content": "offensiveContent",
      "Incidents": "incident",
    };

    const mappedName = nameMapping[name];

    if (name === "Category") {
      setValues(prev => ({
        ...prev,
        [name.toLowerCase()]: value,
        // Reset age when category changes
        age: "",
        // Reset group-related fields when switching away from Group
        ...(value !== "Group" && {
          groupName: "",
          members: [{ name: "", email: "", age: "" }]
        }),
        // Reset individual fields when switching to Group
        ...(value === "Group" && {
          email: "",
          name: "",
          age: ""
        })
      }));
      return;
    }

    if (type === "checkbox") {
      setValues(prev => ({
        ...prev,
        termsAccepted: {
          ...prev.termsAccepted,
          [mappedName]: checked,
        },
      }));
    } else if (mappedName === "category") {
      // Simplified category change handler
      setValues(prev => ({
        ...prev,
        [mappedName]: value,
        // Reset group-related fields when switching away from Group
        ...(value !== "Group" && {
          groupName: "",
          members: [{ name: "", email: "", age: "" }]
        }),
        // Reset individual fields when switching to Group
        ...(value === "Group" && {
          email: "",
          name: "",
          age: ""
        })
      }));
    } else {
      setValues(prev => ({ ...prev, [mappedName]: value }));
    }
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...values.members];
    updatedMembers[index][field] = value;
    setValues(prev => ({ ...prev, members: updatedMembers }));
  };

  const addMember = () => {
    if (values.members.length < 5) {
      setValues(prev => ({
        ...prev,
        members: [...prev.members, { name: "", email: "", age: "" }]
      }));
    }
  };

  const removeMember = (index) => {
    if (values.members.length > 1) {
      const updatedMembers = [...values.members];
      updatedMembers.splice(index, 1);
      setValues(prev => ({ ...prev, members: updatedMembers }));
    }
  };

  const fetchAddressFromLocation = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (response.ok) {
        setValues(prev => ({ ...prev, address: data.display_name }));
      } else {
        toast.error("Failed to retrieve address.");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      toast.error("Unable to retrieve address. Please try again.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleLocationClick = () => {
    setIsLocating(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchAddressFromLocation(position.coords.latitude, position.coords.longitude),
        (error) => {
          console.error("Error fetching location:", error);
          toast.error("Unable to retrieve location. Please try again.");
          setIsLocating(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const validate = (values, isGroup) => {
    const errors = {};

    if (!values.category) errors.category = "Category is required";

    if (!isGroup) {
      if (values.category === "Kid" && (values.age < 5 || values.age > 12)) {
        errors.age = "Kid category requires age 5-12";
      } else if (values.category === "Teenage" && (values.age < 13 || values.age > 19)) {
        errors.age = "Teenage category requires age 13-19";
      }

      if (!values.age) {
        errors.age = "Age is required";
      }
    }

    if (isGroup) {
      if (!values.groupName) errors.groupName = "Group name is required";
      if (values.members.length < 2) errors.members = "At least 2 members required";
      if (values.members.length > 5) errors.members = "Maximum 5 members allowed";

      values.members.forEach((member, index) => {
        if (!member.name) errors[`memberName_${index}`] = "Member name is required";
        if (!member.email) errors[`memberEmail_${index}`] = "Member email is required";
      });
    } else {
      if (!values.email) errors.email = "Email is required";
      if (!values.name) errors.name = "Participant's Name is required";
      if (!values.age) errors.age = "Age is required";
    }

    if (!values.guardianNumber) errors.guardianNumber = "Contact Number is required";
    if (!values.address) errors.address = "Address is required";
    if (!values.talent) errors.talent = "Participant's Talent is required";

    if (!values.termsAccepted.videoSharing) {
      errors.termsAccepted = errors.termsAccepted || {};
      errors.termsAccepted.videoSharing = "You must accept the video sharing terms";
    }

    if (!values.termsAccepted.offensiveContent) {
      errors.termsAccepted = errors.termsAccepted || {};
      errors.termsAccepted.offensiveContent = "You must accept the terms regarding offensive content";
    }

    if (!values.termsAccepted.incident) {
      errors.termsAccepted = errors.termsAccepted || {};
      errors.termsAccepted.incident = "You must accept the terms regarding incident";
    }

    return errors;
  };

  const handleSubmitGoogleForm = async () => {
    const scriptURL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_DATABASE_URL;

    if (!scriptURL) {
      console.warn("Google Sheet Database URL is not defined. Skipping Google Sheet submission.");
      return true; // Return true to allow the flow to continue
    }

    const formData = new FormData();

    // Add all form values to formData
    formData.append('Category', values.category);
    if (isGroup) {
      formData.append('GroupName', values.groupName);
      values.members.forEach((member, index) => {
        formData.append(`Member${index + 1}_Name`, member.name);
        formData.append(`Member${index + 1}_Email`, member.email);
      });
    } else {
      formData.append('Email', values.email);
      formData.append('Name', values.name);
      formData.append('Age', values.age);
    }

    formData.append('GuardianNumber', values.guardianNumber);
    formData.append('Address', values.address);
    formData.append('Talent', values.talent);
    formData.append('Charge', calculatedCharge);

    // Add date and time
    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    const formattedTime = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    formData.append('Date', formattedDate);
    formData.append('Time', formattedTime);

    try {
      const response = await axios.post(scriptURL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to submit to Google Sheets');
      }
      return true;
    } catch (error) {
      console.error('Error submitting to Google Sheets:', error.message);
      // We return true here as well to not block the main database registration if google sheets fails
      // You can change this to false if it's critical
      toast.error("Note: Google Sheet backup failed, but proceeding with main registration.");
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(values, isGroup);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const googleSheetSuccess = await handleSubmitGoogleForm();

      if (!googleSheetSuccess) {
        throw new Error('Google Sheet submission failed');
      }

      const response = await addRegistrationData({
        category: values.category,
        groupName: isGroup ? values.groupName : null,
        email: isGroup ? null : values.email,
        name: isGroup ? null : values.name,
        age: isGroup ? null : values.age,
        guardianNumber: values.guardianNumber,
        address: values.address,
        talent: values.talent,
        members: isGroup ? values.members : null,
        charge: calculatedCharge,
        termsAccepted: values.termsAccepted,
      });

      if (response.success) {
        Cookies.set('isRegistered', 'true', { expires: 1, path: '/' });
        const paymentData = {
          category: values.category,
          talent: values.talent,
          charge: calculatedCharge,
          guardianNumber: values.guardianNumber,
          address: values.address,
          ...(isGroup ? {
            groupName: values.groupName,
            memberCount: values.members.length,
            memberNames: values.members.map(member => member.name),
            memberEmails: values.members.map(member => member.email)
          } : {
            email: values.email,
            name: values.name,
            age: values.age
          })
        };
        router.push(`/payment-checkout?data=${encodeURIComponent(JSON.stringify(paymentData))}`);
      } else {
        setServerError(response.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 p-6 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold mb-8 text-center text-[#004873]"
        >
          Registration Form
        </motion.h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <CategorySelector
            value={values.category}
            onChange={handleChange}
            error={errors.category}
          />

          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {isGroup ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name:</label>
                  <input
                    type="text"
                    name="Group Name"
                    value={values.groupName}
                    onChange={handleChange}
                    className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm ${errors.groupName ? "border-red-500" : "border-gray-200"}`}
                    placeholder="Enter your group name"
                  />
                  {errors.groupName && <p className="text-red-500 text-sm mt-1">{errors.groupName}</p>}
                </div>

                <GroupMembers
                  members={values.members}
                  onChange={handleMemberChange}
                  onAdd={addMember}
                  onRemove={removeMember}
                  errors={errors}
                />
              </>
            ) : (
              <IndividualDetails
                values={values}
                onChange={handleChange}
                errors={errors}
                category={values.category}
              />
            )}
          </motion.div>

          <TalentSelector
            value={values.talent}
            onChange={handleChange}
            options={talentOptions}
            error={errors.talent}
          />

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number:</label>
            <input
              type="text"
              name="Guardian Number"
              value={values.guardianNumber}
              onChange={handleChange}
              className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm ${errors.guardianNumber ? "border-red-500" : "border-gray-200"}`}
              placeholder="Primary contact number"
            />
            {errors.guardianNumber && <p className="text-red-500 text-sm mt-1">{errors.guardianNumber}</p>}
          </div>

          <AddressInput
            value={values.address}
            onChange={handleChange}
            onLocateClick={handleLocationClick}
            error={errors.address}
          />

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="mb-4 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 shadow-sm"
          >
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              Registration Fee
              {talentOptions.find(t => t.talent === values.talent)?.isOfferActive && (
                <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full animate-pulse">OFFER APPLIED</span>
              )}
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              ₹ {calculatedCharge}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isGroup ?
                "Group Category (Group C Pricing)" :
                values.age ? `Individual (${getAgeGroup(values.age)})` : 'Standard Rate'}
            </p>
          </motion.div>

          <TermsAndConditions
            termsAccepted={values.termsAccepted}
            onChange={handleChange}
            errors={errors}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 flex justify-center items-center text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300
              ${isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#004873] to-[#0076ff] hover:from-[#00385a] hover:to-[#005bb5] shadow-blue-500/30 hover:shadow-blue-500/50'
              }`}
          >
            {isSubmitting ? <Loader className="animate-spin" size={24} /> : "Complete Registration"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterForm;