import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Organization } from '../../types';

interface ClinicListProps {
  clinics: Organization[];
  onSelect: (clinic: Organization) => void;
}

export const ClinicList = ({ clinics, onSelect }: ClinicListProps) => {
  if (clinics.length === 0) {
    return (
      <Card className="bg-white/10 border-purple-500/20">
        <CardContent className="py-12 text-center">
          <p className="text-purple-300 text-lg">No clinics available</p>
          <p className="text-purple-400 text-sm mt-2">
            Please check back later for available clinics
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clinics.map((clinic, idx) => (
        <motion.div
          key={clinic.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card
            className="bg-white/10 border-purple-500/20 cursor-pointer transition-all hover:bg-white/15 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10"
            onClick={() => onSelect(clinic)}
          >
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-lg truncate">{clinic.name}</h3>
                  {clinic.code && (
                    <p className="text-purple-400 text-sm">Code: {clinic.code}</p>
                  )}
                  {clinic.address && (
                    <p className="text-purple-300 text-sm mt-2 line-clamp-2">{clinic.address}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-purple-400">
                    {clinic.phone && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {clinic.phone}
                      </span>
                    )}
                    {clinic.email && (
                      <span className="flex items-center gap-1 truncate">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {clinic.email}
                      </span>
                    )}
                  </div>
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
  );
};
