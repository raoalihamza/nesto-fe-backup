import type { Locale } from "@/lib/constants/locales";

interface FlagProps {
  className?: string;
}

function GBFlag({ className = "size-4" }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <path fill="#012169" d="M0 0h640v480H0z" />
      <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" />
      <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" />
      <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
      <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" />
    </svg>
  );
}

function UZFlag({ className = "size-4" }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <path fill="#1EB53A" d="M0 320h640v160H0z" />
      <path fill="#0099B5" d="M0 0h640v160H0z" />
      <path fill="#FFF" d="M0 153.6h640v172.8H0z" />
      <path fill="#CE1126" d="M0 163.2h640v6.4H0zM0 310.4h640v6.4H0z" />
      <circle fill="#FFF" cx="134.4" cy="76.8" r="57.6" />
      <circle fill="#0099B5" cx="153.6" cy="76.8" r="57.6" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const cx = 224 + col * 25.6;
        const cy = 38.4 + row * 25.6;
        return (
          <circle key={i} fill="#FFF" cx={cx} cy={cy} r="6.4" />
        );
      })}
    </svg>
  );
}

function RUFlag({ className = "size-4" }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFF" d="M0 0h640v160H0z" />
      <path fill="#0039A6" d="M0 160h640v160H0z" />
      <path fill="#D52B1E" d="M0 320h640v160H0z" />
    </svg>
  );
}

const FLAG_COMPONENTS: Record<Locale, React.FC<FlagProps>> = {
  en: GBFlag,
  uz: UZFlag,
  ru: RUFlag,
};

export { GBFlag, UZFlag, RUFlag, FLAG_COMPONENTS };
export type { FlagProps };
