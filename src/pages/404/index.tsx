import { t } from "i18next";
import Link from "next/link";

export default function Custom404() {
    return (
        <main className="flex flex-col items-center justify-center min-h-[calc(100vh-390px)] text-center p-6">
            <h1 className="text-6xl font-bold text-gray-800 animate-pulse">404</h1>
            <p className="text-xl text-gray-600 mt-4">{t("404.error")}</p>
            <p className="text-gray-500 mt-2">{t("404.message", "A página que você procura não foi encontrada ou pode ter sido movida.")}</p>

            <Link
                href="/"
                className="mt-6 px-6 py-2 text-white bg-zinc-800 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
                {t("404.back", "Voltar para a Home")}
            </Link>
        </main>
    );
}