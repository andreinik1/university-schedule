import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tvnpnqbavodftcgeqert.supabase.co';
const supabaseKey = 'sb_publishable_YS1PtMUjkS9_kEZZfKWePw_KlRBN4vg';

export const supabase = createClient(supabaseUrl, supabaseKey);