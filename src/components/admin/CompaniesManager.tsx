import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Building2,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  Crown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  admin_email: string;
  status: string;
  max_members: number;
  is_active: boolean;
  created_at: string;
}

interface CompanyStats {
  members_count: number;
  active_members_count: number;
  diagnostics_count: number;
}

export default function CompaniesManager() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<Record<string, CompanyStats>>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { count } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      setTotalCompanies(count || 0);

      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (companiesError) throw companiesError;

      setCompanies(companiesData || []);

      const statsPromises = (companiesData || []).map(async (company) => {
        const [membersRes, activeMembersRes, diagnosticsRes] = await Promise.all([
          supabase
            .from('company_members')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', company.id),
          supabase
            .from('company_members')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', company.id)
            .eq('status', 'active'),
          supabase
            .from('company_diagnostics')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', company.id)
        ]);

        return {
          id: company.id,
          stats: {
            members_count: membersRes.count || 0,
            active_members_count: activeMembersRes.count || 0,
            diagnostics_count: diagnosticsRes.count || 0
          }
        };
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<string, CompanyStats> = {};
      statsResults.forEach(({ id, stats }) => {
        statsMap[id] = stats;
      });
      setStats(statsMap);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyDetails = async (companyId: string) => {
    try {
      const [membersRes, diagnosticsRes] = await Promise.all([
        supabase
          .from('company_members')
          .select('*')
          .eq('company_id', companyId)
          .order('status', { ascending: true })
          .order('created_at', { ascending: false }),
        supabase
          .from('company_diagnostics')
          .select('*, company_members(*)')
          .eq('company_id', companyId)
          .order('completed_at', { ascending: false })
      ]);

      setCompanyDetails({
        members: membersRes.data || [],
        diagnostics: diagnosticsRes.data || []
      });
    } catch (error) {
      console.error('Erreur chargement détails:', error);
    }
  };

  const toggleCompanyStatus = async (companyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ is_active: !currentStatus })
        .eq('id', companyId);

      if (error) throw error;

      loadData();
      alert(`Entreprise ${!currentStatus ? 'activée' : 'désactivée'} avec succès`);
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const upgradeToPremium = async (companyId: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          status: 'paid',
          max_members: 9999
        })
        .eq('id', companyId);

      if (error) throw error;

      loadData();
      alert('Entreprise passée en Premium avec succès');
    } catch (error) {
      console.error('Erreur upgrade Premium:', error);
      alert('Erreur lors du passage en Premium');
    }
  };

  const handleViewDetails = (companyId: string) => {
    setSelectedCompany(companyId);
    loadCompanyDetails(companyId);
  };

  const totalPages = Math.ceil(totalCompanies / itemsPerPage);
  const activeCompanies = companies.filter(c => c.is_active).length;
  const totalMembers = Object.values(stats).reduce((sum, s) => sum + s.members_count, 0);
  const totalDiagnostics = Object.values(stats).reduce((sum, s) => sum + s.diagnostics_count, 0);

  if (loading && companies.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (selectedCompany) {
    const company = companies.find(c => c.id === selectedCompany);
    return (
      <div>
        <button
          onClick={() => {
            setSelectedCompany(null);
            setCompanyDetails(null);
          }}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Retour à la liste
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{company?.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-600">Email admin</p>
              <p className="font-medium">{company?.admin_email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Plan</p>
              <p className="font-medium">{company?.status === 'paid' ? 'Premium' : 'Gratuit'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Statut</p>
              <p className="font-medium">{company?.is_active ? 'Actif' : 'Inactif'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Date création</p>
              <p className="font-medium">{new Date(company?.created_at || '').toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        {companyDetails && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Membres ({companyDetails.members.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Nom</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Rôle</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {companyDetails.members.map((member: any) => (
                      <tr key={member.id}>
                        <td className="px-4 py-3 text-sm">
                          {member.first_name && member.last_name
                            ? `${member.first_name} ${member.last_name}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">{member.email}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {member.role === 'admin' ? 'Admin' : 'Membre'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {member.status === 'active' ? 'Actif' : 'En attente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Diagnostics ({companyDetails.diagnostics.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Membre</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Niveau</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {companyDetails.diagnostics.map((diagnostic: any) => (
                      <tr key={diagnostic.id}>
                        <td className="px-4 py-3 text-sm">
                          {diagnostic.company_members?.first_name && diagnostic.company_members?.last_name
                            ? `${diagnostic.company_members.first_name} ${diagnostic.company_members.last_name}`
                            : diagnostic.company_members?.email || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">{diagnostic.score}/100</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            diagnostic.score < 40
                              ? 'bg-red-100 text-red-700'
                              : diagnostic.score < 70
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {diagnostic.risk_level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(diagnostic.completed_at).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600">Entreprises inscrites</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalCompanies}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-sm text-slate-600">Entreprises actives</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{activeCompanies}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-slate-600">Total membres</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalMembers}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm text-slate-600">Diagnostics complétés</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalDiagnostics}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden md:table-cell">
                  Email admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Membres
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden lg:table-cell">
                  Diagnostics
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden xl:table-cell">
                  Date création
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {companies.map((company) => {
                const companyStats = stats[company.id] || { members_count: 0, active_members_count: 0, diagnostics_count: 0 };
                return (
                  <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{company.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                      {company.admin_email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                        company.status === 'paid'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {company.status === 'paid' && <Crown className="w-3 h-3" />}
                        {company.status === 'paid' ? 'Premium' : 'Gratuit'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {companyStats.active_members_count} / {company.max_members}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 hidden lg:table-cell">
                      {companyStats.diagnostics_count}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 hidden xl:table-cell">
                      {new Date(company.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        company.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {company.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(company.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {company.status === 'free' && (
                          <button
                            onClick={() => upgradeToPremium(company.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Passer en Premium"
                          >
                            <Crown className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleCompanyStatus(company.id, company.is_active)}
                          className={`p-2 rounded-lg transition-colors ${
                            company.is_active
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={company.is_active ? 'Désactiver' : 'Activer'}
                        >
                          {company.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Page {currentPage} sur {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
