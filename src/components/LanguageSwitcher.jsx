import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LanguageSwitcher({ currentLang, onLanguageChange }) {
  const languages = [
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-10 md:h-9 active:scale-95 transition-transform">
          <Globe className="w-4 h-4 md:w-4 md:h-4" />
          <span className="text-sm md:text-xs">{languages.find(l => l.code === currentLang)?.flag || '🌍'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[140px]">
        {languages.map(lang => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`${currentLang === lang.code ? 'bg-accent' : ''} cursor-pointer text-base md:text-sm py-3 md:py-2`}
          >
            <span className="mr-2 text-lg">{lang.flag}</span>
            <span className="text-sm md:text-xs">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}