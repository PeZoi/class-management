import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/helper';
import { Award, BookOpen, Calendar, CreditCard, DollarSign, Edit, Mail, MoreHorizontal, Phone, Plus, Trash2, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TeacherItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  salary: number;
  experience: number; // years of experience
  totalClasses: number;
  dob: string; // date of birth
  idCard: string; // ID card number
  joinedDate: string;
}

interface TeacherTableProps {
  teachers: TeacherItem[];
  onEdit?: (teacher: TeacherItem) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
  title?: string;
  description?: string;
  showActions?: boolean;
  className?: string;
}

export function TeacherTable({
  teachers,
  onEdit,
  onDelete,
  onAdd,
  title,
  description,
  showActions = true,
  className,
}: TeacherTableProps) {
  const t = useTranslations('teacher-management');

  const displayTitle = title || t('title');
  const displayDescription = description || t('description');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Card
      className={cn(
        'hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border-0 shadow-lg',
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold">{displayTitle}</CardTitle>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">{displayDescription}</p>
          </div>
          {showActions && onAdd && (
            <Button onClick={onAdd} className="gap-2">
              <Plus className="size-4" />
              <span className="hidden sm:inline">{t('addTeacher')}</span>
              <span className="sm:hidden">{t('addTeacherShort')}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className={cn('min-w-[900px]', showActions && 'min-w-[1000px]')}>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  {t('teacherName')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="size-4" />
                  {t('contact')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                <div className="flex items-center justify-end gap-2">
                  <DollarSign className="size-4" />
                  {t('salary')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Award className="size-4" />
                  {t('experience')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <BookOpen className="size-4" />
                  {t('totalClasses')}
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
                  <CreditCard className="size-4" />
                  {t('idCard')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="size-4" />
                  {t('joinedDate')}
                </div>
              </TableHead>
              {showActions && (
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                  {t('actions')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 8 : 7} className="h-24 text-center text-slate-500">
                  {t('noTeachersFound')}
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher) => (
                <TableRow
                  key={teacher.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{teacher.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Mail className="size-3.5 text-slate-500" />
                        <span className="text-xs">{teacher.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Phone className="size-3.5 text-slate-500" />
                        <span className="text-xs">{teacher.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-base font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(teacher.salary)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t('perMonth')}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-sm font-medium">
                      {teacher.experience} {t('years')}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium">
                      {teacher.totalClasses}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-slate-600 dark:text-slate-400 text-sm">
                    {formatDate(teacher.dob)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-mono text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
                      {teacher.idCard}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-slate-600 dark:text-slate-400 text-sm">
                    {formatDate(teacher.joinedDate)}
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="size-8 p-0">
                            <span className="sr-only">{t('openMenu')}</span>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {onEdit && (
                            <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(teacher)}>
                              <Edit className="size-4 mr-2" />
                              {t('edit')}
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600 dark:text-red-400"
                              onClick={() => {
                                if (window.confirm(t('confirmDelete'))) {
                                  onDelete(teacher.id);
                                }
                              }}
                            >
                              <Trash2 className="size-4 mr-2" />
                              {t('delete')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

