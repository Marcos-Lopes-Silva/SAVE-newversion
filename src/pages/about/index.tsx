import Image from "next/image";
import ImageChart from "@/static/images/chart.svg";
import ImageEgresso from "@/static/images/egressos.svg";
import ImageGestor from "@/static/images/gestor.svg";
import ImageGraphic from "@/static/images/graphic.svg";
import ImageLogin from "@/static/images/logingoogle.svg";
import Link from "next/link";
import { t } from "i18next";

export default function About() {
  return (
    <section className="px-5 lg:px-20 flex flex-col items-center gap-10 lg:gap-20 bg-white dark:bg-background text-zinc-900 dark:text-zinc-100">

      {/* HERO */}
      <div className="flex flex-col lg:flex-row">
        <div className="px-7 py-16 lg:py-36 flex flex-col gap-3">
          <div className="px-3">
            <div className="w-20 h-1 rounded-lg bg-zinc-800 dark:bg-zinc-300"></div>
          </div>
          <div className="w-20 h-1 rounded-lg bg-zinc-800 dark:bg-zinc-300"></div>

          <h2 className="font-semibold text-xl lg:text-2xl">
            {t("about.title")}
          </h2>

          <p className="pr-10 text-zinc-700 dark:text-zinc-300 text-base lg:text-lg">
            {t("about.description")}
          </p>

          <div>
            <Link href={"/"}>
              <button className="bg-black text-white dark:bg-white dark:text-black rounded-lg w-20 py-1 transition">
                {t("about.button")}
              </button>
            </Link>
          </div>
        </div>

        <Image className="px-12 lg:py-12" src={ImageChart} alt="chart" />
      </div>

      {/* CONNECT */}
      <div className="px-3 mt-10 -mb-10 lg:-mt-10">
        <h2 className="font-semibold text-xl lg:text-2xl text-center">
          {t("about.connecting")}
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300 text-base lg:text-lg text-center">
          {t("about.connecting_text")}
        </p>
      </div>

      {/* CARDS */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14 py-10 lg:-mt-7">

        {/* CARD 1 */}
        <div className="flex flex-col">
          <div className="rounded-lg shadow-md bg-[#ECEFF5] dark:bg-zinc-800 px-7 py-10 lg:px-14 lg:py-14">
            <div className="rounded-lg shadow-md bg-white dark:bg-zinc-900 px-7 py-14 lg:px-16 lg:py-16 max-w-80 flex flex-col gap-8 items-center">
              <Image className="px-3" src={ImageEgresso} alt="egresso" />

              <div className="font-semibold text-zinc-900 dark:text-white">
                {t("about.university")}
              </div>

              <p className="text-center text-zinc-700 dark:text-zinc-300">
                {t("about.university_text")}
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="rounded-lg shadow-md bg-[#ECEFF5] dark:bg-zinc-800 px-7 py-10 lg:px-12 lg:py-12">
          <div className="rounded-lg shadow-md bg-white dark:bg-zinc-900 px-7 py-7 lg:px-16 lg:py-10 max-w-80 flex flex-col gap-4 items-center">
            <Image className="px-3" src={ImageGestor} alt="gestor" />

            <div className="text-center font-semibold text-zinc-900 dark:text-white">
              {t("about.educational")}
            </div>

            <p className="text-center text-zinc-700 dark:text-zinc-300">
              {t("about.educational_results")}
            </p>
          </div>
        </div>
      </div>

      {/* BANNER */}
      <div className="w-full lg:w-3/4 h-[185px] bg-[#ECEFF5] dark:bg-zinc-800 rounded-tr-lg rounded-bl-lg rounded-br-full rounded-tl-full shadow-lgl items-center flex lg:mt-10">

        <div className="z-10 relative">
          <Image src={ImageGraphic} alt="graphic" />
        </div>

        <div className="pr-16 lg:pr-20 lg:pb-34 pl-10 lg:pl-20 justify-center flex gap-2 flex-col">

          <h2 className="font-semibold text-xl lg:text-2xl">
            {t("about.explore")}
          </h2>

          <p className="text-sm lg:text-lg text-start text-zinc-700 dark:text-zinc-300">
            {t("about.clicking_view")}
          </p>

          <button className="bg-black text-white dark:bg-white dark:text-black rounded-lg w-20 mb-2 transition">
            {t("about.see")}
          </button>
        </div>
      </div>

      {/* LOGIN */}
      <div className="flex flex-col lg:flex-row pr-5 lg:pr-24">
        <div className="px-7 py-5 flex flex-col gap-3 items-start lg:mt-16">

          <h2 className="font-semibold text-xl lg:text-2xl text-start">
            {t("about.academic_future")}
          </h2>

          <p className="pr-10 text-zinc-700 dark:text-zinc-300 text-base lg:text-lg">
            {t("about.authentication")}
          </p>

          <div>
            <button className="bg-black text-white dark:bg-white dark:text-black rounded-lg w-24 py-1 transition">
              {t("about.learn_more")}
            </button>
          </div>
        </div>

        <Image className="px-12 py-5" src={ImageLogin} alt="login" />
      </div>
    </section>
  );
}