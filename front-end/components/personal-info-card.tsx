'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CreditCard, Mail, MapPin, Phone, User } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface PersonalInfoCardProps {
  title: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  idCard?: string;
  dob?: string;
  gender?: string;
  joinedDate?: string;
  address?: string;
  className?: string;
  // Optional: custom info items (will override default items if provided)
  customInfoItems?: Array<{
    icon: typeof Mail;
    label: string;
    value: string;
  }>;
}

export function PersonalInfoCard({
  title,
  name,
  avatar,
  email,
  phone,
  idCard,
  dob,
  gender,
  joinedDate,
  address,
  className,
  customInfoItems,
}: PersonalInfoCardProps) {
  const t = useTranslations('profile');

  // Build info items from props with fixed labels
  const buildInfoItems = () => {
    if (customInfoItems) {
      return customInfoItems;
    }

    const items: Array<{ icon: typeof Mail; label: string; value: string }> = [];

    if (email) {
      items.push({ icon: Mail, label: t('email') || 'Email', value: email });
    }
    if (phone) {
      items.push({ icon: Phone, label: t('phone') || 'Số điện thoại', value: phone });
    }
    if (idCard) {
      items.push({ icon: CreditCard, label: t('idCard') || 'CMND/CCCD', value: idCard });
    }
    if (dob) {
      items.push({ icon: Calendar, label: t('dob') || 'Ngày sinh', value: dob });
    }
    if (gender) {
      items.push({ icon: User, label: t('gender') || 'Giới tính', value: gender });
    }
    if (joinedDate) {
      items.push({ icon: Calendar, label: t('joinedDate') || 'Ngày tham gia', value: joinedDate });
    }
    if (address) {
      items.push({ icon: MapPin, label: t('address') || 'Địa chỉ', value: address });
    }

    return items;
  };

  const infoItems = buildInfoItems();

  return (
    <Card className={`border-2 hover:shadow-xl transition-shadow duration-300 ${className || ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            {avatar ? (
              <div className="h-32 w-32 rounded-full overflow-hidden shadow-lg ring-4 ring-white dark:ring-slate-800">
                <Image
                  src={avatar}
                  alt={name}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-32 w-32 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {name.charAt(0)}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{name}</h2>
            </div>

            {infoItems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {infoItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-slate-500 dark:text-slate-400">{item.label}: </span>
                      <span className="text-slate-900 dark:text-slate-100 font-medium truncate">
                        {item.value}
                      </span>
                    </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

