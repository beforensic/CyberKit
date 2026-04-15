/* --- Admin.tsx mis à jour --- */
import { useState, useEffect } from 'react';
import { Plus, Loader, Shield, ArrowLeft, Palette, Tag, MessageCircle, Eye, EyeOff, Building2, BarChart3 } from 'lucide-react';
import { supabase, Resource, Theme, ResourceType } from '../lib/supabase';
import ResourceList from '../components/admin/ResourceList';
import ResourceForm from '../components/admin/ResourceForm';
// ... (garder les autres imports identiques)

export default function Admin({ onNavigate }: any) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]); // AJOUTÉ
  const [loading, setLoading] = useState(true);
  // ... (garder les autres states identiques)

  useEffect(() => { checkAuth(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [themesRes, resourcesRes, typesRes] = await Promise.all([
        supabase.from('themes').select('*').order('title'),
        supabase.from('resources').select('*, theme:themes(*)').order('title'),
        supabase.from('resource_types').select('*').order('name') // AJOUTÉ
      ]);

      setThemes(themesRes.data || []);
      setResources(resourcesRes.data || []);
      setResourceTypes(typesRes.data || []); // AJOUTÉ
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ... (garder les fonctions de login/logout/delete identiques)

  return (
    // ... (garder le début du return identique jusqu'au ResourceForm)
    <ResourceForm
      themes={themes}
      resourceTypes={resourceTypes} // AJOUTÉ
      resource={editingResource}
      onSuccess={() => { setShowForm(false); fetchData(); }}
      onCancel={() => setShowForm(false)}
    />
    // ...
  );
}