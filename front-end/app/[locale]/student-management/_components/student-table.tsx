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
import {
  BookOpen,
  Calendar,
  DollarSign,
  Edit,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Trash2,
  User,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StudentItem } from '../student-management-page';

interface StudentTableProps {
  students: StudentItem[];
  onEdit?: (student: StudentItem) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
  title?: string;
  description?: string;
  showActions?: boolean;
  className?: string;
}

export function StudentTable({
  students,
  onEdit,
  onDelete,
  onAdd,
  title,
  description,
  showActions = true,
  className,
}: StudentTableProps) {
  const t = useTranslations('student-management');

  const displayTitle = title || t('title');
  const displayDescription = description || t('description');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getPaymentBadge = (paymentStatus: StudentItem['paymentStatus']) => {
    const paymentConfig = {
      paid: {
        label: t('payment_paid'),
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle,
      },
      partial: {
        label: t('payment_partial'),
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        icon: Clock,
      },
      unpaid: {
        label: t('payment_unpaid'),
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle,
      },
    };

    const config = paymentConfig[paymentStatus];
    const Icon = config.icon;

    return (
      <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', config.className)}>
        <Icon className="size-3" />
        {config.label}
      </span>
    );
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
              <span className="hidden sm:inline">{t('addStudent')}</span>
              <span className="sm:hidden">{t('addStudentShort')}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className={cn('min-w-[1000px]', showActions && 'min-w-[1100px]')}>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  {t('studentName')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="size-4" />
                  {t('contact')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  {t('parent')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <BookOpen className="size-4" />
                  {t('class')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="size-4" />
                  {t('dob')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                <div className="flex items-center justify-end gap-2">
                  <DollarSign className="size-4" />
                  {t('payment')}
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
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 8 : 7} className="h-24 text-center text-slate-500">
                  {t('noStudentsFound')}
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow
                  key={student.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    <div className="space-y-0.5">
                      <div>{student.name}</div>
                      <div className="text-xs text-slate-500">
                        {t(`gender_${student.gender}`)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Mail className="size-3.5 text-slate-500" />
                        <span className="text-xs">{student.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Phone className="size-3.5 text-slate-500" />
                        <span className="text-xs">{student.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {student.parentName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="size-3 text-slate-500" />
                        {student.parentPhone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-medium">
                      {student.className}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-slate-600 dark:text-slate-400 text-sm">
                    {formatDate(student.dob)}
                  </TableCell>
                  <TableCell>
                    <div className="text-right space-y-1">
                      {getPaymentBadge(student.paymentStatus)}
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {formatCurrency(student.amountPaid)} / {formatCurrency(student.tuitionFee)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-slate-600 dark:text-slate-400 text-sm">
                    {formatDate(student.joinedDate)}
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
                            <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(student)}>
                              <Edit className="size-4 mr-2" />
                              {t('edit')}
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600 dark:text-red-400"
                              onClick={() => {
                                if (window.confirm(t('confirmDelete'))) {
                                  onDelete(student.id);
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

