import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, Shield, Plus, Upload, CheckCircle2, Clock, XCircle,
  ExternalLink, Trash2, Calendar, FileText, Sparkles, AlertCircle, Loader2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getUserBadges, calculateCredibilityScore } from '../lib/quizService';
import {
  getCertificates, uploadCertificateFile, saveCertificate,
  deleteCertificate, getVerificationBadge
} from '../lib/certificateService';

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

      showToast('Certificate submitted for review! ⏳', 'success');
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
    endorsementCount: 2, // starter/mock endorsement baseline
    projectCount: 1
  });

  return (
    <div className="space-y-8 animate-[load-fade-up_0.4s_ease-out]">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black font-heading text-[var(--color-gs-text-main)] tracking-tight">
            Verified Badges & <span className="text-[var(--color-gs-cyan)]">Credentials</span>
          </h1>
          <p className="text-[var(--color-gs-text-muted)] mt-1">
            Display your verified technical skills, badges, and professional certificates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/quiz')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] text-sm font-bold text-[var(--color-gs-text-main)] hover:border-[var(--color-gs-cyan)]/40 transition-colors"
          >
            <Sparkles size={16} className="text-[var(--color-gs-cyan)]" />
            Take Quizzes
          </button>
          <button
            onClick={() => setShowCertModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--color-gs-cyan)] to-[var(--color-gs-secondary)] text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-[0_4px_15px_rgba(0,240,255,0.25)]"
          >
            <Plus size={16} />
            Add Certificate
          </button>
        </div>
      </div>

      {/* ── Credibility Score Breakdown ───────────────────────────── */}
      <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="text-xs font-black tracking-widest text-[var(--color-gs-cyan)] uppercase">
              Student Credibility Score
            </div>
            <h2 className="text-2xl font-black font-heading text-white">Trust & Verification Rating</h2>
            <p className="text-sm text-[var(--color-gs-text-muted)] max-w-xl">
              Weighted index calculated from passed skill assessments, authenticated certificates, peer endorsements, and completed campus projects.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[var(--color-gs-bg)] px-8 py-5 rounded-2xl border border-[var(--color-gs-border)] shrink-0">
            <Shield size={36} className="text-[var(--color-gs-cyan)] animate-pulse" />
            <div>
              <div className="text-4xl font-black font-heading text-white">{totalCredibility} <span className="text-base text-[var(--color-gs-text-muted)]">/ 100</span></div>
              <div className="text-[10px] font-bold uppercase text-[var(--color-gs-cyan)]">Verified Rating</div>
            </div>
          </div>
        </div>

        {/* Weights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5 text-xs text-[var(--color-gs-text-muted)]">
          <div>
            <span className="font-bold text-white block">Quizzes (40%)</span>
            <span>{badges.length} verified badges</span>
          </div>
          <div>
            <span className="font-bold text-white block">Certificates (35%)</span>
            <span>{verifiedCertCount} verified / {certificates.length} total</span>
          </div>
          <div>
            <span className="font-bold text-white block">Endorsements (20%)</span>
            <span>2 peer endorsements</span>
          </div>
          <div>
            <span className="font-bold text-white block">Projects (5%)</span>
            <span>Active team contributor</span>
          </div>
        </div>
      </div>

      {/* ── Earned Badges Grid ────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading text-[var(--color-gs-text-main)] flex items-center gap-2">
            <Award size={20} className="text-[var(--color-gs-cyan)]" />
            Earned Skill Badges ({badges.length})
          </h2>
        </div>

        {badges.length === 0 ? (
          <div className="p-12 text-center bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl text-[var(--color-gs-text-muted)]">
            <Award size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm text-[var(--color-gs-text-main)]">No skill badges earned yet</p>
            <p className="text-xs mt-1 mb-4">Pass our technical quizzes with 60%+ score to verify your skills.</p>
            <button
              onClick={() => navigate('/quiz')}
              className="px-5 py-2.5 bg-[var(--color-gs-cyan)] text-[#0f172a] rounded-xl text-xs font-bold hover:bg-cyan-400 transition-colors"
            >
              Take a Skill Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {badges.map(b => (
              <div
                key={b.id}
                className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-5 flex items-center gap-4 hover:border-[var(--color-gs-cyan)]/40 transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-gs-cyan)]/20 to-[var(--color-gs-secondary)]/20 border border-white/10 flex items-center justify-center text-3xl shrink-0">
                  {b.badge_tier === 'platinum' ? '💎' :
                   b.badge_tier === 'gold' ? '🥇' :
                   b.badge_tier === 'silver' ? '🥈' : '🥉'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gs-cyan)]">
                      {b.badge_tier}
                    </span>
                    <span className="text-[10px] text-[var(--color-gs-text-muted)]">
                      · {Math.round(b.quiz_score || 0)}%
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white truncate">{b.badge_name}</h3>
                  <div className="text-[10px] text-[var(--color-gs-text-muted)] mt-1">
                    {new Date(b.earned_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Certificates Section ──────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading text-[var(--color-gs-text-main)] flex items-center gap-2">
            <Shield size={20} className="text-[var(--color-gs-secondary)]" />
            Certificates & Credentials ({certificates.length})
          </h2>
        </div>

        {certificates.length === 0 ? (
          <div className="p-12 text-center bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl text-[var(--color-gs-text-muted)]">
            <Shield size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm text-[var(--color-gs-text-main)]">No uploaded certificates</p>
            <p className="text-xs mt-1 mb-4">Add your AWS, Google, Coursera, or university certificates.</p>
            <button
              onClick={() => setShowCertModal(true)}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Upload Certificate
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map(cert => {
              const statusBadge = getVerificationBadge(cert.verification_status);
              return (
                <div
                  key={cert.id}
                  className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${statusBadge.bg} ${statusBadge.color}`}>
                          <span>{statusBadge.emoji}</span>
                          {statusBadge.label}
                        </span>
                        <span className="text-[10px] text-[var(--color-gs-text-muted)] uppercase tracking-wider font-bold">
                          {cert.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">{cert.certificate_name}</h3>
                      <p className="text-xs text-[var(--color-gs-text-muted)] mt-0.5">{cert.issuing_organization}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteCert(cert.id)}
                      className="p-2 text-[var(--color-gs-text-muted)] hover:text-rose-400 transition-colors"
                      title="Remove certificate"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-[var(--color-gs-text-muted)]">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      Issued: {new Date(cert.issue_date).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                    </div>

                    <div className="flex items-center gap-3">
                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[var(--color-gs-cyan)] hover:underline"
                        >
                          Verify Link <ExternalLink size={11} />
                        </a>
                      )}
                      {cert.certificate_file_url && (
                        <a
                          href={cert.certificate_file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[var(--color-gs-secondary)] hover:underline"
                        >
                          View File <FileText size={11} />
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

      {/* ── Modal for Adding Certificate ───────────────────────────── */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-heading text-white">Add Certificate</h3>
                <p className="text-xs text-[var(--color-gs-text-muted)]">Submit credentials for verified profile status</p>
              </div>
              <button
                onClick={() => setShowCertModal(false)}
                className="text-[var(--color-gs-text-muted)] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCertSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Certificate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certified Cloud Practitioner"
                  value={certForm.name}
                  onChange={e => setCertForm({ ...certForm, name: e.target.value })}
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Issuing Organization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services, Coursera, Meta"
                  value={certForm.issuer}
                  onChange={e => setCertForm({ ...certForm, issuer: e.target.value })}
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={certForm.issueDate}
                    onChange={e => setCertForm({ ...certForm, issueDate: e.target.value })}
                    className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={certForm.expirationDate}
                    onChange={e => setCertForm({ ...certForm, expirationDate: e.target.value })}
                    className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Credential URL or Verification Link</label>
                <input
                  type="url"
                  placeholder="https://coursera.org/verify/..."
                  value={certForm.credentialUrl}
                  onChange={e => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Certificate Document (PDF/Image, max 5MB)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={e => setCertFile(e.target.files[0] || null)}
                  className="w-full text-xs text-[var(--color-gs-text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                />
              </div>

              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[var(--color-gs-text-muted)]">
                    <span>Uploading file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-[var(--color-gs-bg)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-gs-cyan)] rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="flex-1 py-3 rounded-xl border border-[var(--color-gs-border)] text-sm font-bold text-[var(--color-gs-text-muted)] hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCert}
                  className="flex-1 py-3 rounded-xl bg-[var(--color-gs-cyan)] text-[#0f172a] text-sm font-bold hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingCert ? <Loader2 size={16} className="animate-spin" /> : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
