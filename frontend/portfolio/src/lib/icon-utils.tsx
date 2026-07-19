import type { ElementType } from "react";
import { DynamicIcon, iconNames, type IconName } from "lucide-react/dynamic";

/**
 * Custom uploaded icons are stored as an image URL (e.g. "/api/portfolio/project-images/…").
 * Lucide icon names are plain kebab-case words and never contain "/" or start with "http"/"data:",
 * so this check unambiguously distinguishes the two without needing a separate field.
 */
export function isCustomIconImage(value?: string | null): boolean {
  if (!value) return false;
  return value.startsWith("http") || value.startsWith("/") || value.startsWith("data:");
}

interface ResolvedIconProps {
  iconKey?: string | null;
  className?: string;
  fallback: ElementType;
}

/** Renders a custom uploaded image, a Lucide icon by name, or a section-specific fallback. */
export function ResolvedIcon({ iconKey, className, fallback: Fallback }: ResolvedIconProps) {
  if (isCustomIconImage(iconKey)) {
    return <img src={iconKey!} alt="" className={className} />;
  }
  if (iconKey && (iconNames as readonly string[]).includes(iconKey)) {
    return <DynamicIcon name={iconKey as IconName} className={className} />;
  }
  return <Fallback className={className} />;
}
