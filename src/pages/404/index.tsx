import { t } from "i18next"

export default function Custom404() {
    return (
        <main className="flex items-center justify-center min-h-full">
            <h1>{t('404.error')}</h1>
        </main>
    )
}