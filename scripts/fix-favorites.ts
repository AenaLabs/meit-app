/**
 * Script para resetear todos los favoritos a false en la base de datos
 * Esto soluciona el problema donde los comercios aparecen como favoritos sin haberlo sido
 *
 * IMPORTANTE: Este script reseteará TODOS los favoritos. Si tienes favoritos reales,
 * tendrás que marcarlos de nuevo desde la app.
 *
 * Para ejecutar:
 * npx tsx scripts/fix-favorites.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Faltan variables de entorno');
    console.error('Asegúrate de tener EXPO_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tu archivo .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetFavorites() {
    console.log('🔄 Reseteando todos los favoritos...\n');

    try {
        // Primero, obtener todos los registros que tienen is_favorite = true
        const { data: currentFavorites, error: fetchError } = await supabase
            .from('customer_businesses')
            .select('id, customer_id, business_settings_id, business_settings:business_settings_id(name)')
            .eq('is_favorite', true);

        if (fetchError) {
            throw fetchError;
        }

        if (!currentFavorites || currentFavorites.length === 0) {
            console.log('✅ No hay favoritos marcados en la base de datos. Todo está limpio!');
            return;
        }

        console.log(`📋 Se encontraron ${currentFavorites.length} comercios marcados como favoritos:\n`);
        currentFavorites.forEach((fav: any, index) => {
            console.log(`${index + 1}. ${fav.business_settings?.name || 'Sin nombre'} (ID: ${fav.id})`);
        });

        console.log('\n🔧 Reseteando a false...\n');

        // Resetear todos a false
        const { error: updateError } = await supabase
            .from('customer_businesses')
            .update({
                is_favorite: false,
                updated_at: new Date().toISOString()
            })
            .eq('is_favorite', true);

        if (updateError) {
            throw updateError;
        }

        console.log(`✅ ¡Éxito! Se resetearon ${currentFavorites.length} favoritos.`);
        console.log('📱 Ahora puedes marcar tus comercios favoritos reales desde la app.');

    } catch (error: any) {
        console.error('❌ Error al resetear favoritos:', error.message);
        process.exit(1);
    }
}

// Ejecutar el script
resetFavorites()
    .then(() => {
        console.log('\n✨ Script completado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    });
