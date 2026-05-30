import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Paste your keys from the Supabase API settings page here:
const supabaseUrl = 'https://jzfvwomcpmikefmrntjy.supabase.co';
const supabaseAnonKey = 'sb_publishable_ukGO6eANgML_ovtZ3ThivA_KGgn219j';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);