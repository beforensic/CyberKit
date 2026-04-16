import * as LucideIcons from 'lucide-react';

export const getIconComponent = (name: string | null | undefined) => {
  if (!name) return LucideIcons.Shield;

  const cleanName = name.toLowerCase().trim();

  // Mapping ultra-précis basé sur tes catégories réelles
  const map: Record<string, any> = {
    'cadre juridique': LucideIcons.Gavel,
    'confidentialité': LucideIcons.EyeOff,
    'généralités': LucideIcons.Info,
    'gouvernance': LucideIcons.ShieldCheck,
    'ingénierie sociale': LucideIcons.Users,
    'malveillance': LucideIcons.Zap,
    'mots de passe': LucideIcons.Key,
    'réseaux sociaux': LucideIcons.Share2,
    'ressources externes': LucideIcons.ExternalLink,
    'sauvegardes': LucideIcons.Database,
    'systèmes d\'information': LucideIcons.Network,
    'zone expérimentale': LucideIcons.Beaker,
    // Fallbacks au cas où
    'video': LucideIcons.PlayCircle,
    'audio': LucideIcons.Headphones,
    'guide': LucideIcons.FileText
  };

  return map[cleanName] || LucideIcons.Shield;
};