import { useState } from 'react';
import api from '../../lib/api.js';

const TYPE_CONFIG = {
  youtube: {
    label: 'YouTube',
    icon: YoutubeIcon,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  documentation: {
    label: 'Docs',
    icon: DocsIcon,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  repository: {
    label: 'Repo',
    icon: RepoIcon,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
};

// variant: 'student' | 'public' | 'admin'
export default function ResourceCard({ resource, variant = 'public', onSaveToggle, onEdit, onDelete }) {
  const config = TYPE_CONFIG[resource.type] || TYPE_CONFIG.documentation;
  const Icon = config.icon;
  const [saving, setSaving] = useState(false);

  async function handleSaveToggle(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onSaveToggle(resource.id, resource.is_saved);
    } finally {
      setSaving(false);
    }
  }

  const isClickable = variant !== 'admin';

  const cardContent = (
    <>
      {/* Top row — type badge + actions */}
      <div className="flex items-center justify-between">
        <span className={`badge border ${config.bg} ${config.color} flex items-center gap-1`}>
          <Icon />
          {config.label}
        </span>

        <div className="flex items-center gap-1">
          {/* Student save button */}
          {variant === 'student' && onSaveToggle && (
            <button
              onClick={handleSaveToggle}
              disabled={saving}
              aria-label={resource.is_saved ? 'Unsave resource' : 'Save resource'}
              className={`p-1.5 rounded-md transition-colors duration-200 cursor-pointer focus-ring
                ${resource.is_saved
                  ? 'text-accent hover:text-accent-dim'
                  : 'text-zinc-600 hover:text-zinc-300'
                } ${saving ? 'opacity-40' : ''}`}
            >
              <BookmarkIcon filled={resource.is_saved} />
            </button>
          )}

          {/* Admin actions */}
          {variant === 'admin' && (
            <>
              <button
                onClick={() => onEdit(resource)}
                aria-label="Edit resource"
                className="p-1.5 rounded-md text-zinc-600 hover:text-white hover:bg-surface-2 transition-colors duration-200 cursor-pointer focus-ring"
              >
                <EditIcon />
              </button>
              <button
                onClick={() => onDelete(resource.id)}
                aria-label="Delete resource"
                className="p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer focus-ring"
              >
                <TrashIcon />
              </button>
            </>
          )}

          {/* External icon for admin (not clickable card) */}
          {variant === 'admin' && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open resource"
              onClick={e => e.stopPropagation()}
              className="p-1.5 rounded-md text-zinc-600 hover:text-white hover:bg-surface-2 transition-colors duration-200 cursor-pointer focus-ring"
            >
              <ExternalIcon />
            </a>
          )}
        </div>
      </div>

      {/* Title + subtitle */}
      <div className="flex-1">
        <h3 className="font-heading font-semibold text-white text-sm leading-snug line-clamp-2 mb-1">
          {resource.title}
        </h3>
        {resource.subtitle && (
          <p className="text-zinc-500 font-body text-xs leading-relaxed line-clamp-2">
            {resource.subtitle}
          </p>
        )}
        {variant === 'admin' && (
          <p className="text-zinc-600 text-xs font-body mt-1.5">
            Group: <span className="text-zinc-400">{resource.target_group === 'all' ? 'All groups' : resource.target_group === 'none' ? 'None' : `Group ${resource.target_group}`}</span>
            {resource.is_public && <span className="text-accent ml-2">· Public</span>}
            {resource.category && <span className="text-zinc-600 ml-2 capitalize">· {resource.category}</span>}
          </p>
        )}
      </div>
    </>
  );

  if (isClickable) {
    return (
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="card group flex flex-col gap-3 cursor-pointer hover:border-zinc-700 transition-colors duration-200"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div className="card group flex flex-col gap-3">
      {cardContent}
    </div>
  );
}

function YoutubeIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function RepoIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function BookmarkIcon({ filled }) {
  return filled ? (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.75 2.25A.75.75 0 017.5 3v.75h9V3a.75.75 0 011.5 0v.75h.75A2.25 2.25 0 0121 6v14.25a.75.75 0 01-1.22.583L12 15.43l-7.78 5.403A.75.75 0 013 20.25V6A2.25 2.25 0 015.25 3.75H6V3a.75.75 0 01.75-.75z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}
