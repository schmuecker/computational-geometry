import { HeroIcon } from "./HeroIcon";

export interface Link {
  name: string;
  href: string;
  current: boolean;
  icon: HeroIcon;
  hardRefresh?: boolean;
}
