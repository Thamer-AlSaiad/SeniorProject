import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Doctor } from '../../types';

interface DoctorListProps {
  doctors: Doctor[];
  clinicName: string;
  onSelect: (doctor: Doctor) => void;
}

export const DoctorList = ({ doctors, clinicName, onSelect }: DoctorListProps) => {
  if (doctors.length === 0) {
    return (
      <Card className="bg-white/10 border-purple-500/20">
        <CardContent className="py-12 text-center">
          <p className="text-purple-300 text-lg">No doctors available at {clinicName}</p>
          <p className="text-purple-400 text-sm mt-2">
            Please try another clinic or check back later
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <p className="text-purple-300 mb-4">
        Showing {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} at {clinicName}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor, idx) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              className="bg-white/10 border-purple-500/20 cursor-pointer transition-all hover:bg-white/15 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10"
              onClick={() => onSelect(doctor)}
            >
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-semibold">
                      {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-lg">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                    {doctor.specialization && (
                      <Badge variant="info" className="mt-1">
                        {doctor.specialization}
                      </Badge>
                    )}
                    {doctor.licenseNumber && (
                      <p className="text-purple-400 text-sm mt-2">
                        License: {doctor.licenseNumber}
                      </p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
