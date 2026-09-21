import type { ReactNode } from 'react';
import { describeValue, getAxis } from '../domain/axes';
import type { AxisId, Provenance, Verdict } from '../domain/types';

const VERDICT_LABEL: Record<Verdict, string> = {
  'strong-fit': 'Strong fit',
  'possible-fit': 'Possible fit',
  'weak-fit': 'Weak fit',
  'ruled-out': 'Ruled out',
  'too-little-data': 'Needs answers',
};

export function VerdictChip({ verdict }: { verdict: Verdict }) {
  return <span className={`chip chip--${verdict}`}>{VERDICT_LABEL[verdict]}</span>;
}

export function Score({ value, confidence }: { value: number; confidence: number }) {
  const muted = confidence < 0.35;
  return (
    <div className={`score ${muted ? 'score--muted' : ''}`}>
      <div className="score__number">{muted ? '—' : Math.round(value)}</div>
      <div className="score__caption">{muted ? 'not enough data' : 'match'}</div>
    </div>
  );
}

export function Meter({
  value,
  label,
  tone = 'accent',
}: {
  value: number; // 0-1
  label?: ReactNode;
  tone?: 'accent' | 'warn' | 'muted';
}) {
  return (
    <div className="meter">
      <div className="meter__track">
        <div
          className={`meter__fill meter__fill--${tone}`}
          style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%` }}
        />
      </div>
      {label != null && <div className="meter__label">{label}</div>}
    </div>
  );
}

const PROVENANCE_LABEL: Record<Provenance, string> = {
  stated: 'church states this',
  observed: 'you observed this',
  inferred: 'inferred',
  assumed: 'assumed',
};

export function ProvenanceTag({
  provenance,
  confidence,
}: {
  provenance: Provenance;
  confidence: number;
}) {
  return (
    <span className={`prov prov--${provenance}`} title={`Confidence ${Math.round(confidence * 100)}%`}>
      {PROVENANCE_LABEL[provenance]} · {Math.round(confidence * 100)}%
    </span>
  );
}

/**
 * A spectrum with your target and the church's position marked on it. Far more
 * legible than two numbers, because the distance *is* the finding.
 */
export function AxisTrack({
  axisId,
  target,
  value,
}: {
  axisId: AxisId;
  target: number;
  value?: number;
}) {
  const axis = getAxis(axisId);
  return (
    <div className="track">
      <div className="track__line">
        <div className="track__marker track__marker--target" style={{ left: `${target}%` }}>
          <span className="track__flag">you</span>
        </div>
        {value !== undefined && (
          <div className="track__marker track__marker--value" style={{ left: `${value}%` }}>
            <span className="track__flag track__flag--value">them</span>
          </div>
        )}
      </div>
      <div className="track__ends">
        <span>{axis.lowLabel}</span>
        <span>{axis.highLabel}</span>
      </div>
    </div>
  );
}

export function AnchorLabel({ axisId, value }: { axisId: AxisId; value: number }) {
  const anchor = describeValue(axisId, value);
  return (
    <span className="anchor" title={anchor.description}>
      {anchor.exact ? anchor.label : `~ ${anchor.label}`}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>;
}
