import React from 'react';
import { Fixture } from '../types';
import { FolderGit2, FileCode, Check } from 'lucide-react';

interface ProjectSelectorProps {
  fixtures: Fixture[];
  selectedFixtureId: string;
  onSelectFixture: (fixtureId: string) => void;
  disabled?: boolean;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  fixtures,
  selectedFixtureId,
  onSelectFixture,
  disabled = false
}) => {
  const activeFixture = fixtures.find((f) => f.id === selectedFixtureId) || fixtures[0];

  return (
    <div className="project-bar">
      <div className="project-bar-left">
        <div className="project-bar-title">
          <FolderGit2 size={18} className="text-blue-600" />
          <span>Prepared Test Fixture</span>
          {activeFixture && (
            <span
              style={{
                fontSize: '0.72rem',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}
            >
              {activeFixture.language}
            </span>
          )}
        </div>
        <div className="project-bar-desc">
          {activeFixture ? activeFixture.description : 'Select a prepared test fixture to verify AI code fixes.'}
        </div>
      </div>

      <div className="project-options" role="tablist" aria-label="Select Test Project">
        {fixtures.map((fixture) => {
          const isSelected = fixture.id === selectedFixtureId;
          return (
            <button
              key={fixture.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              disabled={disabled}
              className={`project-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectFixture(fixture.id)}
            >
              <FileCode size={15} />
              <span>{fixture.name}</span>
              {isSelected && <Check size={14} style={{ color: '#60a5fa' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

