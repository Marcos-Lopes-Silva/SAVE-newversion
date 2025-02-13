import { useTranslation } from "react-i18next";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { useRouter } from "next/router";

export default function Footer() {
    const { t } = useTranslation();
    const { push } = useRouter();

    const sendEmail = () => {
        window.location.href = "mailto:egressas4@gmail.com";
    };

    return (
        <footer className="w-full static bottom-0 flex flex-col mt-10 py-12 bg-zinc-900 text-white md:py-8 lg:flex-row lg:justify-between lg:py-24 lg:px-32 align-middle">
            <div className="flex flex-col items-center gap-2 mb-4 md:mb-0 lg:items-start lg:mb-0">
                <p className="text-xl font-semibold">SAVE</p>
                <p className="text-sm text-center lg:text-left">{t('footer.about')}</p>
                <p className="text-sm text-center lg:text-left" onClick={sendEmail}>{t('footer.contact')}</p>
            </div>

            <div className="flex justify-center gap-4 mt-6 mb-4 md:mb-0 lg:mb-0">
                <div className="rounded-full py-2 px-2 h-10">
                    <FaFacebook color="white" size={25} />
                </div>
                <div className="rounded-full py-2 px-2 h-10">
                    <FaInstagram size={25} />
                </div>
                <div className="rounded-full py-2 px-2 h-10">
                    <FaTwitter size={25} />
                </div>
            </div>

            <div className="flex flex-col items-center gap-2 text-sm md:flex-row md:justify-center lg:flex-col lg:items-end">
                <p className="text-center lg:text-right">Copyright @ 2023 SAVE itd.</p>
                <p className="text-center lg:text-right">{t('footer.rights')}</p>
            </div>
        </footer>
    )
}