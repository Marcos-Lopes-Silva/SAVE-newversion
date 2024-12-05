import Button from "@/components/layout/Button";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub } from "react-icons/fa";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import loginImage from "@/static/images/login.svg";
import { useRouter } from "next/router";

export default function Login() {
    const { t } = useTranslation();
    const [role, setRole] = useState<string>('user');
    const { push } = useRouter();
    const { data: session, status } = useSession();

    const login = (provider: string) => {
        localStorage.setItem('role', role);
        signIn(provider, { callbackUrl: `/authenticate` } );
    }

    useEffect(() => {
        if (status === 'authenticated') push('/authenticate');
    }, [status])

    return (
        <main className="flex p-24 m-20 mr-72 ml-72 shadow-lg rounded-3xl gap-40">
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
                <Image src={loginImage} alt="Survey"/>
            </section>
            <section className="flex flex-col gap-11 max-w-2xl">
                <h2 className="font-bold text-3xl pl-1 mb-5 dark:text-white">
                    {t('login.welcome')}
                </h2>
                <p className="text-gray-500 font-semibold dark:text-gray-300">
                    {t('login.make_login')}
                </p>
                <div className="flex flex-col gap-4 ">
                    <div className="border-b-2 border-gray-300 flex gap-3">
                        <input type="button" className={`cursor-pointer min-w-24 flex justify-start text-gray-300 dark:text-gray-400 font-semibold text-sm hover:text-gray-800 dark:hover:text-gray-600 ${role == 'user' ? 'border-zinc-900 border-b-2 text-gray-800 dark:text-gray-100' : ''}`} onClick={() => setRole('user')} value={t('login.egress')}/>
                        <input type="button" className={`cursor-pointer min-w-24 flex justify-start text-gray-300 font-semibold dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-600 ${role == 'admin' ? 'border-zinc-900 border-b-2 text-gray-800 dark:text-gray-100' : ''}`} onClick={() => setRole('admin')} value={t('login.manager')}/>
                    </div>
                    <Button onClick={() => login('google')}><FcGoogle size={20}/>{t('login.google')}</Button>
                    <Button onClick={() => login('github')}><FaGithub size={20}/>{t('login.github')}</Button>
                    <Button onClick={() => login('facebook')}><FaFacebook size={20}/>{t('login.facebook')}</Button>
                </div>
            </section>
        </main>
    )
}


// Compare this snippet from src/pages/login/index.tsx: