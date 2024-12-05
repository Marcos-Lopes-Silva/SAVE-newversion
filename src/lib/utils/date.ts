import { t } from "i18next";

export function timeAgoInHours(dateString: string): string { 
    const now = new Date();
    const pastDate = new Date(dateString);

    // Calcula a diferença em milissegundos
    const differenceInMs = now.getTime() - pastDate.getTime();

    // Converte de milissegundos para horas
    const differenceInHours = Math.floor(differenceInMs / (1000 * 60 * 60));

    return `${differenceInHours}h ${t('admin.dashboard.time_ago')}`;
}