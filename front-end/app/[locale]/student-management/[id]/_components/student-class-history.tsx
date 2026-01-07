import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatDate } from '@/utils/helper';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export interface ClassHistoryItem {
  id: string;
  className: string;
  classId: string;
  joinedAt: string;
  leftAt?: string;
  status: 'studying' | 'completed' | 'transferred';
  reason?: string;
}

interface StudentClassHistoryProps {
  classHistory: ClassHistoryItem[];
}

export function StudentClassHistory({ classHistory }: StudentClassHistoryProps) {
  const t = useTranslations('student-detail');
  const locale = useLocale();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      studying: {
        label: t('statusStudying') || 'Đang học',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      completed: {
        label: t('statusCompleted') || 'Hoàn thành',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      },
      transferred: {
        label: t('statusTransferred') || 'Chuyển lớp',
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      },
    };
    const variant = variants[status] || variants.studying;
    return (
      <Badge className={variant.className} variant="outline">
        {variant.label}
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="size-5 text-purple-600 dark:text-purple-400" />
          {t('classHistory')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {classHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noClassHistory')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                    {t('className')}
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                    {t('joinedDate')}
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                    {t('leftDate')}
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                    {t('status')}
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                    {t('actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classHistory.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {item.className}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-slate-500" />
                        <span className="text-sm">{formatDate(item.joinedAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.leftAt ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-slate-500" />
                          <span className="text-sm">{formatDate(item.leftAt)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      {item.classId && (
                        <Link href={`/${locale}/classroom-management/${item.classId}`}>
                          <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                            {t('viewClass')}
                          </Badge>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
