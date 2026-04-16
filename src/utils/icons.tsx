import * as LucideIcons from 'lucide-react';

export const getIconComponent = (iconName: string | null | undefined) => {
  // 1. Si pas de nom, on met un bouclier par défaut (plus "Cyber" que le point d'interrogation)
  if (!iconName) {
    return LucideIcons.Shield;
  }

  // 2. On prépare le nom (nettoyage des espaces et mise en minuscule pour comparer)
  const name = iconName.toLowerCase().trim();

  // 3. Table de correspondance (Mapping)
  // On lie tes noms de thèmes ou tes identifiants en DB aux vraies icônes Lucide
  const map: Record<string, any> = {
    // Noms standards (si minuscule en DB)
    'shield': LucideIcons.Shield,
    'lock': LucideIcons.Lock,
    'key': LucideIcons.Key,
    'users': LucideIcons.Users,
    'file-text': LucideIcons.FileText,
    'database': LucideIcons.Database,
    'eye': LucideIcons.Eye,
    'share-2': LucideIcons.Share2,
    'book-open': LucideIcons.BookOpen,
    'shield-alert': LucideIcons.ShieldAlert,
    'alert-triangle': LucideIcons.AlertTriangle,

    // Correspondance avec tes thèmes réels (en français ou identifiants)
    'gouvernance': LucideIcons.Shield,
    'confidentialite': LucideIcons.Lock,
    'mots de passe': LucideIcons.Key,
    'mots-de-passe': LucideIcons.Key,
    'sauvegardes': LucideIcons.Database,
    'malveillance': LucideIcons.ShieldAlert,
    'reseaux sociaux': LucideIcons.Share2,
    'reseaux-sociaux': LucideIcons.Share2,
    'juridique': LucideIcons.FileText,
    'ingenierie sociale': LucideIcons.Eye,
    'ingenierie-sociale': LucideIcons.Eye,
    'generalites': LucideIcons.BookOpen
  };

  // 4. Tentative de récupération via le mapping
  if (map[name]) {
    return map[name];
  }

  // 5. Tentative de récupération dynamique (si tu as mis "Shield" avec la majuscule en DB)
  const DynamicIcon = (LucideIcons as any)[iconName];
  if (DynamicIcon) {
    return DynamicIcon;
  }

  // 6. Si vraiment rien n'est trouvé, on retourne Shield au lieu de HelpCircle
  return LucideIcons.Shield;
};