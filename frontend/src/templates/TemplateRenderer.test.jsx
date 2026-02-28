import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TemplateRenderer from './TemplateRenderer.jsx';

describe('TemplateRenderer', () => {
  it('renders summary and sections based on order', () => {
    const data = {
      cv: {
        personal: { fullName: 'Nama Lengkap', headline: 'Engineer' },
        summary: { id: 'Ringkasan singkat', en: 'Short summary' },
        workExperience: [
          {
            role: { id: 'Dev' },
            company: { id: 'ACME' },
            location: { id: 'Jakarta' },
            startDate: '2020',
            endDate: '2022',
            highlights: ['A', 'B'],
          },
        ],
        education: [
          { degree: { id: 'S1' }, institution: { id: 'UI' }, startDate: '2016', endDate: '2020' },
        ],
        skills: [{ category: { id: 'Teknis' }, items: ['React', 'Node'] }],
      },
      languageBySection: { summary: 'id' },
    };
    render(
      <TemplateRenderer
        data={data}
        template={{
          layout: 'single',
          sections: ['summary', 'workExperience', 'education', 'skills'],
        }}
        sectionsOrder={[]}
      />,
    );

    expect(screen.getByText('Nama Lengkap')).toBeInTheDocument();
    expect(screen.getByText('Ringkasan')).toBeInTheDocument();
    expect(screen.getByText('Ringkasan singkat')).toBeInTheDocument();
    expect(screen.getByText('Pengalaman Kerja')).toBeInTheDocument();
    expect(screen.getByText(/ACME/)).toBeInTheDocument();
    expect(screen.getByText('Pendidikan')).toBeInTheDocument();
    expect(screen.getByText('S1')).toBeInTheDocument();
    expect(screen.getByText('Keahlian')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });
});
