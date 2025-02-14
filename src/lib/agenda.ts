import { Agenda, Job } from '@hokify/agenda';
import { transporter } from './mailer';

import mongoose from 'mongoose';
import { connectToMongoDB } from './db';
import { ReactNode } from 'react';

const mongodb = process.env.MONGODB_URI;

if (!mongodb) {
    throw new Error('MongoDB URI is missing');
}

const agenda = new Agenda({
    db: { address: mongodb }
});

agenda.define('send email', async (job: Job) => {
    await connectToMongoDB();

    const { to, subject, text } = job.attrs.data as { to: string, subject: string, text: string };

    console.log(`Enviando email para ${to}`);

    await transporter.sendMail({ to, subject, html: text });
    console.log('Email enviado com sucesso');
});

agenda.define('update database field', async (job: Job) => {
    await connectToMongoDB(); // Certifique-se de que a conexão MongoDB está funcionando corretamente

    const { collection, id, field, value } = job.attrs.data as {
        collection: string;
        id: string;
        field: string; // Pode ser do tipo string, pois refere-se ao campo do documento
        value: any;
    };

    console.log(collection, id, field, value);

    try {
        // Verifica se o modelo já foi registrado, para evitar recriá-lo
        const Model = mongoose.models[collection] || mongoose.model(collection, new mongoose.Schema({}, { strict: false }));

        // Busca o documento pelo ID
        const result = await Model.findById(id);

        if (!result) {
            console.log(`Documento com ID ${id} não encontrado na coleção ${collection}`);
            return;
        }

        // Atualiza o campo específico com o valor passado
        result.set(field, value);

        console.log(result);
        // Salva o documento atualizado
        await result.save();

        console.log('Documento atualizado:', result);

        return result;
    } catch (error) {
        console.error('Erro ao atualizar o documento:', error);
    }
});

(
    async function () {
        await agenda.start();
    }
)();

export default agenda;