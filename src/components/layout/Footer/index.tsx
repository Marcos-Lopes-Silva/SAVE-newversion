import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="w-full static bottom-0 flex gap-14 flex-col mt-10 py-12 bg-zinc-900 text-white md:py-8 lg:py-12 lg:px-32 align-middle">
            <div className="flex flex-col items-center gap-2 mb-4 md:mb-0 lg:mb-0">
                <p className="text-xl w-full text-center font-semibold">SAVE</p>
                <Link href={'/policy'} className="text-sm text-center lg:text-left">{t('footer.about')}</Link>
                <Link href={"mailto:egressas4@gmail.com"} className="w-full text-sm text-center">{t('footer.contact')}</Link>
            </div>
            {/* 
            <div className="flex justify-center gap-4 mt-6 mb-4 md:mb-0 lg:mb-0">
                <Link className="cursor-pointer hover:opacity-80 rounded-full py-2 px-2 h-10">
                    <FaFacebook color="white" size={25} />
                </Link>
                <Link className="cursor-pointer hover:opacity-80 rounded-full py-2 px-2 h-10">
                    <FaInstagram size={25} />
                </Link>
                <Link className="cursor-pointer hover:opacity-80 rounded-full py-2 px-2 h-10">
                    <FaTwitter size={25} />
                </Link>
            </div> */}

            <div className="flex flex-col items-center gap-2 text-sm md:flex-row md:justify-center lg:flex-col">
                <p className="text-center lg:text-right">Copyright @ 2023 SAVE itd.</p>
                <p className="text-center lg:text-right">{t('footer.rights')}</p>
            </div>
        </footer>
    )
}