import { supabase } from '../lib/supabaseClient';

// Fetch translations for a specific language and format as a key-value object
export const fetchTranslations = async (languageCode) => {
  const { data, error } = await supabase
    .from('translations')
    .select('translation_key, translation_value')
    .eq('language_code', languageCode);

  if (error) {
    console.error('Error fetching translations from Supabase:', error);
    return {};
  }

  // Convert array of database rows into a flat { "key": "value" } dictionary object
  return data.reduce((acc, row) => {
    acc[row.translation_key] = row.translation_value;
    return acc;
  }, {});
};
