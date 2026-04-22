import { campus as campusList, colleges as collegeList } from '@/config';

const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[（(].*?[)）]/g, '')
    .trim();

const pickByAliases = (value, entries) => {
  const text = normalizeText(value);
  if (!text) return '';
  const lower = text.toLowerCase();
  for (const entry of entries) {
    if (!entry) continue;
    const entryText = normalizeText(entry);
    if (text === entry || lower === String(entry).toLowerCase() || text === entryText || lower === entryText.toLowerCase()) {
      return entry;
    }
  }
  return '';
};

const COURSE_TYPE_ALIASES = [
  ['compulsory', '必修课', '必修', '核心课'],
  ['elective', '选修课', '选修'],
  ['restricted_elective', '限选课', '限选'],
];

const COURSE_METHOD_ALIASES = [
  ['online', '线上', '网课', '在线'],
  ['offline', '线下', '面授'],
  ['hybrid', '混合'],
];

const buildAliasLookup = (pairs) => {
  const lookup = new Map();
  for (const [canonical, ...aliases] of pairs) {
    for (const alias of [canonical, ...aliases]) {
      lookup.set(normalizeText(alias).toLowerCase(), canonical);
    }
  }
  return lookup;
};

const courseTypeLookup = buildAliasLookup(COURSE_TYPE_ALIASES);
const courseMethodLookup = buildAliasLookup(COURSE_METHOD_ALIASES);

export const normalizeCourseType = (value) => {
  const text = normalizeText(value).toLowerCase();
  return courseTypeLookup.get(text) || normalizeText(value) || '';
};

export const normalizeCourseMethod = (value) => {
  const text = normalizeText(value).toLowerCase();
  return courseMethodLookup.get(text) || normalizeText(value) || '';
};

export const normalizeCampus = (value) => pickByAliases(value, campusList) || normalizeText(value);
export const normalizeCollege = (value) => pickByAliases(value, collegeList) || normalizeText(value);

export const toAgentCourseSearchArgs = (args = {}) => {
  const next = { ...args };
  if (next.course_type != null) next.course_type = normalizeCourseType(next.course_type);
  if (next.course_method != null) next.course_method = normalizeCourseMethod(next.course_method);
  if (next.campus != null) next.campus = normalizeCampus(next.campus);
  if (next.college != null) next.college = normalizeCollege(next.college);
  if (next.teacher != null) next.teacher = normalizeText(next.teacher);
  if (next.query != null) next.query = normalizeText(next.query);
  return next;
};

export const getAgentEnumHints = () => ({
  courseTypes: COURSE_TYPE_ALIASES.map(([canonical, ...aliases]) => [canonical, ...aliases]).flat(),
  courseMethods: COURSE_METHOD_ALIASES.map(([canonical, ...aliases]) => [canonical, ...aliases]).flat(),
  campusList,
  collegeList,
});
