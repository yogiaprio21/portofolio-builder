import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(() => {
  vi.stubGlobal('DOMMatrix', class DOMMatrix {});
  vi.stubGlobal('ImageData', class ImageData {});
  vi.stubGlobal('Path2D', class Path2D {});
});

describe('cv parser helpers', () => {
  it('cleans broken PDF words and undefined placeholders', async () => {
    const { cleanCvText } = await import('./parser');
    expect(cleanCvText('Front - End Developer\nOct undefined - 2025')).toBe(
      'Front-End Developer\nOct - 2025',
    );
  });

  it('segments profile before later CV sections', async () => {
    const { segmentCvText } = await import('./parser');
    const segmented = segmentCvText(
      [
        'Yogi Aprio',
        'PROFILE Fullstack developer with React and Node.js.',
        'EDUCATION',
        'Universitas Lampung',
        'WORK EXPERIENCE',
        'Museum Lampung Oct 2024 - August 2025',
      ].join('\n'),
    );

    expect(segmented.sections.summary).toEqual(['Fullstack developer with React and Node.js.']);
    expect(segmented.sections.education).toEqual(['Universitas Lampung']);
    expect(segmented.sections.workExperience).toEqual(['Museum Lampung Oct 2024 - August 2025']);
  });
});
