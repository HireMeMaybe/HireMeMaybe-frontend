'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MayBeIcon } from '@/components/icons';
import { BarChart3, Building2, FileText, Briefcase, Users } from 'lucide-react';

const menuItems = [
  {
    icon: BarChart3,
    label: 'Dashboard',
    href: '/admin/dashboard',
    isActive: true,
  },
  {
    icon: Building2,
    label: 'Company Verification',
    href: '/admin/company-verification',
    isActive: false,
  },
  {
    icon: FileText,
    label: 'Review Reports',
    href: '/admin/report',
    isActive: false,
  },
  {
    icon: Briefcase,
    label: 'Manage Job Posts',
    href: '/admin/manage-job-posts',
    isActive: false,
  },
  {
    icon: Users,
    label: 'Manage CPSK',
    href: '/admin/manage-cpsk',
    isActive: false,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-very-dark-gray fixed top-0 left-0 z-40 h-full w-64 border-r border-zinc-800 pt-14">
      {/* Header */}
      <div className="flex items-center justify-center">
        <MayBeIcon width={128} height={128} />
      </div>

      {/* Navigation */}
      <nav className="px-4 py-2">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-green text-white'
                      : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
