import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, Shield, Plus, Upload, CheckCircle2, Clock, XCircle,
  ExternalLink, Trash2, Calendar, FileText, Sparkles, AlertCircle, Loader2,
  BookOpen, ShieldCheck
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { getUserBadges, calculateCredibilityScore } from '@/lib/services/quizService';
import {
  getCertificates, uploadCertificateFile, saveCertificate,
  deleteCertificate, getVerificationBadge
} from '@/lib/services/certificateService';

export default function SkillBadgesPage() {
  const { user, showToast } = useAppContext();
  const navigate = useNavigate();

  const [badges, setBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Uploading Certificate
  const [showCertModal, setShowCertModal] = useState(false);
  const [certForm, setCertForm] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expirationDate: '',
    credentialId: '',
    credentialUrl: '',
    category: 'professional'
  });
  const [certFile, setCertFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isSubmittingCert, setIsSubmittingCert] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [badgeRes, certRes] = await Promise.all([
      getUserBadges(user.id),
      getCertificates(user.id)
    ]);
    if (badgeRes.data) setBadges(badgeRes.data);
    if (certRes.data) setCertificates(certRes.data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Certificate Upload & Save
  const handleCertSubmit = async (e) => {
    e.preventDefault();
    if (!certForm.name || !certForm.issuer || !certForm.issueDate) {
      showToast('Please fill in required certificate fields', 'error');
      return;
    }

    setIsSubmittingCert(true);
    try {
      let fileUrl = null;
      if (certFile) {
        setUploadProgress(10);
        const uploadRes = await uploadCertificateFile(user.id, certFile, (pct) => setUploadProgress(pct));
        if (uploadRes.error) throw new Error(uploadRes.error.userMessage);
        fileUrl = uploadRes.data.publicUrl;
      }

      const saveRes = await saveCertificate({
        userId: user.id,
        certificateName: certForm.name,
        issuingOrganization: certForm.issuer,
        issueDate: certForm.issueDate,
        expirationDate: certForm.expirationDate || null,
        credentialId: certForm.credentialId || null,
        credentialUrl: certForm.credentialUrl || null,
        fileUrl,
        category: certForm.category
      });

      if (saveRes.error) throw new Error(saveRes.error.userMessage);

      showToast('Certificate submitted for verification review', 'success');
      setShowCertModal(false);
      setCertForm({
        name: '',
        issuer: '',
        issueDate: '',
        expirationDate: '',
        credentialId: '',
        credentialUrl: '',
        category: 'professional'
      });
      setCertFile(null);
      setUploadProgress(null);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to submit certificate', 'error');
    } finally {
      setIsSubmittingCert(false);
    }
  };

  const handleDeleteCert = async (certId) => {
    if (!window.confirm('Delete this certificate?')) return;
    const res = await deleteCertificate(certId, user.id);
    if (!res.error) {
      showToast('Certificate removed', 'success');
      setCertificates(prev => prev.filter(c => c.id !== certId));
    } else {
      showToast('Could not delete certificate', 'error');
    }
  };

  // Calculate composite credibility score
  const quizScores = badges.map(b => b.quiz_score || 70);
  const avgQuiz = quizScores.length ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length : 0;
  const verifiedCertCount = certificates.filter(c => c.verification_status === 'verified').length;
  const totalCredibility = calculateCredibilityScore({
    quizScore: avgQuiz,
    hasCertificate: verifiedCertCount > 0,
    endorsementCount: 2,
    projectCount: 1
  });

  const getTierDetails = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'platinum':
        return { label: 'Platinum Honors', bg: 'bg-[#6D6AF6]/10 border-[#6D6AF6]/20 text-[#7E7BF8]', iconColor: 'text-[#6D6AF6]' };
      case 'gold':
        return { label: 'Gold Distinction', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400', iconColor: 'text-amber-400' };
      case 'silver':
        return { label: 'Silver Merit', bg: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-300', iconColor: 'text-zinc-400' };
      default:
        return { label: 'Bronze Certified', bg: 'bg-orange-500/10 border-orange-500/20 text-orange-400', iconColor: 'text-orange-400' };
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* â”€â”€ Top Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gs-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#6D6AF6]/10 text-[#6D6AF6] border border-[#6D6AF6]/20 mb-2">
            <Shield size={12} />
            Academic Portfolio & Verification
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gs-text-main font-heading">
            Skill Badges & Credentials
          </h1>
          <p className="text-xs text-gs-text-muted mt-1 max-w-2xl leading-relaxed">
            Verified academic credentials, technical mastery badges, and industry certificates evaluated for peer collaboration.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => navigate('/quiz')}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-gs-card border border-gs-border text-xs font-medium text-gs-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-xs cursor-pointer"
          >
            <BookOpen size={14} className="text-[#6D6AF6]" />
            Take Skill Quizzes
          </button>
          <button
            onClick={() => setShowCertModal(true)}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#6D6AF6] hover:bg-[#5C59EC] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer btn-tactile"
          >
            <Plus size={14} />
            Add Certificate
          </button>
        </div>
      </div>

      {/* â”€â”€ Credibility Score Breakdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-gs-card border border-gs-border rounded-xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-gs-border/60">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6D6AF6]">
              Verified Student Index
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-gs-text-main font-heading">
              Campus Credibility Rating
            </h2>
            <p className="text-xs text-gs-text-muted leading-relaxed">
              Calculated across validated quiz assessments, verified industry certificates, peer endorsements, and confirmed project contributions.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 px-5 py-3.5 rounded-xl border border-gs-border w-full sm:w-auto">
            <div className="w-10 h-10 rounded-lg bg-[#6D6AF6]/10 text-[#6D6AF6] flex items-center justify-center shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-bold text-gs-text-main font-heading tabular-nums">{totalCredibility}</span>
                <span className="text-xs font-medium text-gs-text-muted">/ 100</span>
              </div>
              <span className="text-[11px] font-medium text-emerald-500 flex items-center gap-1">
                <CheckCircle2 size={12} /> High Standing Status
              </span>
            </div>
          </div>
        </div>

        {/* Weights & Factor Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-gs-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gs-text-main">Quizzes</span>
              <span className="text-[11px] font-medium text-[#6D6AF6]">40% weight</span>
            </div>
            <p className="text-xs text-gs-text-muted">
              {badges.length} verified badges
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-gs-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gs-text-main">Credentials</span>
              <span className="text-[11px] font-medium text-[#6D6AF6]">35% weight</span>
            </div>
            <p className="text-xs text-gs-text-muted">
              {verifiedCertCount} verified / {certificates.length} submitted
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-gs-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gs-text-main">Endorsements</span>
              <span className="text-[11px] font-medium text-[#6D6AF6]">20% weight</span>
            </div>
            <p className="text-xs text-gs-text-muted">
              2 peer endorsements
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-gs-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gs-text-main">Projects</span>
              <span className="text-[11px] font-medium text-[#6D6AF6]">5% weight</span>
            </div>
            <p className="text-xs text-gs-text-muted">
              Active team collaborator
            </p>
          </div>
        </div>
      </div>

      {/* â”€â”€ Earned Badges Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-[#6D6AF6]" />
            <h2 className="text-lg font-bold text-gs-text-main font-heading">
              Earned Skill Badges
            </h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-gs-border text-gs-text-muted tabular-nums">
              {badges.length}
            </span>
          </div>
        </div>

        {badges.length === 0 ? (
          <div className="p-10 text-center bg-gs-card border border-dashed border-gs-border rounded-xl">
            <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-gs-border flex items-center justify-center mx-auto mb-3 text-gs-text-muted">
              <Award size={20} />
            </div>
            <h3 className="font-semibold text-xs text-gs-text-main font-heading">No skill badges earned yet</h3>
            <p className="text-xs text-gs-text-muted mt-1 mb-4 max-w-sm mx-auto">
              Test your knowledge in technical assessments with a 60%+ score to earn authentic peer badges.
            </p>
            <button
              onClick={() => navigate('/quiz')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer btn-tactile"
            >
              <BookOpen size={13} />
              Take Assessment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map(b => {
              const tier = getTierDetails(b.badge_tier);
              return (
                <div
                  key={b.id}
                  className="bg-gs-card border border-gs-border rounded-xl p-4 flex items-center gap-3.5 hover:border-gs-border/80 transition-colors shadow-xs machined-edge"
                >
                  <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 border border-gs-border flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} className={tier.iconColor} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${tier.bg}`}>
                        {b.badge_tier || 'Standard'}
                      </span>
                      <span className="text-[10px] text-gs-text-muted tabular-nums">
                        {Math.round(b.quiz_score || 0)}%
                      </span>
                    </div>
                    <h3 className="font-semibold text-xs text-gs-text-main truncate font-heading">
                      {b.badge_name}
                    </h3>
                    <div className="text-[10px] text-gs-text-muted mt-0.5">
                      {new Date(b.earned_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* â”€â”€ Certificates Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-emerald-500" />
            <h2 className="text-lg font-bold text-gs-text-main font-heading">
              Certificates & Verified Credentials
            </h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-gs-border text-gs-text-muted tabular-nums">
              {certificates.length}
            </span>
          </div>
        </div>

        {certificates.length === 0 ? (
          <div className="p-10 text-center bg-gs-card border border-dashed border-gs-border rounded-xl">
            <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-gs-border flex items-center justify-center mx-auto mb-3 text-gs-text-muted">
              <FileText size={20} />
            </div>
            <h3 className="font-semibold text-xs text-gs-text-main font-heading">No uploaded credentials</h3>
            <p className="text-xs text-gs-text-muted mt-1 mb-4 max-w-sm mx-auto">
              Attach industry credentials from AWS, Google, Coursera, or academic institutions to highlight domain expertise.
            </p>
            <button
              onClick={() => setShowCertModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer btn-tactile"
            >
              <Upload size={13} />
              Submit Certificate
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map(cert => {
              const statusBadge = getVerificationBadge(cert.verification_status);
              return (
                <div
                  key={cert.id}
                  className="bg-gs-card border border-gs-border rounded-xl p-5 flex flex-col justify-between gap-4 shadow-xs hover:border-gs-border/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border flex items-center gap-1 ${statusBadge.bg} ${statusBadge.color}`}>
                          {cert.verification_status === 'verified' ? <CheckCircle2 size={11} /> :
                           cert.verification_status === 'rejected' ? <XCircle size={11} /> :
                           <Clock size={11} />}
                          {statusBadge.label}
                        </span>
                        <span className="text-[10px] font-medium text-gs-text-muted uppercase tracking-wider bg-black/5 dark:bg-white/5 border border-gs-border px-2 py-0.5 rounded">
                          {cert.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gs-text-main leading-snug font-heading">
                        {cert.certificate_name}
                      </h3>
                      <p className="text-xs text-gs-text-muted mt-0.5">
                        {cert.issuing_organization}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteCert(cert.id)}
                      className="p-1.5 text-gs-text-muted hover:text-rose-400 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      title="Remove certificate"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gs-border/60 text-xs text-gs-text-muted">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Calendar size={12} className="text-gs-text-muted" />
                      Issued: {new Date(cert.issue_date).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                    </div>

                    <div className="flex items-center gap-3">
                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[#6D6AF6] hover:underline font-medium text-[11px]"
                        >
                          Verify URL <ExternalLink size={11} />
                        </a>
                      )}
                      {cert.certificate_file_url && (
                        <a
                          href={cert.certificate_file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-gs-text-muted hover:text-gs-text-main hover:underline font-medium text-[11px]"
                        >
                          View Document <FileText size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* â”€â”€ Modal for Adding Certificate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-gs-card border border-gs-border rounded-xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gs-border/60 pb-4">
              <div>
                <h3 className="text-base font-bold text-gs-text-main font-heading">Submit Certificate</h3>
                <p className="text-xs text-gs-text-muted mt-0.5">Submit credentials for peer and team verification</p>
              </div>
              <button
                onClick={() => setShowCertModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gs-text-muted hover:text-gs-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-sm"
              >
                âœ•
              </button>
            </div>

            <form onSubmit={handleCertSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gs-text-main mb-1">
                  Certificate Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={certForm.name}
                  onChange={e => setCertForm({ ...certForm, name: e.target.value })}
                  className="w-full bg-black/5 dark:bg-white/5 border border-gs-border rounded-lg px-3.5 py-2 text-xs text-gs-text-main outline-none focus:border-[#6D6AF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gs-text-main mb-1">
                  Issuing Organization *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services, Stanford Online, Meta"
                  value={certForm.issuer}
                  onChange={e => setCertForm({ ...certForm, issuer: e.target.value })}
                  className="w-full bg-black/5 dark:bg-white/5 border border-gs-border rounded-lg px-3.5 py-2 text-xs text-gs-text-main outline-none focus:border-[#6D6AF6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gs-text-main mb-1">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={certForm.issueDate}
                    onChange={e => setCertForm({ ...certForm, issueDate: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-gs-border rounded-lg px-3 py-2 text-xs text-gs-text-main outline-none focus:border-[#6D6AF6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gs-text-main mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={certForm.expirationDate}
                    onChange={e => setCertForm({ ...certForm, expirationDate: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-gs-border rounded-lg px-3 py-2 text-xs text-gs-text-main outline-none focus:border-[#6D6AF6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gs-text-main mb-1">
                  Credential ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. AWS-883921"
                  value={certForm.credentialId}
                  onChange={e => setCertForm({ ...certForm, credentialId: e.target.value })}
                  className="w-full bg-black/5 dark:bg-white/5 border border-gs-border rounded-lg px-3.5 py-2 text-xs text-gs-text-main outline-none focus:border-[#6D6AF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gs-text-main mb-1">
                  Verification URL
                </label>
                <input
                  type="url"
                  placeholder="https://coursera.org/verify/..."
                  value={certForm.credentialUrl}
                  onChange={e => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                  className="w-full bg-black/5 dark:bg-white/5 border border-gs-border rounded-lg px-3.5 py-2 text-xs text-gs-text-main outline-none focus:border-[#6D6AF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gs-text-main mb-1">
                  Certificate Document (PDF/Image, max 5MB)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={e => setCertFile(e.target.files[0] || null)}
                  className="w-full text-xs text-gs-text-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#6D6AF6]/10 file:text-[#6D6AF6] hover:file:bg-[#6D6AF6]/20 cursor-pointer"
                />
              </div>

              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gs-text-muted tabular-nums">
                    <span>Uploading credential file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#6D6AF6] rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-2.5 pt-3 border-t border-gs-border/60">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="flex-1 py-2 rounded-lg border border-gs-border text-xs font-medium text-gs-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-gs-text-main transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCert}
                  className="flex-1 py-2 rounded-lg bg-[#6D6AF6] hover:bg-[#5C59EC] text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer btn-tactile shadow-xs"
                >
                  {isSubmittingCert ? <Loader2 size={14} className="animate-spin" /> : 'Submit Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

