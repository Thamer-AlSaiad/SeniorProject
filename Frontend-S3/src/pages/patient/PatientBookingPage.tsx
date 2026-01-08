import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { CardSkeleton } from '../../components/ui/skeleton';
import { ClinicList } from '../../components/patient/ClinicList';
import { DoctorList } from '../../components/patient/DoctorList';
import { TimeSlotPicker } from '../../components/patient/TimeSlotPicker';
import { BookingForm } from '../../components/patient/BookingForm';
import { usePatientBooking } from '../../hooks/usePatientBooking';
import { Organization, Doctor, TimeSlot } from '../../types';
import { clearAuth } from '../../utils/auth';

type BookingStep = 'clinic' | 'doctor' | 'slot' | 'confirm';

const PatientBookingPage = () => {
  const [step, setStep] = useState<BookingStep>('clinic');
  const [selectedClinic, setSelectedClinic] = useState<Organization | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const {
    clinics,
    doctors,
    availableSlots,
    isLoadingClinics,
    isLoadingDoctors,
    isLoadingSlots,
    fetchDoctors,
    fetchAvailableSlots,
    bookAppointment,
    isBooking,
  } = usePatientBooking();

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/';
  };

  const handleSelectClinic = (clinic: Organization) => {
    setSelectedClinic(clinic);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    fetchDoctors(clinic.id);
    setStep('doctor');
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
    fetchAvailableSlots(doctor.id);
    setStep('slot');
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep('confirm');
  };

  const handleBookAppointment = async (reasonForVisit: string) => {
    if (!selectedDoctor || !selectedSlot) return;
    
    await bookAppointment({
      doctorId: selectedDoctor.id,
      timeSlotId: selectedSlot.id,
      reasonForVisit,
    });
    
    // Redirect to appointments page on success
    window.location.href = '/patient/appointments';
  };

  const handleBack = () => {
    if (step === 'doctor') {
      setStep('clinic');
      setSelectedClinic(null);
    } else if (step === 'slot') {
      setStep('doctor');
      setSelectedDoctor(null);
    } else if (step === 'confirm') {
      setStep('slot');
      setSelectedSlot(null);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'clinic': return 'Select a Clinic';
      case 'doctor': return 'Select a Doctor';
      case 'slot': return 'Select a Time Slot';
      case 'confirm': return 'Confirm Booking';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e]">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 border-b border-purple-500/20">
        <a href="/" className="text-2xl font-bold text-white">EMR System</a>
        <div className="flex-1 flex justify-center items-center gap-8">
          <a href="/patient/booking" className="text-purple-300 hover:text-white transition-colors">
            Book Appointment
          </a>
          <a href="/patient/appointments" className="text-purple-300 hover:text-white transition-colors">
            My Appointments
          </a>
          <a href="/patient/medical-records" className="text-purple-300 hover:text-white transition-colors">
            Medical Records
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a href="/profile">
            <Button variant="outline" className="border-purple-500 text-purple-300">
              Profile
            </Button>
          </a>
          <Button variant="outline" onClick={handleLogout} className="border-purple-500 text-purple-300">
            Log Out
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            {['clinic', 'doctor', 'slot', 'confirm'].map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step === s
                      ? 'bg-purple-500 text-white'
                      : ['clinic', 'doctor', 'slot', 'confirm'].indexOf(step) > index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      ['clinic', 'doctor', 'slot', 'confirm'].indexOf(step) > index
                        ? 'bg-green-500'
                        : 'bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <h1 className="text-3xl font-bold text-white text-center">{getStepTitle()}</h1>
        </motion.div>

        {/* Back Button */}
        {step !== 'clinic' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <Button variant="outline" onClick={handleBack} className="border-purple-500 text-purple-300">
              ← Back
            </Button>
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 'clinic' && (
            isLoadingClinics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : (
              <ClinicList clinics={clinics} onSelect={handleSelectClinic} />
            )
          )}

          {step === 'doctor' && selectedClinic && (
            isLoadingDoctors ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : (
              <DoctorList
                doctors={doctors}
                clinicName={selectedClinic.name}
                onSelect={handleSelectDoctor}
              />
            )
          )}

          {step === 'slot' && selectedDoctor && (
            isLoadingSlots ? (
              <CardSkeleton />
            ) : (
              <TimeSlotPicker
                slots={availableSlots}
                doctorName={`Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                onSelect={handleSelectSlot}
              />
            )
          )}

          {step === 'confirm' && selectedClinic && selectedDoctor && selectedSlot && (
            <BookingForm
              clinic={selectedClinic}
              doctor={selectedDoctor}
              slot={selectedSlot}
              onConfirm={handleBookAppointment}
              onCancel={handleBack}
              isLoading={isBooking}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PatientBookingPage;
