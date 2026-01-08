import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { MedicalRecord } from '../../types';

interface MedicalRecordViewProps {
  record: MedicalRecord;
}

export const MedicalRecordView = ({ record }: MedicalRecordViewProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const sections = [
    { label: 'Present Complaint', value: record.presentComplaint },
    { label: 'History of Presenting Complaint', value: record.historyOfPresentingComplaint },
    { label: 'Past Medical History', value: record.pastMedicalHistory },
    { label: 'Past Surgical History', value: record.pastSurgicalHistory },
    { label: 'Drug History', value: record.drugHistory },
    { label: 'Family History', value: record.familyHistory },
    { label: 'Social History', value: record.socialHistory },
    { label: 'Assessment', value: record.assessment },
    { label: 'Plan', value: record.plan },
    { label: 'Additional Notes', value: record.additionalNotes },
  ].filter((section) => section.value);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card className="bg-white/10 border-purple-500/20">
        <CardHeader className="border-b border-purple-500/20">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {record.encounter?.encounterType?.replace('_', ' ') || 'Medical Record'}
              </h3>
              <p className="text-purple-300 text-sm mt-1">
                Dr. {record.doctor?.firstName} {record.doctor?.lastName}
              </p>
              <p className="text-purple-400 text-xs mt-1">
                {formatDate(record.createdAt)}
              </p>
            </div>
            <Badge variant="success">Finalized</Badge>
          </div>
        </CardHeader>
        <CardContent className="py-4">
          {sections.length === 0 ? (
            <p className="text-purple-400 text-center py-4">
              No detailed information available
            </p>
          ) : (
            <div className="space-y-4">
              {sections.map((section, idx) => (
                <motion.div
                  key={section.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-purple-500/10 pb-4 last:border-0 last:pb-0"
                >
                  <h4 className="text-purple-400 text-sm font-medium mb-1">
                    {section.label}
                  </h4>
                  <p className="text-white text-sm whitespace-pre-wrap">
                    {section.value}
                  </p>
                </motion.div>
              ))}

              {/* Physical Examination */}
              {record.physicalExamination && Object.keys(record.physicalExamination).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sections.length * 0.05 }}
                  className="border-b border-purple-500/10 pb-4"
                >
                  <h4 className="text-purple-400 text-sm font-medium mb-2">
                    Physical Examination
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(record.physicalExamination).map(([key, value]) => (
                      <div key={key} className="bg-purple-500/10 rounded p-2">
                        <span className="text-purple-400 text-xs capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-white text-sm ml-1">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Finalization Info */}
              {record.finalizedAt && (
                <div className="bg-green-500/10 rounded-lg p-3 mt-4">
                  <p className="text-green-400 text-sm">
                    <span className="font-medium">Finalized:</span>{' '}
                    {formatDate(record.finalizedAt)}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
