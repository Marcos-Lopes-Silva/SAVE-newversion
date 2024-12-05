import Navbar from "@/components/layout/Navbar";
import "@/styles/globals.css";
import { SessionProvider, useSession } from "next-auth/react";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import '../../i18n';
import { useRouter } from "next/router";
import { Loader } from "@/components/layout/Loader";
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from "../../redux/store";
import Footer from "@/components/layout/Footer";


export default function App({ Component, pageProps }: AppProps) {

    const auth = Component.auth;

    return (
        <NextAuthProvider>
            <Provider store={store}>
                <NextUIProvider>
                    <NextThemesProvider attribute="class" defaultTheme="dark">
                        <div className="flex flex-col min-h-screen">
                            <Navbar />
                            <ToastContainer />
                            <div className="flex-grow">
                                {auth ? <Auth redirectUrl={auth.unauthorized} role={auth.role} >{<Component {...pageProps} />}</Auth> : <Component {...pageProps} />}
                            </div>
                            <Footer />
                        </div>
                    </NextThemesProvider>
                </NextUIProvider>
            </Provider>
        </NextAuthProvider>
    )
}

type Props = {
    children: React.ReactNode;
    redirectUrl?: string;
    role?: string;
}

const NextAuthProvider = ({ children }: Props) => {
    return <SessionProvider>{children}</SessionProvider>
}


const Auth = ({ children, redirectUrl, role }: Props) => {
    const { push } = useRouter();
    const { data, status } = useSession();

    const user = data?.user;
    if (status === "loading") return <Loader />;
    if (status !== "authenticated") return push('/');
    if (user && user.role !== role && user.verified === true) return push(redirectUrl!!);

    return children;
}