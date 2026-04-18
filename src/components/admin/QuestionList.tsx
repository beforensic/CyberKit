import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit2, AlertCircle, CheckCircle, Search, Filter } from 'lucide-react';

export default function QuestionList() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchQuestions();
    }, []);

    async function fetchQuestions() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('questions')
                .select(`
          id,
          text,
          points,
          quiz_profiles (name)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuestions(data || []);
        } catch (err) {
            console.error('Erreur questions:', err);
        } finally {
            setLoading(false);
        }
    }

    const deleteQuestion = async (id: string) => {
        if (!confirm('Supprimer cette question ?')) return;
        const { error } = await supabase.from('questions').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchQuestions();
    };

    const filteredQuestions = questions.filter(q =>
        q.text.toLowerCase().includes(filter.toLowerCase()) ||
        q.quiz_profiles?.name.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher une question ou un profil..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-slate-400">Chargement des questions...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Question</th>
                                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Profil</th>
                                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredQuestions.map((q) => (
                                <tr key={q.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-4 px-4">
                                        <p className="font-bold text-slate-700 leading-tight">{q.text}</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold">
                                            {q.quiz_profiles?.name || 'Générique'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <button
                                            onClick={() => deleteQuestion(q.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredQuestions.length === 0 && (
                        <div className="py-20 text-center text-slate-400">Aucune question trouvée.</div>
                    )}
                </div>
            )}
        </div>
    );
}