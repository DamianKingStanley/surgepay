/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import ModalMessage from "../../components/common/ModalMessage";

// Inner component that uses useSearchParams
function OnboardingContent() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    schoolName: "",
    motto: "",
    address: "",
    logo: "",
    teachers: [] as string[],
    students: [] as string[],
  });
  const [teacherEmail, setTeacherEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [modal, setModal] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  // Check if token exists on component mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setModal({
        show: true,
        message:
          "Invalid or missing verification token. Please check your email for the correct link.",
        type: "error",
      });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setModal({
        show: true,
        message:
          "Verification token is missing. Please use the link from your email.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          verificationToken: token,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setModal({
          show: true,
          message: data.message || "School setup completed successfully!",
          type: "success",
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setModal({
          show: true,
          message: data.message || "Something went wrong. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      setModal({
        show: true,
        message: "Network error. Please check your connection and try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTeacher = () => {
    if (teacherEmail && !formData.teachers.includes(teacherEmail)) {
      setFormData({
        ...formData,
        teachers: [...formData.teachers, teacherEmail],
      });
      setTeacherEmail("");
    }
  };

  const removeTeacher = (email: string) => {
    setFormData({
      ...formData,
      teachers: formData.teachers.filter((t) => t !== email),
    });
  };

  const addStudent = () => {
    if (studentName && !formData.students.includes(studentName)) {
      setFormData({
        ...formData,
        students: [...formData.students, studentName],
      });
      setStudentName("");
    }
  };

  const removeStudent = (name: string) => {
    setFormData({
      ...formData,
      students: formData.students.filter((s) => s !== name),
    });
  };

  const skipStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Create a proper form submission event
      const form = document.querySelector("form");
      if (form) {
        const submitEvent = new Event("submit", {
          bubbles: true,
          cancelable: true,
        });
        form.dispatchEvent(submitEvent);
      }
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl text-[#334039] mb-4">
            Invalid Verification Link
          </h2>
          <p className="text-gray-600 mb-6">
            Please check your email for the correct verification link or request
            a new one.
          </p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="px-6 py-3 bg-[#334039] text-white rounded-lg hover:bg-[#D9E3DD] transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ModalMessage
        show={modal.show}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, show: false })}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-[#334039] mb-2">
            Complete Your School Profile
          </h2>
          <p className="text-gray-600">
            Let&apos;s set up your Classika account
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Step {step} of 3</span>
            <span className="text-sm text-gray-500">
              {Math.round((step / 3) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#8BD8BD] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-transparent text-black focus:ring-2 focus:ring-[#334039] focus:border-transparent transition-all duration-300"
                  placeholder="Enter official school name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Motto
                </label>
                <input
                  type="text"
                  value={formData.motto}
                  onChange={(e) =>
                    setFormData({ ...formData, motto: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-transparent text-black focus:ring-2 focus:ring-[#334039] focus:border-transparent transition-all duration-300"
                  placeholder="Enter school motto (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Address *
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-transparent text-black focus:ring-2 focus:ring-[#334039] focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Enter complete school address"
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Teachers */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-light text-[#334039] mb-2">
                  Add Teachers
                </h3>
                <p className="text-gray-600 mb-6">
                  Add teacher emails now or skip and do it later from your
                  dashboard.
                </p>
              </div>

              {/* Add Teacher Input */}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-transparent text-black focus:ring-2 focus:ring-[#334039] focus:border-transparent"
                  placeholder="Enter teacher email"
                />
                <button
                  type="button"
                  onClick={addTeacher}
                  className="px-4 py-3 bg-[#334039] text-white rounded-lg hover:bg-[#D9E3DD] transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Teachers List */}
              {formData.teachers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">
                    Teachers to add:
                  </h4>
                  {formData.teachers.map((email) => (
                    <div
                      key={email}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                    >
                      <span className="text-gray-800">{email}</span>
                      <button
                        type="button"
                        onClick={() => removeTeacher(email)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Skip Option */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={skipStep}
                  className="text-[#334039] hover:text-[#8BD8BD] font-medium transition-colors"
                >
                  Skip - Add Teachers Later
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Students */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-light text-[#334039] mb-2">
                  Add Students
                </h3>
                <p className="text-gray-600 mb-6">
                  Add student names now. They will get auto-generated
                  registration numbers.
                </p>
              </div>

              {/* Add Student Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-transparent text-black focus:ring-2 focus:ring-[#334039] focus:border-transparent"
                  placeholder="Enter student full name"
                />
                <button
                  type="button"
                  onClick={addStudent}
                  className="px-4 py-3 bg-[#334039] text-white rounded-lg hover:bg-[#D9E3DD] transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Students List */}
              {formData.students.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">
                    Students to add:
                  </h4>
                  {formData.students.map((name) => (
                    <div
                      key={name}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                    >
                      <span className="text-gray-800">{name}</span>
                      <button
                        type="button"
                        onClick={() => removeStudent(name)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Skip Option */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={skipStep}
                  className="text-[#334039] hover:text-[#8BD8BD] font-medium transition-colors"
                >
                  Skip - Add Students Later
                </button>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300"
              >
                Previous
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={skipStep}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-[#334039] text-white rounded-lg hover:bg-[#D9E3DD] transition-all duration-300"
                >
                  Next
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={skipStep}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  Skip Students
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#8BD8BD] text-[#334039] rounded-lg font-medium hover:bg-[#7ac8ad] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Setting Up..." : "Complete Setup"}
                </button>
              </div>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Main component with Suspense boundary
export default function Onboarding() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
          <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#334039] mx-auto mb-4"></div>
              <h2 className="text-2xl text-[#334039] mb-2">Loading...</h2>
              <p className="text-gray-600">
                Preparing your onboarding experience
              </p>
            </div>
          </div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
