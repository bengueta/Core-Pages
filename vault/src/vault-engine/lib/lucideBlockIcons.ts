import type { LucideIcon } from "lucide-react";
import {
  Layout,
  ImagePlus,
  Quote,
  MousePointerClick,
  Space,
  Minus,
  Heading,
  AlignRight,
  BarChart3,
  AlertCircle,
  List,
  Video,
  LayoutGrid,
  HelpCircle,
  Zap,
  CheckSquare,
  CreditCard,
  GitBranch,
  Code2,
  Lightbulb,
  User,
  FileCode,
  Gauge,
} from "lucide-react";

/** Lucide icons for the `icon` field in BLOCKS_CONFIG (block picker grid). */
const LUCIDE_BY_BLOCK_CONFIG_NAME: Record<string, LucideIcon> = {
  Layout, ImagePlus, Quote, MousePointerClick, Space, Minus, Heading, AlignRight,
  BarChart3, AlertCircle, List, Video, LayoutGrid, HelpCircle, Zap, CheckSquare,
  CreditCard, GitBranch, Code2, Lightbulb, User, FileCode, Gauge,
};

export function getBlockConfigIcon(configIconName: string, fallback: LucideIcon = Layout): LucideIcon {
  return LUCIDE_BY_BLOCK_CONFIG_NAME[configIconName] ?? fallback;
}
