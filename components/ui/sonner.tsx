"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      expand
      richColors
      closeButton
      gap={12}
      icons={{
        success: (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <CircleCheckIcon className="size-4 text-primary" />
          </div>
        ),
        info: (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
            <InfoIcon className="size-4 text-blue-400" />
          </div>
        ),
        warning: (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
            <TriangleAlertIcon className="size-4 text-amber-400" />
          </div>
        ),
        error: (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20">
            <OctagonXIcon className="size-4 text-red-400" />
          </div>
        ),
        loading: (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center">
            <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
          </div>
        ),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group toast w-full flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card/95 text-card-foreground shadow-2xl shadow-black/20 backdrop-blur-md",
          title: "text-sm font-semibold text-foreground",
          description: "text-sm text-muted-foreground mt-0.5 leading-relaxed",
          actionButton:
            "inline-flex items-center justify-center rounded-lg text-sm font-medium bg-primary text-primary-foreground h-8 px-4 hover:bg-primary/90 transition-all duration-200",
          cancelButton:
            "inline-flex items-center justify-center rounded-lg text-sm font-medium bg-secondary text-secondary-foreground h-8 px-4 hover:bg-secondary/80 transition-all duration-200",
          closeButton:
            "absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground/50 transition-all duration-200 hover:text-foreground hover:bg-secondary opacity-0 group-hover:opacity-100 focus:opacity-100",
          success:
            "border-primary/40 bg-gradient-to-r from-primary/10 to-card/95",
          error:
            "border-red-500/40 bg-gradient-to-r from-red-500/10 to-card/95",
          warning:
            "border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-card/95",
          info: "border-blue-500/40 bg-gradient-to-r from-blue-500/10 to-card/95",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
