"use client";

import { useState } from "react";
import { MayBeIcon } from "@/components/icons";
import { BarChart3, Building2, FileText, Briefcase, Users } from "lucide-react";

const menuItems = [
  {
    icon: BarChart3,
    label: "Dashboard",
    href: "/admin/dashboard",
    isActive: true,
  },
  {
    icon: Building2,
    label: "Company Verification",
    href: "/admin/company-verification",
    isActive: false,
  },
  {
    icon: FileText,
    label: "Review Reports",
    href: "/admin/review-reports",
    isActive: false,
  },
  {
    icon: Briefcase,
    label: "Manage Job Posts",
    href: "/admin/manage-job-posts",
    isActive: false,
  },
  {
    icon: Users,
    label: "Manage Students",
    href: "/admin/manage-students",
    isActive: false,
  },
];

export function AdminSidebar() {
  const [activeItem, setActiveItem] = useState("Dashboard");

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-background border-r border-zinc-800 z-40 pt-14">
      {/* Header */}
      <div className="flex items-center justify-center">
        <MayBeIcon width={128} height={128} />
      </div>

      {/* Navigation */}
      <nav className="py-2 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.label;

            return (
              <li key={item.label}>
                <button
                  onClick={() => setActiveItem(item.label)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? "bg-primary-green text-white"
                      : "text-gray-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}