import { createClient, PostgrestResponse } from '@supabase/supabase-js';
import 'dotenv/config';

interface DatabaseItem {
    id?: string;
    createdAt?: Date;
    [key: string]: any;
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('As variáveis de ambiente SUPABASE_URL ou SUPABASE_ANON_KEY não estão definidas.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
export { supabase };

const update = async <T extends DatabaseItem, U extends Partial<T>>(
    table: string, 
    data: U | U[], 
    id: string | null
): Promise<T[]> => {

    const dataToSend = Array.isArray(data) ? data : [data];

    //console.log('dados (originais): ', data);

    if (id !== null && dataToSend.length > 0) {
        dataToSend[0]!.id = id;
        console.log("id: ", dataToSend[0]!.id);
    }

    try {
        const { data: updatedData, error }: PostgrestResponse<T> = await supabase
            .from(table)
            .upsert(dataToSend as any)
            .select();

        console.log("Dados enviados:", dataToSend);

        if (error) {
            console.error("Erro ao atualizar dados:", error);
            throw error;
        }

        return updatedData as T[] || []; 
    } catch (erro) {
        console.log("Erro em salvar ou editar", erro);
        throw erro;
    }
};

const drop = async (table: string, id: string) => {
    try {
        console.log("id para excluir", id)
        return await supabase.from(table).delete().eq("id", id);
    } catch (error) {
        throw error
    }
    
};

const get = async <T extends DatabaseItem>(table: string, id: string): Promise<T | null> => {
    const { data, error }: PostgrestResponse<T> = await supabase
        .from(table)
        .select('*')
        .eq("id", id)
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }
    // Retorna o primeiro elemento
    return data && data.length > 0 ? data[0] as T : null;
};

const list = async <T extends DatabaseItem>(table: string): Promise<T[]> => {
    try {
        const { data, error }: PostgrestResponse<T> = await supabase
            .from(table)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
             console.error("Erro ao listar dados:", error);
             throw error;
        }
        
        // Retorna o array de dados ou um array vazio
        return data as T[] || []; 
    } catch (error) {
        console.error("Erro em listar dados", error);
        throw error;
    }
};

const save = async <T extends DatabaseItem, U extends Partial<T>>(table: string, data: U | U[]): Promise<T[]> => {
    console.log(data);
    return update<T, U>(table, data, null);
}

export {save, update, drop, get, list}