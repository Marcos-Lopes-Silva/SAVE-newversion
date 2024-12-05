import Image from "next/image";
import ImageChart from "@/static/images/chart.svg";
import ImageEgresso from "@/static/images/egressos.svg";
import ImageGestor from "@/static/images/gestor.svg";
import ImageGraphic from "@/static/images/graphic.svg";
import ImageLogin from "@/static/images/logingoogle.svg";
import Link from "next/link";
import { t } from "i18next"

export default function About() {
  return (
    <section className="px-20 flex flex-col items-center gap-20">
      <div className="flex ">
        <div className="px-7 py-36 flex flex-col gap-3">
          <div className="px-3">
            <div className="w-20 h-1 rounded-lg bg-zinc-800 "></div>
          </div>
          <div className="w-20 h-1 rounded-lg bg-zinc-800"></div>
          <h2 className="font-semibold text-2xl">
            {t('about.title')}
          </h2>
          <p className="pr-10 text-zinc-700 text-lg">
            {t('about.description')}
          </p>
          <div>
            <button className="bg-black text-white rounded-lg w-20 py-1">
              <Link href={"/"}>{t('about.button')}</Link>
            </button>
          </div>
        </div>
        <Image className="px-12 py-5" src={ImageChart} alt="chart" />
      </div>
      <div className="px-3">
        <h2 className="font-semibold text-2xl text-center">
          {t('about.connecting')}
        </h2>
        <p className="text-zinc-700 text-lg text-center">
          {t('about.connecting_text')}
        </p>
      </div>
      <div className="flex items-center justify-center gap-14 py-10">
        <div className="flex flex-col ">
          <div className="rounded-lg shadow-md bg-[#ECEFF5] px-14 py-14 ">
            <div className="rounded-lg shadow-md bg-white px-16 py-11 max-w-80 flex flex-col gap-7 items-center">
              <Image className="px-3 " src={ImageEgresso} alt="egresso" />
              <div className=" font-semibold">{t('about.university')}</div>
              <p className="text-center">
                {t('about.university_text')}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg shadow-md bg-[#ECEFF5] px-12 py-12 ">
          <div className="rounded-lg shadow-md bg-white px-14 py-11 max-w-80 flex flex-col gap-3 items-center ">
            <Image className="px-3 " src={ImageGestor} alt="gestor" />
            <div className="text-center font-semibold">
              {t('about.educational')}
            </div>
            <p className="text-center">
              {t('about.educational_results')}
            </p>
          </div>
        </div>
      </div>
      <div className="w-3/4 h-[250px] bg-[#ECEFF5] rounded-tr-lg rounded-bl-lg rounded-br-full rounded-tl-full shadow-lgl items-center flex">
        <div className="z-10 relative bottom-11 ">
          <Image src={ImageGraphic} alt="graphic" />
        </div>
        <div className="pr-20 pb-34 pl-20 justify-center flex gap-2 flex-col">
          <h2 className="font-semibold text-2xl">{t('about.explore')}</h2>
          <p className="text-lg  text-start">
            {t('about.clicking_view')}
          </p>
          <button className="bg-black text-white rounded-lg w-20   ">
            {t('about.see')}
          </button>
        </div>
      </div>
      <div className="flex pr-24 ">
        <div className="px-7 py-5 flex flex-col gap-3 items-start">
          <h2 className="font-semibold text-2xl text-start">
            {t('about.academic_future')}
          </h2>
          <p className="pr-10 text-zinc-700 text-lg">
            {t('about.authentication')}
          </p>
          <div>
            <button className="bg-black text-white rounded-lg w-24 py-1">
              {t('about.learn_more')}
            </button>
          </div>
        </div>
        <Image className="px-12 py-5" src={ImageLogin} alt="login" />
      </div>
    </section>
  );
}
