'use client';

import { getTrainerImageSources } from '../lib/assets';

type TrainerPhotoProps = {
  trainerId: string;
  trainerName: string;
  trainerSlug?: string | null;
  source?: string | null;
  ruleset?: string | null;
  location?: string | null;
  size?: number;
  rounded?: number;
};

function portraitFrameStyle(size: number, rounded: number) {
  return {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: `${rounded}px`,
    overflow: 'hidden',
    border: '1px solid var(--border-soft)',
    background: 'linear-gradient(180deg, var(--surface-card) 0%, var(--surface-muted) 100%)',
    display: 'grid',
    placeItems: 'center',
  } as const;
}

export default function TrainerPhoto({
  trainerId,
  trainerName,
  trainerSlug = null,
  source = null,
  ruleset = null,
  location = null,
  size = 52,
  rounded = 16,
}: TrainerPhotoProps) {
  const image = getTrainerImageSources({
    trainerId,
    trainerName,
    trainerSlug,
    source,
    ruleset,
    location,
  });

  if (!image.src) {
    return null;
  }

  if (image.layout === 'duo') {
    const wideWidth = size * 2 + 6;
    return (
      <div
        aria-hidden="true"
        style={{
          width: `${wideWidth}px`,
          height: `${size}px`,
          borderRadius: `${rounded}px`,
          overflow: 'hidden',
          border: '1px solid var(--border-soft)',
          background: 'linear-gradient(180deg, var(--surface-card) 0%, var(--surface-muted) 100%)',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <img
          src={image.src}
          alt={trainerName}
          width={wideWidth}
          height={size}
          loading="eager"
          style={{
            display: 'block',
            width: `${wideWidth}px`,
            height: `${size}px`,
            objectFit: 'cover',
            objectPosition: 'center center',
          }}
        />
      </div>
    );
  }

  return (
    <div aria-hidden="true" style={{ ...portraitFrameStyle(size, rounded), flexShrink: 0 }}>
      <img
        src={image.src}
        alt={trainerName}
        width={size}
        height={size}
        loading="eager"
        style={{ display: 'block', width: `${size}px`, height: `${size}px`, objectFit: 'cover' }}
      />
    </div>
  );
}
