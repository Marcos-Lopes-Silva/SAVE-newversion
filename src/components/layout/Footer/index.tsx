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
        <footer className="w-full static bottom-0 flex mt-14 gap-96 py-24 bg-zinc-900">
            <div className="pl-24 flex flex-col gap-5">
                <p className="text-sm text-white ">Copyright @ 2023 SAVE itd.</p>
                <p className="text-sm text-white ">{t('footer.rights')}</p>
            </div>
            <div className="flex flex-col gap-5">
                <p className="-mt-12 text-white text-xl font-semibold">SAVE</p>
                <p className="text-sm text-white ">{t('footer.about')}</p>
                <p className="text-sm text-white ">{t('footer.contact')}</p>
            </div>
            <div className="flex gap-4">
                <div className="bg-white rounded-full py-2 px-2 h-10">
                    <FaFacebook size={25} />
                </div>
                <div className="bg-white rounded-full py-2 px-2 h-10">
                    <FaInstagram size={25} />
                </div>
                <div className="bg-white rounded-full py-2 px-2 h-10">
                    <FaTwitter size={25} />
                </div>
            </div>
        </footer >
    )
}