import Button from "@/components/layout/Button";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub } from "react-icons/fa";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import loginImage from "@/static/images/login.svg";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

export default function Login() {
    const { t } = useTranslation();
    const [role, setRole] = useState<string>('user');
    const { push } = useRouter();
    const { data: session, status } = useSession();

    const login = (provider: string) => {
        localStorage.setItem('role', role);
        signIn(provider, { callbackUrl: `/authenticate` });
    }

    useEffect(() => {
        if (status === 'authenticated') push('/authenticate');
    }, [status])

    return (  // flex flex-col min-h-screen p-4 w-full max-w-screen-lg mx-auto md:p-8 lg:p-16 md:flex-row md:items-start md:justify-between
        <main className="flex flex-col gap-16 p-4 w-full min-h-screen  md:flex-row lg:p-20 justify-center lg:gap-20">
            <section className="flex flex-col gap-5">
                <h2 className={"font-bold text-3xl pl-2 mb-3 dark:text-white"}>
                    SAVE
                </h2>
                <p className="font-semibold text-gray-500">
                    {t('login.diference')}
                </p>
                <p className="font-semibold text-gray-500">
                    {t('login.difficult')}
                </p>
                <Button onClick={() => push('about')} className="max-w-32">{t('login.find_out_more')}</Button>
                <Image src={loginImage} alt="Survey" />
            </section>
            <section className="flex flex-col gap-5 max-w-2xl">
                <h2 className="font-bold text-3xl pl-1 mb-5 dark:text-white">
                    {t('login.welcome')}
                </h2>
                <p className="text-gray-500 font-semibold dark:text-gray-300">
                    {t('login.make_login')}
                </p>
                <div className="relative">
                    <div className="flex gap-3 border-b-2 border-gray-300">
                        <button
                            className={`cursor-pointer min-w-24 text-sm font-semibold dark:text-gray-400 ${role === 'user' ? 'text-gray-800 dark:text-white' : 'text-gray-300 dark:hover:text-gray-600'
                                }`}
                            onClick={() => setRole('user')}
                        >
                            {t('login.egress')}
                        </button>
                        <button
                            className={`cursor-pointer min-w-24 text-sm font-semibold dark:text-gray-400 ${role === 'admin' ? 'text-gray-800 dark:text-white' : 'text-gray-300 dark:hover:text-gray-600'
                                }`}
                            onClick={() => setRole('admin')}
                        >
                            {t('login.manager')}
                        </button>
                    </div>
                    <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute bottom-0 h-1 bg-zinc-900"
                        style={{
                            width: role === "user" ? "15%" : "17%",
                            left: role === "user" ? "0%" : "16%",
                        }}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <Button onClick={() => login('google')}><FcGoogle size={20} />{t('login.google')}</Button>
                    <Button onClick={() => login('github')}><FaGithub size={20} />{t('login.github')}</Button>
                    <Button onClick={() => login('facebook')}><FaFacebook size={20} />{t('login.facebook')}</Button>
                </div>
            </section>
        </main>
    )
}

