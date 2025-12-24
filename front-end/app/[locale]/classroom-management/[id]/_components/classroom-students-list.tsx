import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Mail, Phone, User2, UserCircle, Users, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Student {
  id: number;
  studentName: string;
  parentName: string;
  studentPhoneNumber: string;
  parentPhoneNumber: string;
  email: string;
  dob: string; // Date of Birth
  gender: 'male' | 'female' | 'other';
  classJoinedAt: string;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  amountPaid: number;
  totalFee: number;
}

interface ClassroomStudentsListProps {
  students: Student[];
}

export function ClassroomStudentsList({ students }: ClassroomStudentsListProps) {
  const t = useTranslations('classroom-detail');

  const getGenderBadge = (gender: string) => {
    const variants: Record<string, string> = {
      male: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      female: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      other: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
    };
    return variants[gender] || variants.other;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Users className="size-5 md:size-6 text-blue-600 dark:text-blue-400" />
          {t('studentsList')}
          <span className="text-sm md:text-base font-normal text-slate-500 dark:text-slate-400">
            ({students.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <User2 className="size-4" />
                  {t('studentName')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <UserCircle className="size-4" />
                  {t('parentName')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="size-4" />
                  {t('studentContact')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="size-4" />
                  {t('parentContact')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <UsersRound className="size-4" />
                  {t('gender')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="size-4" />
                  {t('dob')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="size-4" />
                  {t('joinedAt')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow
                key={student.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                  {student.studentName}
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-300">{student.parentName}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Phone className="size-3.5 text-slate-500" />
                      <span>{student.studentPhoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Mail className="size-3.5 text-slate-500" />
                      <span>{student.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Phone className="size-3.5 text-slate-500" />
                    <span>{student.parentPhoneNumber}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={getGenderBadge(student.gender)}>{t(`gender_${student.gender}`)}</Badge>
                </TableCell>
                <TableCell className="text-center text-slate-600 dark:text-slate-400 text-sm">
                  {formatDate(student.dob)}
                </TableCell>
                <TableCell className="text-center text-slate-600 dark:text-slate-400 text-sm">
                  {formatDate(student.classJoinedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

