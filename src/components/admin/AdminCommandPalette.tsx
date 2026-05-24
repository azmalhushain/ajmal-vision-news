import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { menuSections } from "./adminMenu";
import { ExternalLink, LogOut, Moon, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

export const AdminCommandPalette = ({ open, onOpenChange, onToggleTheme, isDarkMode }: Props) => {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const run = (fn: () => void) => { onOpenChange(false); fn(); };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Jump to anything — pages, actions, settings…" />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>No results found.</CommandEmpty>
        {menuSections.map(section => (
          <CommandGroup key={section.title} heading={section.title}>
            {section.items.map(item => (
              <CommandItem
                key={item.path}
                value={`${section.title} ${item.label} ${item.description || ""}`}
                onSelect={() => run(() => navigate(item.path))}
                className="gap-3 py-2.5"
              >
                <item.icon className="h-4 w-4 text-primary" />
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate">{item.label}</span>
                  {item.description && (
                    <span className="text-[11px] text-muted-foreground truncate">{item.description}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(onToggleTheme)} className="gap-3">
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Toggle {isDarkMode ? "light" : "dark"} mode
          </CommandItem>
          <CommandItem onSelect={() => run(() => window.open("/", "_blank"))} className="gap-3">
            <ExternalLink className="h-4 w-4" /> View live site
          </CommandItem>
          <CommandItem
            onSelect={() => run(async () => { await supabase.auth.signOut(); navigate("/auth"); })}
            className="gap-3 text-destructive"
          >
            <LogOut className="h-4 w-4" /> Log out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
