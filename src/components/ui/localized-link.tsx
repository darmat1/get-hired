"use client";

import Link, { LinkProps } from "next/link";
import React from "react";
import { useTranslation } from "@/lib/translations";

type Props = LinkProps & { children: React.ReactNode; className?: string };

export function LocalizedLink({ href, className, ...rest }: Props) {
  const { language } = useTranslation();

  // normalize href to string
  const to = typeof href === "string" ? href : href?.pathname || "/";
  // don't prefix absolute URLs
  if (/^https?:\/\//.test(String(to))) return <Link href={href} className={className} {...(rest as any)} />;

  // if link already contains locale prefix, leave as-is
  if (/^\/(ua|ru)(\/|$)/.test(String(to))) {
    return <Link href={href} className={className} {...(rest as any)} />;
  }

  if (language === "en") return <Link href={to} className={className} {...(rest as any)} />;

  // map internal translation code 'uk' -> URL prefix 'ua'
  const prefix = language === 'uk' ? 'ua' : language;
  const localized = `/${prefix}${to.startsWith("/") ? to : `/${to}`}`;
  return <Link href={localized} className={className} {...(rest as any)} />;
}

export default LocalizedLink;