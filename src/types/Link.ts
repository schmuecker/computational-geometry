import { HeroIcon } from "./HeroIcon";
import { Path } from "./Path";

export interface Link {
  name: string;
  href: Path;
  current: boolean;
  icon: HeroIcon;
  hardRefresh?: boolean;
}
