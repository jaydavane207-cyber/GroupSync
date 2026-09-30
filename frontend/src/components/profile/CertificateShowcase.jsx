import React from 'react';
import { Award, ExternalLink } from 'lucide-react';

export const CertificateShowcase = ({ certificates = [] }) => {
  return (
    <div className="glass-card p-5">
      <h4 className="text-xs font-semibold text-gs-text-main mb-4">Credentials & Certifications</h4>
      <div className="space-y-3">
        {certificates.length === 0 ? (
          <p className="text-xs text-gs-text-muted">No verified certificates uploaded.</p>
        ) : (
          certificates.map((cert) => (
            <div key={cert.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#6D6AF6]/15 text-[#6D6AF6]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-gs-text-main">{cert.title}</h5>
                  <p className="text-[10px] text-gs-text-muted">{cert.issuer} • {cert.issue_date}</p>
                </div>
              </div>
              {cert.credential_url && (
                <a
                  href={cert.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gs-text-muted hover:text-gs-text-main"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CertificateShowcase;
